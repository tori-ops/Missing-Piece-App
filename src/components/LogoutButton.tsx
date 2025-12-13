'use client';

import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  primaryColor?: string;
}

export default function LogoutButton({ primaryColor = '#274E13' }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const hoverColor = primaryColor === '#274E13' ? '#1a3d0a' : `${primaryColor}dd`;

  return (
    <button
      onClick={handleLogout}
      style={{
        backgroundColor: primaryColor,
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: `0 2px 8px ${primaryColor}33`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverColor;
        e.currentTarget.style.boxShadow = `0 4px 12px ${primaryColor}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = primaryColor;
        e.currentTarget.style.boxShadow = `0 2px 8px ${primaryColor}33`;
      }}
    >
      Logout
    </button>
  );
}
