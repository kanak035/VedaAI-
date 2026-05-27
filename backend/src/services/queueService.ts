import { Queue, Worker, Job } from 'bullmq';
import { AssignmentInput } from '../types';
import { generateAssessment, generateMockAssessment } from './aiService';
import { Assignment } from '../models/Assignment';
import { broadcastToJob } from '../config/websocket';

let assessmentQueue: Queue | null = null;
let assessmentWorker: Worker | null = null;

const QUEUE_NAME = 'assessment-generation';

export const getQueue = (): Queue | null => assessmentQueue;

const getRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password || undefined,
    maxRetriesPerRequest: null as null,
    enableReadyCheck: false,
  };
};

export const initQueue = (): void => {
  try {
    const connection = getRedisConnection();

    assessmentQueue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    assessmentWorker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        return processAssessmentJob(job);
      },
      {
        connection,
        concurrency: 3,
      }
    );

    assessmentWorker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    assessmentWorker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    console.log('✅ BullMQ queue initialized');
  } catch (error) {
    console.warn('⚠️  BullMQ not available (Redis required):', error);
  }
};

const processAssessmentJob = async (job: Job): Promise<void> => {
  const { jobId, input } = job.data as { jobId: string; input: AssignmentInput };

  try {
    // Update status to processing
    await Assignment.findOneAndUpdate({ jobId }, { jobStatus: 'processing' });
    broadcastToJob(jobId, {
      type: 'job_status',
      jobId,
      status: 'processing',
      progress: 10,
      message: 'Starting AI generation...',
    });

    await job.updateProgress(10);

    broadcastToJob(jobId, {
      type: 'job_progress',
      jobId,
      progress: 40,
      message: 'Generating questions with AI...',
    });

    await job.updateProgress(40);

    // Generate the assessment
    let generatedPaper;
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      generatedPaper = await generateAssessment(input);
    } else {
      // Use mock generator if no API key
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate delay
      generatedPaper = generateMockAssessment(input);
    }

    await job.updateProgress(80);
    broadcastToJob(jobId, {
      type: 'job_progress',
      jobId,
      progress: 80,
      message: 'Structuring question paper...',
    });

    // Store result
    await Assignment.findOneAndUpdate(
      { jobId },
      { jobStatus: 'completed', generatedPaper }
    );

    await job.updateProgress(100);
    broadcastToJob(jobId, {
      type: 'job_completed',
      jobId,
      status: 'completed',
      progress: 100,
      message: 'Assessment generated successfully!',
      data: generatedPaper,
    });
  } catch (error: any) {
    await Assignment.findOneAndUpdate({ jobId }, { jobStatus: 'failed' });
    broadcastToJob(jobId, {
      type: 'job_failed',
      jobId,
      status: 'failed',
      error: error.message || 'Generation failed',
    });
    throw error;
  }
};

export const addAssessmentJob = async (
  jobId: string,
  input: AssignmentInput
): Promise<void> => {
  if (!assessmentQueue) {
    // Fallback: process directly without queue
    console.log('Processing without queue (Redis unavailable)');
    setTimeout(async () => {
      try {
        await Assignment.findOneAndUpdate({ jobId }, { jobStatus: 'processing' });
        broadcastToJob(jobId, {
          type: 'job_status',
          jobId,
          status: 'processing',
          progress: 10,
          message: 'Starting generation...',
        });

        let generatedPaper;
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
          generatedPaper = await generateAssessment(input);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          generatedPaper = generateMockAssessment(input);
        }

        broadcastToJob(jobId, {
          type: 'job_progress',
          jobId,
          progress: 80,
          message: 'Finalizing...',
        });

        await Assignment.findOneAndUpdate(
          { jobId },
          { jobStatus: 'completed', generatedPaper }
        );

        broadcastToJob(jobId, {
          type: 'job_completed',
          jobId,
          status: 'completed',
          progress: 100,
          message: 'Assessment generated!',
          data: generatedPaper,
        });
      } catch (error: any) {
        await Assignment.findOneAndUpdate({ jobId }, { jobStatus: 'failed' });
        broadcastToJob(jobId, {
          type: 'job_failed',
          jobId,
          status: 'failed',
          error: error.message,
        });
      }
    }, 100);
    return;
  }

  await assessmentQueue.add('generate', { jobId, input }, { jobId });
};
