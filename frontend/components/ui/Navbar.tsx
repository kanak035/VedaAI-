'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, BookOpen, Plus, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== '/';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(15, 15, 26, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(108, 99, 255, 0.15)',
      padding: '14px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showBack && (
            <button
              onClick={() => router.back()}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '6px 8px', cursor: 'pointer',
                color: '#9CA3AF', display: 'flex', alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'white' }}>VedaAI</span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/assignments"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#9CA3AF', fontSize: 13, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
          >
            <BookOpen size={15} />
            <span>Assignments</span>
          </Link>
          <Link
            href="/create"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
              color: 'white', fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Plus size={15} />
            <span>New Assessment</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
