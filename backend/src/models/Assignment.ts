import mongoose, { Document, Schema } from 'mongoose';
import { AssignmentInput, GeneratedPaper, JobStatus } from '../types';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: Date;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  fileContent?: string;
  duration?: string;
  jobId: string;
  jobStatus: JobStatus;
  generatedPaper?: GeneratedPaper;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema({
  id: String,
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
  type: { type: String, required: true },
  options: [String],
  answer: String,
});

const SectionSchema = new Schema({
  id: String,
  title: { type: String, required: true },
  instruction: String,
  totalMarks: Number,
  questions: [QuestionSchema],
});

const GeneratedPaperSchema = new Schema({
  title: String,
  subject: String,
  totalMarks: Number,
  duration: String,
  instructions: [String],
  sections: [SectionSchema],
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: [{ type: String }],
    numberOfQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    difficulty: { type: String, required: true },
    additionalInstructions: String,
    fileContent: String,
    duration: String,
    jobId: { type: String, required: true, unique: true, index: true },
    jobStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaper: GeneratedPaperSchema,
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
