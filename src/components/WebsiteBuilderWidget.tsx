'use client';

import { BookOpen } from 'lucide-react';

interface WebsiteBuilderWidgetProps {
  primaryColor: string;
  bodyFontFamily: string;
  textColor: string;
  onClick: () => void;
}

export default function WebsiteBuilderWidget({
  primaryColor,
  bodyFontFamily,
  textColor,
  onClick,
}: WebsiteBuilderWidgetProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: primaryColor,
        border: `2px solid ${primaryColor}`,
        borderRadius: '8px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        minHeight: '140px',
        fontFamily: bodyFontFamily,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as any).style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
        (e.currentTarget as any).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as any).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        (e.currentTarget as any).style.transform = 'translateY(0)';
      }}
      title="Click to build your website"
    >
      <BookOpen size={32} color={textColor} />
      <h3 style={{ color: textColor, margin: 0, fontSize: '1.1rem', fontWeight: '600', textAlign: 'center' }}>
        Website Builder
      </h3>
      <p style={{ color: textColor, margin: 0, fontSize: '0.85rem', opacity: 0.9, textAlign: 'center' }}>
        Build your event website
      </p>
    </div>
  );
}
