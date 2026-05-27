export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false';
  options?: string[];
  answer?: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  totalMarks: number;
  questions: Question[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  instructions: string[];
  sections: Section[];
}

export interface AssignmentInput {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  additionalInstructions?: string;
  fileContent?: string;
  duration?: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface WebSocketMessage {
  type: 'job_status' | 'job_progress' | 'job_completed' | 'job_failed';
  jobId: string;
  status?: JobStatus;
  progress?: number;
  message?: string;
  data?: GeneratedPaper;
  error?: string;
}
