'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, RefreshCw, Share2, Printer, Loader2,
  CheckCircle, XCircle, User, Eye, EyeOff, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';
import QuestionPaper from '@/components/paper/QuestionPaper';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getAssignmentStatus, regenerateAssignment } from '@/lib/api';
import { GeneratedPaper } from '@/types';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [studentName, setStudentName]       = useState('');
  const [rollNumber, setRollNumber]         = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [isDownloading, setIsDownloading]   = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showStudentInfo, setShowStudentInfo] = useState(true);
  const [localPaper, setLocalPaper]         = useState<GeneratedPaper | null>(null);
  const [localStatus, setLocalStatus]       = useState<string>('loading');

  const {
    currentJobId, jobStatus, progress, statusMessage, generatedPaper,
    setCurrentJobId, setJobStatus, setGeneratedPaper,
  } = useAssignmentStore();

  useWebSocket(jobId);

  useEffect(() => {
    const load = async () => {
      if (currentJobId === jobId && generatedPaper) {
        setLocalPaper(generatedPaper);
        setLocalStatus('completed');
        return;
      }
      try {
        setLocalStatus('loading');
        const data = await getAssignmentStatus(jobId);
        setCurrentJobId(jobId);
        setJobStatus(data.status);
        if (data.status === 'completed' && data.generatedPaper) {
          setLocalPaper(data.generatedPaper);
          setGeneratedPaper(data.generatedPaper);
          setLocalStatus('completed');
        } else if (data.status === 'failed') {
          setLocalStatus('failed');
        } else {
          setLocalStatus(data.status);
        }
      } catch {
        setLocalStatus('not_found');
      }
    };
    load();
  }, [jobId]);

  useEffect(() => {
    if (currentJobId === jobId) {
      if (jobStatus === 'completed' && generatedPaper) {
        setLocalPaper(generatedPaper);
        setLocalStatus('completed');
      } else if (jobStatus === 'failed') {
        setLocalStatus('failed');
      } else if (jobStatus === 'processing' || jobStatus === 'pending') {
        setLocalStatus(jobStatus);
      }
    }
  }, [jobStatus, generatedPaper, currentJobId, jobId]);

  const handleDownloadPDF = async () => {
    if (!localPaper) return;
    setIsDownloading(true);
    try {
      const { default: jsPDF }      = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;background:white;padding:48px;font-family:Arial,sans-serif;color:#111;';
      container.innerHTML = buildPrintHTML(localPaper, studentName, rollNumber, studentSection);
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 794 });
      document.body.removeChild(container);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = pdfW / (canvas.width / 2);
      const scaledH = (canvas.height / 2) * ratio;

      let y = 0, page = 0;
      while (y < scaledH) {
        if (page > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -y, pdfW, scaledH);
        y += pdfH; page++;
      }
      pdf.save(`${localPaper.title.replace(/\s+/g, '_')}_Assessment.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('PDF failed — try Print instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const result = await regenerateAssignment(jobId);
      toast.success('Regenerating…');
      router.push(`/result/${result.jobId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  /* ── Loading ── */
  if (localStatus === 'loading') return (
    <div className="animated-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={48} color="#A78BFA" style={{ margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#9CA3AF', fontSize: 15 }}>Loading assessment…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Not found ── */
  if (localStatus === 'not_found') return (
    <div className="animated-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Navbar />
      <div className="glass-card" style={{ padding: '60px 48px', textAlign: 'center', maxWidth: 440 }}>
        <XCircle size={48} color="#EF4444" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 10 }}>Assessment Not Found</h2>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>This assessment doesn't exist or has been removed.</p>
        <button onClick={() => router.push('/create')}
          style={{ padding: '12px 28px', borderRadius: 12, background: '#7C3AED', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          Create New Assessment
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="animated-bg" style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: 100, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* ── Processing ── */}
          <AnimatePresence>
            {(localStatus === 'pending' || localStatus === 'processing') && (
              <motion.div key="processing"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-card"
                style={{ padding: '60px 48px', textAlign: 'center', marginBottom: 32 }}
              >
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(139,92,246,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <Sparkles size={36} color="#A78BFA" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 10 }}>
                  AI is crafting your assessment
                </h2>
                <p style={{ fontSize: 15, color: '#9CA3AF', marginBottom: 36 }}>
                  {statusMessage || 'Generating structured questions…'}
                </p>
                <div style={{ maxWidth: 400, margin: '0 auto 32px' }}>
                  <ProgressBar progress={progress} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                  {['Analyzing requirements', 'Structuring sections', 'Generating questions', 'Assigning difficulty'].map((step, i) => (
                    <span key={step} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                      background: progress > i * 25 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                      color: progress > i * 25 ? '#A78BFA' : '#6B7280',
                      border: progress > i * 25 ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {progress > i * 25 ? <CheckCircle size={11} /> : <div style={{ width: 11, height: 11, borderRadius: '50%', border: '1px solid currentColor' }} />}
                      {step}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Failed ── */}
          {localStatus === 'failed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card"
              style={{ padding: '60px 48px', textAlign: 'center', marginBottom: 32, borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <XCircle size={48} color="#EF4444" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 10 }}>Generation Failed</h2>
              <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>Something went wrong. Please try again.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={handleRegenerate}
                  style={{ padding: '12px 24px', borderRadius: 12, background: '#7C3AED', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={15} /> Try Again
                </button>
                <button onClick={() => router.push('/create')}
                  style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: 14 }}>
                  New Assessment
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Completed ── */}
          {localStatus === 'completed' && localPaper && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Action bar */}
              <div className="glass-card no-print"
                style={{ padding: '16px 24px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={18} color="#10B981" />
                  <span style={{ fontWeight: 600, color: 'white', fontSize: 15 }}>Assessment Ready</span>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>
                    · {localPaper.sections.reduce((s, sec) => s + sec.questions.length, 0)} questions · {localPaper.totalMarks} marks
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {[
                    { label: 'Regenerate', icon: isRegenerating ? <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }} /> : <RefreshCw size={14} />, onClick: handleRegenerate, disabled: isRegenerating },
                    { label: 'Share',      icon: <Share2 size={14} />,  onClick: handleShare,      disabled: false },
                    { label: 'Print',      icon: <Printer size={14} />, onClick: () => window.print(), disabled: false },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.onClick} disabled={btn.disabled}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#D1D5DB', cursor: btn.disabled ? 'not-allowed' : 'pointer',
                        opacity: btn.disabled ? 0.6 : 1,
                      }}>
                      {btn.icon}{btn.label}
                    </button>
                  ))}
                  <button onClick={handleDownloadPDF} disabled={isDownloading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: 'linear-gradient(135deg,#7C3AED,#6366F1)',
                      border: 'none', color: 'white',
                      cursor: isDownloading ? 'not-allowed' : 'pointer',
                      opacity: isDownloading ? 0.7 : 1,
                    }}>
                    {isDownloading ? <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }} /> : <Download size={14} />}
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Student info panel */}
              <div className="glass-card no-print" style={{ padding: '18px 24px', marginBottom: 20 }}>
                <button onClick={() => setShowStudentInfo(!showStudentInfo)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#D1D5DB' }}>
                    <User size={15} color="#A78BFA" />
                    Student Information (Optional)
                  </span>
                  {showStudentInfo ? <EyeOff size={15} color="#6B7280" /> : <Eye size={15} color="#6B7280" />}
                </button>

                <AnimatePresence>
                  {showStudentInfo && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 18 }}>
                        {[
                          { label: 'Student Name', value: studentName, setter: setStudentName, placeholder: 'Enter name' },
                          { label: 'Roll Number',  value: rollNumber,  setter: setRollNumber,  placeholder: 'Enter roll number' },
                          { label: 'Section',      value: studentSection, setter: setStudentSection, placeholder: 'e.g., A, B, C' },
                        ].map(f => (
                          <div key={f.label}>
                            <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 6 }}>{f.label}</label>
                            <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                              style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none',
                              }} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* The paper */}
              <div className="glass-card" style={{ padding: '36px 40px' }}>
                <QuestionPaper
                  paper={localPaper}
                  studentName={studentName}
                  rollNumber={rollNumber}
                  section={studentSection}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
    </div>
  );
}

