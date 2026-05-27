'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Zap, Shield, ArrowRight, Brain, FileText, Clock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <Brain size={24} />,
      title: 'AI-Powered Generation',
      description: 'GPT-4 creates structured, curriculum-aligned questions instantly.',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
    },
    {
      icon: <FileText size={24} />,
      title: 'Structured Output',
      description: 'Questions organized into sections with difficulty tags and marks.',
      gradient: 'linear-gradient(135deg, #EC4899, #F43F5E)',
    },
    {
      icon: <Zap size={24} />,
      title: 'Real-time Updates',
      description: 'WebSocket-powered live progress tracking during generation.',
      gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    },
    {
      icon: <Shield size={24} />,
      title: 'PDF Export',
      description: 'Download professionally formatted question papers instantly.',
      gradient: 'linear-gradient(135deg, #10B981, #14B8A6)',
    },
  ];

  const stats = [
    { value: '10x', label: 'Faster than manual' },
    { value: '3', label: 'Difficulty levels' },
    { value: '100%', label: 'Structured output' },
    { value: '∞', label: 'Regenerations' },
  ];

  return (
    <div className="animated-bg" style={{ minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(15, 15, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(108, 99, 255, 0.15)',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: 'white' }}>VedaAI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.push('/assignments')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9CA3AF', fontSize: 14, padding: '8px 16px',
                borderRadius: 10, transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
            >
              My Assignments
            </button>
            <button
              onClick={() => router.push('/create')}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                border: 'none', cursor: 'pointer',
                color: 'white', fontSize: 14, fontWeight: 600,
                padding: '10px 20px', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Sparkles size={15} />
              Create Assessment
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(26, 26, 46, 0.85)',
              border: '1px solid rgba(108, 99, 255, 0.25)',
              color: '#A78BFA', fontSize: 13, fontWeight: 500,
              marginBottom: 32,
            }}
          >
            <Sparkles size={14} />
            AI-Powered Assessment Creator
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, color: 'white' }}
          >
            Create{' '}
            <span className="gradient-text">Intelligent</span>
            <br />
            Question Papers
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 18, color: '#9CA3AF', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}
          >
            Generate structured, curriculum-aligned assessments in seconds.
            AI handles the heavy lifting — you focus on teaching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={() => router.push('/create')}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                border: 'none', cursor: 'pointer',
                color: 'white', fontSize: 16, fontWeight: 600,
                padding: '14px 32px', borderRadius: 16,
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 0 40px rgba(108, 99, 255, 0.4)',
                transition: 'transform 0.2s, opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Sparkles size={18} />
              Start Creating
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => router.push('/assignments')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                color: 'white', fontSize: 16, fontWeight: 600,
                padding: '14px 32px', borderRadius: 16,
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              <BookOpen size={18} />
              View Assignments
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20,
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="glass-card"
              style={{ padding: '28px 24px', textAlign: 'center' }}
            >
              <div className="gradient-text" style={{ fontSize: 36, fontWeight: 800, marginBottom: 6 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
              Everything you need to{' '}
              <span className="gradient-text">assess better</span>
            </h2>
            <p style={{ fontSize: 17, color: '#9CA3AF', maxWidth: 520, margin: '0 auto' }}>
              From creation to export, VedaAI handles the entire assessment workflow.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: '32px 28px', transition: 'border-color 0.3s, transform 0.3s' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.4)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.18)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: feature.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', marginBottom: 20,
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 10 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'white' }}>
              How it works
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { step: '01', title: 'Fill the form', desc: 'Enter subject, grade, question types, marks, and any additional instructions.', icon: <FileText size={18} /> },
              { step: '02', title: 'AI generates', desc: 'Our AI structures a complete question paper with sections, difficulty levels, and marks.', icon: <Brain size={18} /> },
              { step: '03', title: 'Review & export', desc: 'View the structured paper, regenerate if needed, and download as PDF.', icon: <Clock size={18} /> },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card"
                style={{ padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: 28 }}
              >
                <div style={{ fontSize: 42, fontWeight: 800, color: 'rgba(108,99,255,0.25)', fontFamily: 'monospace', minWidth: 64, lineHeight: 1 }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#A78BFA' }}>{item.icon}</span>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="glass-card glow-purple"
            style={{ padding: '64px 48px', textAlign: 'center' }}
          >
            <Sparkles size={48} color="#A78BFA" style={{ margin: '0 auto 20px' }} className="float-animation" />
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
              Ready to create your first assessment?
            </h2>
            <p style={{ fontSize: 15, color: '#9CA3AF', marginBottom: 36, lineHeight: 1.7 }}>
              Join educators using AI to save hours on assessment creation.
            </p>
            <button
              onClick={() => router.push('/create')}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                border: 'none', cursor: 'pointer',
                color: 'white', fontSize: 16, fontWeight: 600,
                padding: '14px 36px', borderRadius: 16,
                display: 'inline-flex', alignItems: 'center', gap: 10,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Sparkles size={18} />
              Get Started Free
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={13} color="white" />
            </div>
            <span style={{ fontSize: 13, color: '#6B7280' }}>VedaAI Assessment Creator</span>
          </div>
          <p style={{ fontSize: 13, color: '#4B5563' }}>Built for educators, powered by AI</p>
        </div>
      </footer>
    </div>
  );
}
