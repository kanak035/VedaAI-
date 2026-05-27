'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GeneratedPaper, Section, Question } from '@/types';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import { BookOpen, Clock, Award, Hash, ChevronDown, ChevronUp } from 'lucide-react';

/* ── Question Item ── */
function QuestionItem({ question, index, printMode }: { question: Question; index: number; printMode?: boolean }) {
  return (
    <motion.div
      initial={printMode ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        display: 'flex', gap: 14, alignItems: 'flex-start',
        padding: printMode ? '0 0 20px' : '18px 20px',
        background: printMode ? 'transparent' : 'rgba(255,255,255,0.03)',
        border: printMode ? 'none' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: printMode ? 0 : 12,
        marginBottom: printMode ? 0 : 10,
        borderBottom: printMode ? '1px solid #e5e7eb' : undefined,
      }}
    >
      {/* Number bubble */}
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: 8,
        background: printMode ? '#f3f4f6' : 'rgba(139,92,246,0.2)',
        color: printMode ? '#374151' : '#C4B5FD',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
      }}>
        {index + 1}
      </div>

      <div style={{ flex: 1 }}>
        {/* Question text */}
        <p style={{
          fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          color: printMode ? '#111827' : '#E5E7EB',
        }}>
          {question.text}
        </p>

        {/* MCQ options */}
        {question.type === 'mcq' && question.options && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {question.options.map((opt, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 8, fontSize: 13,
                background: printMode ? '#f9fafb' : 'rgba(255,255,255,0.04)',
                border: printMode ? '1px solid #e5e7eb' : '1px solid rgba(255,255,255,0.08)',
                color: printMode ? '#374151' : '#D1D5DB',
              }}>
                <span style={{ fontWeight: 700, color: printMode ? '#6B7280' : '#A78BFA', minWidth: 18 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </div>
            ))}
          </div>
        )}

        {/* True/False */}
        {question.type === 'true_false' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {['True', 'False'].map(opt => (
              <div key={opt} style={{
                padding: '6px 18px', borderRadius: 8, fontSize: 13,
                background: printMode ? '#f9fafb' : 'rgba(255,255,255,0.04)',
                border: printMode ? '1px solid #e5e7eb' : '1px solid rgba(255,255,255,0.08)',
                color: printMode ? '#374151' : '#D1D5DB',
              }}>
                {opt}
              </div>
            ))}
          </div>
        )}

        {/* Answer lines for written questions */}
        {(question.type === 'short_answer' || question.type === 'long_answer') && printMode && (
          <div style={{ marginTop: 10 }}>
            {Array.from({ length: question.type === 'long_answer' ? 5 : 2 }).map((_, i) => (
              <div key={i} style={{ borderBottom: '1px solid #9CA3AF', height: 28, marginBottom: 4 }} />
            ))}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <DifficultyBadge difficulty={question.difficulty} />
          <span style={{ fontSize: 12, color: printMode ? '#6B7280' : '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Award size={11} />
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
          <span style={{ fontSize: 11, color: '#4B5563', textTransform: 'capitalize' }}>
            {question.type.replace('_', ' ')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section Block ── */
function SectionBlock({ section, sectionIndex, printMode }: { section: Section; sectionIndex: number; printMode?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const letter = String.fromCharCode(65 + sectionIndex);

  return (
    <div style={{ marginBottom: printMode ? 36 : 28 }}>
      {/* Section header */}
      <div
        onClick={() => !printMode && setCollapsed(!collapsed)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: printMode ? '0 0 12px' : '16px 20px',
          background: printMode ? 'transparent' : 'rgba(139,92,246,0.08)',
          border: printMode ? 'none' : '1px solid rgba(139,92,246,0.2)',
          borderBottom: printMode ? '2px solid #1e1b4b' : undefined,
          borderRadius: printMode ? 0 : 12,
          marginBottom: 16,
          cursor: printMode ? 'default' : 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: printMode ? '#1e1b4b' : 'linear-gradient(135deg,#7C3AED,#6366F1)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800,
          }}>
            {letter}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: printMode ? '#111827' : 'white', marginBottom: 2 }}>
              {section.title}
            </h3>
            <p style={{ fontSize: 12, color: printMode ? '#6B7280' : '#9CA3AF' }}>
              {section.instruction}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: printMode ? '#4F46E5' : '#A78BFA' }}>
            [{section.totalMarks} Marks]
          </span>
          {!printMode && (collapsed ? <ChevronDown size={16} color="#6B7280" /> : <ChevronUp size={16} color="#6B7280" />)}
        </div>
      </div>

      {/* Questions */}
      {!collapsed && (
        <div style={{ paddingLeft: printMode ? 0 : 4 }}>
          {section.questions.map((q, qi) => (
            <QuestionItem key={q.id} question={q} index={qi} printMode={printMode} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
interface QuestionPaperProps {
  paper: GeneratedPaper;
  studentName?: string;
  rollNumber?: string;
  section?: string;
  printMode?: boolean;
}

export default function QuestionPaper({ paper, studentName = '', rollNumber = '', section = '', printMode = false }: QuestionPaperProps) {
  const totalQuestions = paper.sections.reduce((s, sec) => s + sec.questions.length, 0);

  return (
    <div id="question-paper" style={{ color: printMode ? '#111827' : 'inherit' }}>

      {/* Paper header */}
      <div style={{
        textAlign: 'center',
        padding: printMode ? '0 0 24px' : '0 0 32px',
        borderBottom: printMode ? '3px solid #1e1b4b' : '1px solid rgba(255,255,255,0.08)',
        marginBottom: 32,
      }}>
        {!printMode && (
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#7C3AED,#6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={24} color="white" />
          </div>
        )}
        <h1 style={{ fontSize: printMode ? 24 : 26, fontWeight: 800, color: printMode ? '#111827' : 'white', marginBottom: 6 }}>
          {paper.title}
        </h1>
        <p style={{ fontSize: 16, fontWeight: 600, color: printMode ? '#4F46E5' : '#A78BFA', marginBottom: 16 }}>
          {paper.subject}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, fontSize: 13, color: printMode ? '#6B7280' : '#9CA3AF' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Duration: {paper.duration}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={14} /> Total Marks: {paper.totalMarks}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hash size={14} /> Questions: {totalQuestions}
          </span>
        </div>
      </div>

      {/* Student info */}
      <div style={{
        padding: '20px 24px',
        background: printMode ? 'transparent' : 'rgba(255,255,255,0.03)',
        border: printMode ? '1px solid #d1d5db' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        marginBottom: 28,
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: printMode ? '#6B7280' : '#6B7280', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Student Information
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Name', value: studentName },
            { label: 'Roll Number', value: rollNumber },
            { label: 'Section', value: section },
          ].map(field => (
            <div key={field.label}>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{field.label}</p>
              <div style={{
                borderBottom: printMode ? '1px solid #6B7280' : `1px solid ${field.value ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                paddingBottom: 6, minHeight: 28, fontSize: 14,
                color: printMode ? '#111827' : (field.value ? 'white' : '#4B5563'),
              }}>
                {field.value || (printMode ? '' : '___________________________')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {paper.instructions.length > 0 && (
        <div style={{
          padding: '16px 20px',
          background: printMode ? '#fffbeb' : 'rgba(245,158,11,0.06)',
          border: printMode ? '1px solid #fcd34d' : '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12,
          marginBottom: 32,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: printMode ? '#92400e' : '#F59E0B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            General Instructions
          </p>
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {paper.instructions.map((inst, i) => (
              <li key={i} style={{ fontSize: 13, color: printMode ? '#78350f' : '#D1D5DB', lineHeight: 1.8 }}>
                {inst}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Sections */}
      {paper.sections.map((sec, i) => (
        <SectionBlock key={sec.id} section={sec} sectionIndex={i} printMode={printMode} />
      ))}

      {/* Footer */}
      {printMode && (
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: 11, color: '#9CA3AF' }}>
          Generated by VedaAI Assessment Creator — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
    </div>
  );
}