/* ── PDF HTML builder ── */
function buildPrintHTML(paper: GeneratedPaper, studentName: string, rollNumber: string, section: string): string {
  const dc: Record<string, string> = { easy: '#16a34a', medium: '#d97706', hard: '#dc2626' };

  const sectionsHTML = paper.sections.map((sec, si) => `
    <div style="margin-bottom:32px;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1e1b4b;padding-bottom:10px;margin-bottom:18px;">
        <div>
          <h3 style="font-size:16px;font-weight:700;color:#1e1b4b;margin:0 0 3px;">${sec.title}</h3>
          <p style="font-size:12px;color:#6b7280;margin:0;">${sec.instruction}</p>
        </div>
        <span style="font-size:13px;color:#4f46e5;font-weight:600;">[${sec.totalMarks} Marks]</span>
      </div>
      ${sec.questions.map((q, qi) => `
        <div style="margin-bottom:18px;padding:14px;border:1px solid #e5e7eb;border-radius:8px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="font-weight:700;color:#4f46e5;min-width:26px;font-size:14px;">${qi+1}.</span>
            <div style="flex:1;">
              <p style="margin:0 0 10px;font-size:13px;color:#111827;line-height:1.7;">${q.text}</p>
              ${q.type==='mcq'&&q.options ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">${q.options.map((o,oi)=>`<div style="font-size:12px;color:#374151;padding:5px 10px;border:1px solid #d1d5db;border-radius:5px;"><b style="color:#6b7280;">${String.fromCharCode(65+oi)}.</b> ${o}</div>`).join('')}</div>` : ''}
              ${q.type==='true_false' ? `<div style="display:flex;gap:10px;margin-bottom:10px;"><span style="font-size:12px;padding:4px 14px;border:1px solid #d1d5db;border-radius:5px;">True</span><span style="font-size:12px;padding:4px 14px;border:1px solid #d1d5db;border-radius:5px;">False</span></div>` : ''}
              ${(q.type==='short_answer'||q.type==='long_answer') ? Array.from({length:q.type==='long_answer'?5:2}).map(()=>'<div style="border-bottom:1px solid #9ca3af;height:26px;margin-bottom:4px;"></div>').join('') : ''}
              <div style="display:flex;gap:12px;align-items:center;margin-top:8px;">
                <span style="font-size:11px;padding:2px 10px;border-radius:12px;background:${dc[q.difficulty]}20;color:${dc[q.difficulty]};border:1px solid ${dc[q.difficulty]}40;font-weight:600;">${q.difficulty.charAt(0).toUpperCase()+q.difficulty.slice(1)}</span>
                <span style="font-size:11px;color:#6b7280;">[${q.marks} ${q.marks===1?'Mark':'Marks'}]</span>
              </div>
            </div>
          </div>
        </div>`).join('')}
    </div>`).join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;max-width:714px;">
      <div style="text-align:center;border-bottom:3px solid #1e1b4b;padding-bottom:20px;margin-bottom:24px;">
        <h1 style="font-size:24px;font-weight:800;color:#1e1b4b;margin:0 0 6px;">${paper.title}</h1>
        <p style="font-size:15px;color:#4f46e5;margin:0 0 14px;font-weight:600;">${paper.subject}</p>
        <div style="display:flex;justify-content:center;gap:28px;font-size:13px;color:#6b7280;">
          <span>⏱ Duration: ${paper.duration}</span>
          <span>📊 Total Marks: ${paper.totalMarks}</span>
          <span>📝 Questions: ${paper.sections.reduce((s,sec)=>s+sec.questions.length,0)}</span>
        </div>
      </div>
      <div style="border:1px solid #d1d5db;border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
          ${[['Name',studentName],['Roll Number',rollNumber],['Section',section]].map(([l,v])=>`
            <div>
              <div style="font-size:11px;color:#9ca3af;margin-bottom:5px;">${l}</div>
              <div style="border-bottom:1px solid #6b7280;padding-bottom:5px;font-size:13px;min-height:24px;">${v}</div>
            </div>`).join('')}
        </div>
      </div>
      ${paper.instructions.length ? `
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px;margin-bottom:24px;">
          <p style="font-size:12px;font-weight:700;color:#92400e;margin:0 0 8px;">General Instructions:</p>
          <ol style="margin:0;padding-left:18px;">${paper.instructions.map(i=>`<li style="font-size:12px;color:#78350f;margin-bottom:3px;">${i}</li>`).join('')}</ol>
        </div>` : ''}
      ${sectionsHTML}
      <div style="margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;">
        Generated by VedaAI Assessment Creator — ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
      </div>
    </div>`;
}
