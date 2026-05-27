'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen, Plus, Clock, CheckCircle, XCircle, Loader2,
  Calendar, Hash, Award, ChevronRight, Sparkles, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/ui/Navbar';
import { getAllAssignments } from '@/lib/api';
import { AssignmentListItem } from '@/types';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  pending:    { icon: <Clock size={13} />,                                    label: 'Pending',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  processing: { icon: <Loader2 size={13} style={{ animation:'spin 0.8s linear infinite' }} />, label: 'Processing', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  completed:  { icon: <CheckCircle size={13} />,                              label: 'Completed',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  failed:     { icon: <XCircle size={13} />,                                  label: 'Failed',     color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  idle:       { icon: <Clock size={13} />,                                    label: 'Idle',       color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  const load = async (p = 1) => {
    setIsLoading(true); setError(null);
    try {
      const data = await getAllAssignments(p, 10);
      setAssignments(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <div className="animated-bg" style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: 100, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
            <div>
              <h1 style={{ fontSize:'clamp(24px,3vw,36px)', fontWeight:800, color:'white', marginBottom:6 }}>
                My Assignments
              </h1>
              <p style={{ fontSize:14, color:'#9CA3AF' }}>All your generated assessments</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => load(page)}
                style={{
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:10, padding:'9px 12px', cursor:'pointer', color:'#9CA3AF',
                  display:'flex', alignItems:'center',
                }}>
                <RefreshCw size={16} />
              </button>
              <button onClick={() => router.push('/create')}
                style={{
                  background:'linear-gradient(135deg,#7C3AED,#6366F1)',
                  border:'none', cursor:'pointer',
                  color:'white', fontSize:13, fontWeight:600,
                  padding:'10px 20px', borderRadius:10,
                  display:'flex', alignItems:'center', gap:8,
                }}>
                <Plus size={15} />
                New Assessment
              </button>
            </div>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shimmer" style={{ height:88, borderRadius:16 }} />
              ))}
            </div>
          ) : error ? (
            <div className="glass-card" style={{ padding:'60px 40px', textAlign:'center' }}>
              <XCircle size={40} color="#EF4444" style={{ margin:'0 auto 16px' }} />
              <p style={{ fontWeight:600, color:'white', marginBottom:6 }}>Failed to load</p>
              <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:20 }}>{error}</p>
              <button onClick={() => load(page)}
                style={{ padding:'10px 24px', borderRadius:10, background:'#7C3AED', border:'none', color:'white', cursor:'pointer', fontSize:13 }}>
                Retry
              </button>
            </div>
          ) : assignments.length === 0 ? (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              className="glass-card" style={{ padding:'80px 40px', textAlign:'center' }}>
              <div style={{
                width:64, height:64, borderRadius:18,
                background:'rgba(139,92,246,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 20px',
              }}>
                <BookOpen size={30} color="#A78BFA" />
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, color:'white', marginBottom:10 }}>No assessments yet</h3>
              <p style={{ fontSize:14, color:'#9CA3AF', marginBottom:28 }}>
                Create your first AI-powered assessment to get started.
              </p>
              <button onClick={() => router.push('/create')}
                style={{
                  background:'linear-gradient(135deg,#7C3AED,#6366F1)',
                  border:'none', cursor:'pointer',
                  color:'white', fontSize:14, fontWeight:600,
                  padding:'12px 28px', borderRadius:12,
                  display:'inline-flex', alignItems:'center', gap:8,
                }}>
                <Sparkles size={16} />
                Create Assessment
              </button>
            </motion.div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {assignments.map((a, i) => {
                const s = statusConfig[a.jobStatus] || statusConfig.idle;
                const clickable = ['completed','processing','pending'].includes(a.jobStatus);
                return (
                  <motion.div key={a._id}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => clickable && router.push(`/result/${a.jobId}`)}
                    className="glass-card"
                    style={{
                      padding:'20px 24px',
                      display:'flex', alignItems:'center', gap:18,
                      cursor: clickable ? 'pointer' : 'default',
                      opacity: clickable ? 1 : 0.65,
                      transition:'border-color 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!clickable) return;
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.4)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.18)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width:44, height:44, borderRadius:12, flexShrink:0,
                      background:'rgba(139,92,246,0.15)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <BookOpen size={20} color="#A78BFA" />
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:8 }}>
                        <div style={{ minWidth:0 }}>
                          <h3 style={{ fontWeight:600, color:'white', fontSize:15, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {a.title}
                          </h3>
                          <p style={{ fontSize:13, color:'#9CA3AF' }}>{a.subject}</p>
                        </div>
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:5,
                          padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                          color: s.color, background: s.bg, flexShrink:0,
                        }}>
                          {s.icon}{s.label}
                        </span>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:16, fontSize:12, color:'#6B7280' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <Hash size={11} />{a.numberOfQuestions} questions
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <Award size={11} />{a.totalMarks} marks
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <Calendar size={11} />{format(new Date(a.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {clickable && <ChevronRight size={18} color="#4B5563" style={{ flexShrink:0 }} />}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:36 }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                style={{
                  padding:'9px 20px', borderRadius:10, fontSize:13, cursor:'pointer',
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                  color: page===1 ? '#4B5563' : '#D1D5DB', opacity: page===1 ? 0.5 : 1,
                }}>
                Previous
              </button>
              <span style={{ fontSize:13, color:'#9CA3AF' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                style={{
                  padding:'9px 20px', borderRadius:10, fontSize:13, cursor:'pointer',
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                  color: page===totalPages ? '#4B5563' : '#D1D5DB', opacity: page===totalPages ? 0.5 : 1,
                }}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
