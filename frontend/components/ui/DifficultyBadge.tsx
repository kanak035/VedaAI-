interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  size?: 'sm' | 'md';
}

const config = {
  easy:   { label: 'Easy',     className: 'badge-easy' },
  medium: { label: 'Moderate', className: 'badge-medium' },
  hard:   { label: 'Hard',     className: 'badge-hard' },
};

export default function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const { label, className } = config[difficulty];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center',
        borderRadius: 999, fontWeight: 600,
        fontSize: size === 'sm' ? 11 : 13,
        padding: size === 'sm' ? '2px 10px' : '4px 14px',
      }}
    >
      {label}
    </span>
  );
}
