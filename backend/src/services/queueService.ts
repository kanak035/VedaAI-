import { AssignmentInput } from '../types';
import { generateAssessment, generateMockAssessment } from './aiService';
import { Assignment } from '../models/Assignment';
import { broadcastToJob } from '../config/websocket';

export const initQueue = (): void => {
  console.log('✅ Direct processing mode (no Redis required)');
};

const processJob = async (jobId: string, input: AssignmentInput): Promise<void> => {
  try {
    await Assignment.findOneAndUpdate({ jobId }, { jobStatus: 'processing' });
    broadcastToJob(jobId, {
      type: 'job_status', jobId, status: 'processing', progress: 10,
      message: 'Starting AI generation...',
    });

    broadcastToJob(jobId, {
      type: 'job_progress', jobId, progress: 40,
      message: 'Generating questions with AI...',
    });

    let generatedPaper;
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      generatedPaper = await generateAssessment(input);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      generatedPaper = generateMockAssessment(input);
    }

    broadcastToJob(jobId, {
      type: 'job_progress', jobId, progress: 80,
      message: 'Structuring question paper...',
    });

    await Assignment.findOneAndUpdate(
      { jobId },
      { jobStatus: 'completed', generatedPaper }
    );

    broadcastToJob(jobId, {
      type: 'job_completed', jobId, status: 'completed', progress: 100,
      message: 'Assessment generated successfully!',
      data: generatedPaper,
    });

    console.log(`✅ Job ${jobId} completed`);
  } catch (error: any) {
    console.error(`❌ Job ${jobId} failed:`, error.message);
    await Assignment.findOneAndUpdate({ jobId }, { jobStatus: 'failed' });
    broadcastToJob(jobId, {
      type: 'job_failed', jobId, status: 'failed',
      error: error.message || 'Generation failed',
    });
  }
};

export const addAssessmentJob = async (
  jobId: string,
  input: AssignmentInput
): Promise<void> => {
  // Process asynchronously so HTTP response returns immediately
  setImmediate(() => processJob(jobId, input));
};
