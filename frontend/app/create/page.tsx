'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';
import AssignmentForm from '@/components/forms/AssignmentForm';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { createAssignment, getAssignmentStatus } from '@/lib/api';
import { AssignmentFormData } from '@/types';

export default function CreatePage() {
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    currentJobId, jobStatus, progress, statusMessage,
    generatedPaper, error,
    setCurrentJobId, setJobStatus, setProgress, setStatusMessage,
    setGeneratedPaper, setFormData, setError, resetJob,
  } = useAssignmentStore();

  useWebSocket(currentJobId);

  // Poll job status every 3 seconds as fallback
  useEffect(() => {
    if (!currentJobId) return;
    if (jobStatus === 'completed' || jobStatus === 'failed') return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await getAssignmentStatus(currentJobId);
        if (data.status === 'completed' && data.generatedPaper) {
          setJobStatus('completed');
          setProgress(100);
          setStatusMessage('Assessment generated successfully!');
          setGeneratedPaper(data.generatedPaper);
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === 'failed') {
          setJobStatus('failed');
          setError('Generation failed');
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === 'processing') {
          setJobStatus('processing');
          if (progress < 80) setProgress(Math.min(progress + 10, 80));
          setStatusMessage('Generating questions with AI...');
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [currentJobId, jobStatus]);

  // Redirect to result when completed
  useEffect(() => {
    if (jobStatus === 'completed' && generatedPaper && currentJobId) {
      if (pollRef.current) clearInterval(pollRef.current);
      setTimeout(() => router.push(`/result/${currentJobId}`), 1000);
    }
  }, [jobStatus, generatedPaper, currentJobId, router]);

  const handleSubmit = async (data: AssignmentFormData) => {
    try {
      resetJob();
      setFormData(data);
      setJobStatus('pending');
      setProgress(5);
      setStatusMessage('Creating assignment...');
      const result = await createAssignment(data);
      setCurrentJobId(result.jobId);
      setJobStatus('processing');
      setProgress(15);
      setStatusMessage('AI is generating your questions...');
      toast.success('Assessment generation started!');
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to create assignment';
      setError(message);
      setJobStatus('failed');
      toast.error(message);
    }
  };

  const isGenerating = jobStatus === 'pending' || jobStatus === 'processing';

  return (
    <div className="animated-bg" style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: 100, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            style={{ textAlign:'center', marginBottom: 48 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'8px 18px', borderRadius:999,
              background:'rgba(26,26,46,0.85)',
              border:'1px solid rgba(108,99,255,0.25)',
              color:'#A78BFA', fontSize:13, fontWeight:500, marginBottom:20,
            }}>
              <Sparkles size={14} />
              AI Assessment Creator
            </div>
            <h1 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, color:'white', marginBottom:12 }}>
              Create New Assessment
            </h1>
            <p style={{ fontSize:15, color:'#9CA3AF', lineHeight:1.7 }}>
              Fill in the details and let AI generate a structured question paper for you.
            </p>
          </motion.div>

          {/* Status banners */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div key="generating"
                initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                style={{
                  background:'rgba(26,26,46,0.9)',
                  border:'1px solid rgba(139,92,246,0.35)',
                  borderRadius:16, padding:'20px 24px', marginBottom:24,
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
                  <div style={{
                    width:42, height:42, borderRadius:'50%',
                    background:'rgba(139,92,246,0.15)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Loader2 size={20} color="#A78BFA" style={{ animation:'spin 0.8s linear infinite' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight:600, color:'white', marginBottom:2 }}>Generating your assessment…</p>
                    <p style={{ fontSize:13, color:'#9CA3AF' }}>{statusMessage || 'Please wait, this may take up to 60 seconds'}</p>
                  </div>
                </div>
                <ProgressBar progress={progress} />
              </motion.div>
            )}

            {jobStatus === 'completed' && (
              <motion.div key="done"
                initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                style={{
                  background:'rgba(16,185,129,0.08)',
                  border:'1px solid rgba(16,185,129,0.3)',
                  borderRadius:16, padding:'20px 24px', marginBottom:24,
                  display:'flex', alignItems:'center', gap:14,
                }}>
                <CheckCircle size={28} color="#10B981" />
                <div>
                  <p style={{ fontWeight:600, color:'#10B981', marginBottom:2 }}>Assessment generated!</p>
                  <p style={{ fontSize:13, color:'#9CA3AF' }}>Redirecting to results…</p>
                </div>
              </motion.div>
            )}

            {jobStatus === 'failed' && (
              <motion.div key="failed"
                initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                style={{
                  background:'rgba(239,68,68,0.08)',
                  border:'1px solid rgba(239,68,68,0.3)',
                  borderRadius:16, padding:'20px 24px', marginBottom:24,
                  display:'flex', alignItems:'center', gap:14,
                }}>
                <XCircle size={28} color="#EF4444" />
                <div>
                  <p style={{ fontWeight:600, color:'#EF4444', marginBottom:2 }}>Generation failed</p>
                  <p style={{ fontSize:13, color:'#9CA3AF' }}>{error || 'Please try again'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <AssignmentForm onSubmit={handleSubmit} isLoading={isGenerating} />
          </motion.div>

          {/* Tips */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            style={{
              marginTop:28,
              background:'rgba(245,158,11,0.06)',
              border:'1px solid rgba(245,158,11,0.2)',
              borderRadius:14, padding:'18px 22px',
              display:'flex', alignItems:'flex-start', gap:14,
            }}>
            <Zap size={18} color="#F59E0B" style={{ marginTop:1, flexShrink:0 }} />
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#F59E0B', marginBottom:8 }}>Pro Tips</p>
              <ul style={{ fontSize:12, color:'#9CA3AF', lineHeight:1.9, listStyle:'none', padding:0, margin:0 }}>
                <li>• Be specific with subject and grade level for better questions</li>
                <li>• Upload reference material to generate topic-specific questions</li>
                <li>• Use "Mixed" difficulty for balanced assessments</li>
                <li>• First generation may take up to 60 seconds (server warm-up)</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
