'use client';

import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
}

export default function LogoutButton({ 
  primaryColor = '#274E13',
  secondaryColor = '#e1e0d0',
  fontColor = '#FFFFFF'
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: primaryColor,
        color: fontColor,
        border: `2px solid ${secondaryColor}`,
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
        (e.currentTarget as HTMLButtonElement).style.color = fontColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
        (e.currentTarget as HTMLButtonElement).style.color = fontColor;
      }}
    >
      Logout
    </button>
  );
}
