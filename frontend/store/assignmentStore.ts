import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  AssignmentState,
  AssignmentFormData,
  GeneratedPaper,
  JobStatus,
  AssignmentListItem,
} from '@/types';

interface AssignmentActions {
  setCurrentJobId: (jobId: string | null) => void;
  setJobStatus: (status: JobStatus) => void;
  setProgress: (progress: number) => void;
  setStatusMessage: (message: string) => void;
  setGeneratedPaper: (paper: GeneratedPaper | null) => void;
  setFormData: (data: AssignmentFormData | null) => void;
  setError: (error: string | null) => void;
  setAssignments: (assignments: AssignmentListItem[]) => void;
  resetJob: () => void;
  startNewAssignment: () => void;
}

const initialState: AssignmentState = {
  currentJobId: null,
  jobStatus: 'idle',
  progress: 0,
  statusMessage: '',
  generatedPaper: null,
  formData: null,
  error: null,
  assignments: [],
};

export const useAssignmentStore = create<AssignmentState & AssignmentActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setCurrentJobId: (jobId) => set({ currentJobId: jobId }),
        setJobStatus: (status) => set({ jobStatus: status }),
        setProgress: (progress) => set({ progress }),
        setStatusMessage: (message) => set({ statusMessage: message }),
        setGeneratedPaper: (paper) => set({ generatedPaper: paper }),
        setFormData: (data) => set({ formData: data }),
        setError: (error) => set({ error }),
        setAssignments: (assignments) => set({ assignments }),

        resetJob: () =>
          set({
            currentJobId: null,
            jobStatus: 'idle',
            progress: 0,
            statusMessage: '',
            error: null,
          }),

        startNewAssignment: () =>
          set({
            ...initialState,
          }),
      }),
      {
        name: 'vedaai-assignment',
        partialize: (state) => ({
          currentJobId: state.currentJobId,
          jobStatus: state.jobStatus,
          generatedPaper: state.generatedPaper,
          formData: state.formData,
        }),
      }
    )
  )
);
