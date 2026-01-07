'use client';

import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
}

export default function LogoutButton({
  primaryColor = '#274E13',
  secondaryColor = '#D0CEB5',
  fontColor = '#000000',
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
        border: `1px solid ${secondaryColor}`,
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = `${secondaryColor}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
      }}
    >
      Logout
    </button>
  );
}
