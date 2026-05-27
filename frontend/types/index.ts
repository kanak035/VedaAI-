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

export interface AssignmentFormData {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  additionalInstructions?: string;
  duration?: string;
  file?: File | null;
}

export type JobStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface AssignmentState {
  currentJobId: string | null;
  jobStatus: JobStatus;
  progress: number;
  statusMessage: string;
  generatedPaper: GeneratedPaper | null;
  formData: AssignmentFormData | null;
  error: string | null;
  assignments: AssignmentListItem[];
}

export interface AssignmentListItem {
  _id: string;
  jobId: string;
  title: string;
  subject: string;
  jobStatus: JobStatus;
  createdAt: string;
  numberOfQuestions: number;
  totalMarks: number;
}

export interface WebSocketMessage {
  type: 'connected' | 'job_status' | 'job_progress' | 'job_completed' | 'job_failed' | 'pong';
  jobId?: string;
  status?: JobStatus;
  progress?: number;
  message?: string;
  data?: GeneratedPaper;
  error?: string;
  clientId?: string;
}
