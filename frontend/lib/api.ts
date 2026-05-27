import axios from 'axios';
import { AssignmentFormData } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const createAssignment = async (
  data: AssignmentFormData
): Promise<{ jobId: string; assignmentId: string }> => {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('subject', data.subject);
  formData.append('gradeLevel', data.gradeLevel);
  formData.append('dueDate', data.dueDate);
  formData.append('questionTypes', JSON.stringify(data.questionTypes));
  formData.append('numberOfQuestions', String(data.numberOfQuestions));
  formData.append('totalMarks', String(data.totalMarks));
  formData.append('difficulty', data.difficulty);
  if (data.additionalInstructions) {
    formData.append('additionalInstructions', data.additionalInstructions);
  }
  if (data.duration) {
    formData.append('duration', data.duration);
  }
  if (data.file) {
    formData.append('file', data.file);
  }

  const response = await api.post('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data;
};

export const getAssignmentStatus = async (jobId: string) => {
  const response = await api.get(`/assignments/${jobId}/status`);
  return response.data.data;
};

export const getAllAssignments = async (page = 1, limit = 10) => {
  const response = await api.get(`/assignments?page=${page}&limit=${limit}`);
  return response.data;
};

export const regenerateAssignment = async (jobId: string) => {
  const response = await api.post(`/assignments/${jobId}/regenerate`);
  return response.data.data;
};
