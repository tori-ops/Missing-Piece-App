'use client';

import { useState } from 'react';
import styles from './ForgotPasswordModal.module.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Client-side validation
    if (!email) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Reset Password</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>📧</div>
            <h3>Reset Email Sent!</h3>
            <p>We&apos;ve sent password reset instructions to <strong>{email}</strong>.</p>
            <p>Please check your email and follow the instructions to reset your password.</p>
            <button 
              className={styles.okayButton}
              onClick={handleClose}
            >
              Okay
            </button>
          </div>
        ) : (
          <div className={styles.content}>
            <p className={styles.description}>
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="resetEmail">Email Address</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={styles.input}
                  placeholder="Enter your email address"
                />
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  onClick={handleClose}
                  className={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </form>

            <div className={styles.note}>
              <small>
                Note: For security reasons, we&apos;ll always show this success message, 
                even if the email address isn&apos;t found in our system.
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}