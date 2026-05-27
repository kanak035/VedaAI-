import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { addAssessmentJob } from '../services/queueService';
import { getRedisClient } from '../config/redis';

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(z.string()).min(1, 'At least one question type required'),
  numberOfQuestions: z.number().int().min(1).max(100),
  totalMarks: z.number().int().min(1).max(1000),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  additionalInstructions: z.string().optional(),
  duration: z.string().optional(),
});

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Parse numeric fields that may come as strings from FormData
    if (body.numberOfQuestions) body.numberOfQuestions = Number(body.numberOfQuestions);
    if (body.totalMarks) body.totalMarks = Number(body.totalMarks);
    if (body.questionTypes && typeof body.questionTypes === 'string') {
      body.questionTypes = JSON.parse(body.questionTypes);
    }

    const validation = CreateAssignmentSchema.safeParse(body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const input = validation.data;
    const jobId = uuidv4();

    // Extract file content if uploaded
    let fileContent: string | undefined;
    if (req.file) {
      fileContent = req.file.buffer.toString('utf-8').substring(0, 5000);
    }

    // Save assignment to DB
    const assignment = new Assignment({
      ...input,
      dueDate: new Date(input.dueDate),
      jobId,
      jobStatus: 'pending',
      fileContent,
    });
    await assignment.save();

    // Add to processing queue
    await addAssessmentJob(jobId, { ...input, fileContent });

    res.status(201).json({
      success: true,
      data: {
        jobId,
        assignmentId: assignment._id,
        status: 'pending',
        message: 'Assignment created. Generation started.',
      },
    });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

export const getAssignmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    // Check Redis cache first
    let cached: string | null = null;
    try {
      const redis = getRedisClient();
      cached = await redis.get(`assignment:${jobId}`);
    } catch {
      // Redis unavailable
    }

    if (cached) {
      res.json({ success: true, data: JSON.parse(cached), fromCache: true });
      return;
    }

    const assignment = await Assignment.findOne({ jobId });
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    const responseData = {
      jobId: assignment.jobId,
      assignmentId: assignment._id,
      title: assignment.title,
      subject: assignment.subject,
      status: assignment.jobStatus,
      generatedPaper: assignment.generatedPaper,
      createdAt: assignment.createdAt,
    };

    // Cache completed results
    if (assignment.jobStatus === 'completed') {
      try {
        const redis = getRedisClient();
        await redis.setex(`assignment:${jobId}`, 3600, JSON.stringify(responseData));
      } catch {
        // Redis unavailable
      }
    }

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find({}, { generatedPaper: 0, fileContent: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(),
    ]);

    res.json({
      success: true,
      data: assignments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const regenerateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const assignment = await Assignment.findOne({ jobId });

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    const newJobId = uuidv4();
    const newAssignment = new Assignment({
      title: assignment.title,
      subject: assignment.subject,
      gradeLevel: assignment.gradeLevel,
      dueDate: assignment.dueDate,
      questionTypes: assignment.questionTypes,
      numberOfQuestions: assignment.numberOfQuestions,
      totalMarks: assignment.totalMarks,
      difficulty: assignment.difficulty,
      additionalInstructions: assignment.additionalInstructions,
      fileContent: assignment.fileContent,
      duration: assignment.duration,
      jobId: newJobId,
      jobStatus: 'pending',
    });

    await newAssignment.save();

    const input = {
      title: assignment.title,
      subject: assignment.subject,
      gradeLevel: assignment.gradeLevel,
      dueDate: assignment.dueDate.toISOString(),
      questionTypes: assignment.questionTypes,
      numberOfQuestions: assignment.numberOfQuestions,
      totalMarks: assignment.totalMarks,
      difficulty: assignment.difficulty as any,
      additionalInstructions: assignment.additionalInstructions,
      fileContent: assignment.fileContent,
      duration: assignment.duration,
    };

    await addAssessmentJob(newJobId, input);

    // Invalidate cache
    try {
      const redis = getRedisClient();
      await redis.del(`assignment:${jobId}`);
    } catch {
      // Redis unavailable
    }

    res.json({
      success: true,
      data: { jobId: newJobId, assignmentId: newAssignment._id, status: 'pending' },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
