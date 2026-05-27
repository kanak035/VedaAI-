'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Calendar, BookOpen, Hash, Award, FileText,
  ChevronDown, Sparkles, AlertCircle, Clock, GraduationCap
} from 'lucide-react';
import { AssignmentFormData } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(z.string()).min(1, 'Select at least one question type'),
  numberOfQuestions: z.number({ error: 'Must be a number' }).int().min(1, 'Min 1').max(100, 'Max 100'),
  totalMarks: z.number({ error: 'Must be a number' }).int().min(1, 'Min 1').max(1000, 'Max 1000'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  additionalInstructions: z.string().optional(),
  duration: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const QUESTION_TYPES = [
  { value: 'mcq',          label: 'Multiple Choice (MCQ)' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer',  label: 'Long Answer' },
  { value: 'true_false',   label: 'True / False' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'Easy',   color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'hard',   label: 'Hard',   color: '#EF4444' },
  { value: 'mixed',  label: 'Mixed',  color: '#8B5CF6' },
];

const GRADE_LEVELS = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5',
  'Grade 6','Grade 7','Grade 8','Grade 9','Grade 10',
  'Grade 11','Grade 12','Undergraduate','Postgraduate',
];

interface AssignmentFormProps {
  onSubmit: (data: AssignmentFormData) => void;
  isLoading: boolean;
}

/* ── shared style tokens ── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#D1D5DB',
  marginBottom: 8,
};

const errorStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: '#F87171',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const sectionCard: React.CSSProperties = {
  background: 'rgba(26,26,46,0.85)',
  border: '1px solid rgba(108,99,255,0.18)',
  borderRadius: 16,
  padding: '28px 28px',
  marginBottom: 24,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: 'white',
  marginBottom: 24,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

export default function AssignmentForm({ onSubmit, isLoading }: AssignmentFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      difficulty: 'mixed',
      questionTypes: ['short_answer'],
      numberOfQuestions: 10,
      totalMarks: 50,
      duration: '2 Hours',
    },
  });

  const selectedTypes      = watch('questionTypes') || [];
  const selectedDifficulty = watch('difficulty');

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) setValue('questionTypes', selectedTypes.filter(t => t !== type), { shouldValidate: true });
    } else {
      setValue('questionTypes', [...selectedTypes, type], { shouldValidate: true });
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const allowed = ['application/pdf','text/plain','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(file.type)) { alert('Only PDF, TXT, DOC files allowed'); return; }
      if (file.size > 10 * 1024 * 1024)  { alert('Max file size is 10 MB'); return; }
    }
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const onFormSubmit = (data: FormValues) => onSubmit({ ...data, file: uploadedFile });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>

      {/* ── Basic Info ── */}
      <div style={sectionCard}>
        <div style={sectionTitle}>
          <span style={{ color: '#A78BFA' }}><BookOpen size={18} /></span>
          Basic Information
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Assessment Title *</label>
          <input {...register('title')} placeholder="e.g., Mid-Term Science Examination" style={inputStyle} />
          {errors.title && <p style={errorStyle}><AlertCircle size={12} />{errors.title.message}</p>}
        </div>

        {/* Subject + Grade */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input {...register('subject')} placeholder="e.g., Physics, Mathematics" style={inputStyle} />
            {errors.subject && <p style={errorStyle}><AlertCircle size={12} />{errors.subject.message}</p>}
          </div>
          <div>
            <label style={labelStyle}><GraduationCap size={13} style={{ display:'inline', marginRight:4 }} />Grade Level *</label>
            <div style={{ position: 'relative' }}>
              <select {...register('gradeLevel')} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                <option value="" style={{ background: '#1A1A2E' }}>Select grade level</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g} style={{ background: '#1A1A2E' }}>{g}</option>)}
              </select>
              <ChevronDown size={15} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#6B7280', pointerEvents:'none' }} />
            </div>
            {errors.gradeLevel && <p style={errorStyle}><AlertCircle size={12} />{errors.gradeLevel.message}</p>}
          </div>
        </div>

        {/* Due Date + Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}><Calendar size={13} style={{ display:'inline', marginRight:4 }} />Due Date *</label>
            <input {...register('dueDate')} type="date" min={new Date().toISOString().split('T')[0]}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
            {errors.dueDate && <p style={errorStyle}><AlertCircle size={12} />{errors.dueDate.message}</p>}
          </div>
          <div>
            <label style={labelStyle}><Clock size={13} style={{ display:'inline', marginRight:4 }} />Duration</label>
            <input {...register('duration')} placeholder="e.g., 2 Hours, 90 Minutes" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* ── Question Config ── */}
      <div style={sectionCard}>
        <div style={sectionTitle}>
          <span style={{ color: '#A78BFA' }}><Hash size={18} /></span>
          Question Configuration
        </div>

        {/* Question Types */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Question Types *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {QUESTION_TYPES.map(type => {
              const active = selectedTypes.includes(type.value);
              return (
                <button key={type.value} type="button" onClick={() => toggleType(type.value)}
                  style={{
                    padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                    textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                    background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                    border: active ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: active ? '#C4B5FD' : '#9CA3AF',
                  }}>
                  <span style={{ marginRight: 8, color: active ? '#A78BFA' : '#4B5563' }}>
                    {active ? '✓' : '○'}
                  </span>
                  {type.label}
                </button>
              );
            })}
          </div>
          {errors.questionTypes && <p style={errorStyle}><AlertCircle size={12} />{errors.questionTypes.message}</p>}
        </div>

        {/* Count + Marks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>Number of Questions *</label>
            <input {...register('numberOfQuestions', { valueAsNumber: true })} type="number" min={1} max={100} style={inputStyle} />
            {errors.numberOfQuestions && <p style={errorStyle}><AlertCircle size={12} />{errors.numberOfQuestions.message}</p>}
          </div>
          <div>
            <label style={labelStyle}><Award size={13} style={{ display:'inline', marginRight:4 }} />Total Marks *</label>
            <input {...register('totalMarks', { valueAsNumber: true })} type="number" min={1} max={1000} style={inputStyle} />
            {errors.totalMarks && <p style={errorStyle}><AlertCircle size={12} />{errors.totalMarks.message}</p>}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label style={labelStyle}>Difficulty Level *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {DIFFICULTY_OPTIONS.map(opt => {
              const active = selectedDifficulty === opt.value;
              return (
                <button key={opt.value} type="button"
                  onClick={() => setValue('difficulty', opt.value as any, { shouldValidate: true })}
                  style={{
                    padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                    background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: active ? `1px solid ${opt.color}60` : '1px solid rgba(255,255,255,0.08)',
                    color: active ? opt.color : '#6B7280',
                  }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Additional Options ── */}
      <div style={sectionCard}>
        <div style={sectionTitle}>
          <span style={{ color: '#A78BFA' }}><FileText size={18} /></span>
          Additional Options
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Reference Material (Optional)</label>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#8B5CF6' : uploadedFile ? '#10B981' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 14,
              padding: '32px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'rgba(139,92,246,0.08)' : uploadedFile ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" style={{ display:'none' }}
              onChange={e => handleFileChange(e.target.files?.[0] || null)} />
            <AnimatePresence mode="wait">
              {uploadedFile ? (
                <motion.div key="file" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
                  <FileText size={32} color="#10B981" />
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#10B981', marginBottom:2 }}>{uploadedFile.name}</p>
                    <p style={{ fontSize:12, color:'#6B7280' }}>{(uploadedFile.size/1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); handleFileChange(null); }}
                    style={{ marginLeft:8, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:999, padding:6, cursor:'pointer', color:'#9CA3AF' }}>
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  <Upload size={32} color="#4B5563" style={{ margin:'0 auto 10px' }} />
                  <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:4 }}>
                    Drop a file here or <span style={{ color:'#A78BFA' }}>browse</span>
                  </p>
                  <p style={{ fontSize:12, color:'#4B5563' }}>PDF, TXT, DOC up to 10 MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label style={labelStyle}>Additional Instructions (Optional)</label>
          <textarea {...register('additionalInstructions')} rows={3}
            placeholder="e.g., Focus on chapters 3–5, include diagram-based questions..."
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
        </div>
      </div>

      {/* ── Submit ── */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.01 }}
        whileTap={{ scale: isLoading ? 1 : 0.99 }}
        style={{
          width: '100%',
          padding: '16px 24px',
          borderRadius: 16,
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          background: isLoading
            ? 'rgba(124,58,237,0.4)'
            : 'linear-gradient(135deg, #7C3AED, #6366F1)',
          color: isLoading ? 'rgba(255,255,255,0.5)' : 'white',
          fontSize: 16,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          boxShadow: isLoading ? 'none' : '0 0 40px rgba(108,99,255,0.4)',
          transition: 'all 0.2s',
        }}
      >
        {isLoading ? (
          <>
            <div style={{
              width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Generating Assessment...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generate Assessment with AI
          </>
        )}
      </motion.button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        input::placeholder, textarea::placeholder { color: #4B5563; }
        select option { background: #1A1A2E; color: white; }
      `}</style>
    </form>
  );
}
