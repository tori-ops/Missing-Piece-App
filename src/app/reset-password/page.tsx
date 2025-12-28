'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BrandingFooter from '@/components/BrandingFooter';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/?message=Password reset successfully. Please log in.');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#D0CEB5',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(39, 78, 19, 0.15)',
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          textAlign: 'center',
          border: '2px solid #274E13'
        }}>
          <div style={{
            fontSize: '4rem',
            color: '#274E13',
            marginBottom: '1rem'
          }}>
            ✅
          </div>
          <h1 style={{ color: '#274E13', marginBottom: '1rem' }}>
            Password Reset Successful!
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Your password has been updated successfully. You will be redirected to the login page automatically.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: '#274E13',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1a3b0e'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#274E13'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#D0CEB5',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(39, 78, 19, 0.15)',
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        border: '2px solid #274E13'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#274E13',
            margin: '0 0 8px 0'
          }}>
            🔐 Set Your Password
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Create a secure password for your account
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            borderLeft: '4px solid #c00'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151'
            }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter your new password"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E0DED0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#274E13'}
              onBlur={(e) => e.target.style.borderColor = '#E0DED0'}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Must be at least 8 characters long
            </small>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Confirm your new password"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E0DED0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#274E13'}
              onBlur={(e) => e.target.style.borderColor = '#E0DED0'}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: isSubmitting || !token ? '#9ca3af' : '#274E13',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting || !token ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting && token) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1a3b0e';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting && token) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#274E13';
              }
            }}
          >
            {isSubmitting ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#999',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #E0DED0'
        }}>
          <p style={{ margin: 0 }}>© 2025 Missing Piece. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#D0CEB5' 
      }}>
        <div>Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
      <BrandingFooter />
    </Suspense>
  );
}