'use client';

import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  primaryColor?: string;
}

export default function LogoutButton({ primaryColor = '#274E13' }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: `${primaryColor}20`,
        color: primaryColor,
        border: `1px solid ${primaryColor}`,
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
        (e.currentTarget as HTMLButtonElement).style.color = 'white';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}20`;
        (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
      }}
    >
      Logout
    </button>
  );
}
