'use client';

interface ProgressBarProps {
  progress: number;
  message?: string;
}

export default function ProgressBar({ progress, message }: ProgressBarProps) {
  return (
    <div style={{ width: '100%' }}>
      {message && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>{message}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#A78BFA' }}>{progress}%</span>
        </div>
      )}
      <div style={{
        width: '100%', height: 8,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 999, overflow: 'hidden',
      }}>
        <div
          className="progress-pulse"
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #7C3AED, #6366F1)',
            borderRadius: 999,
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>
    </div>
  );
}
