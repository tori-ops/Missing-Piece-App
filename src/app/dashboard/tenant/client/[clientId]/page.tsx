'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ClientDetailContent from '@/components/ClientDetailContent';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const clientId = params?.clientId as string;

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    // Wait for session to load
    if (session.status === 'loading') {
      return;
    }

    if (session.status === 'unauthenticated') {
      router.push('/');
      return;
    }

    const fetchClientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/tenant/clients/${clientId}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Client API response:', { status: response.status, ok: response.ok });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', errorData);
          throw new Error(`Failed to fetch client details: ${response.status}`);
        }

        const data = await response.json();
        console.log('Client data received:', data);
        setClient(data);

        // Fetch branding
        const brandingRes = await fetch('/api/tenant/branding');
        if (brandingRes.ok) {
          const brandingData = await brandingRes.json();
          setBranding(brandingData);
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError(err instanceof Error ? err.message : 'Failed to load client');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [session.status, clientId, router]);

  if (session.status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (session.status === 'unauthenticated') {
    return null;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <div>Error: {error || 'Client not found'}</div>
        <button
          onClick={() => router.back()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: branding?.primaryColor || '#274E13',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <ClientDetailContent
      client={client}
      branding={branding}
      onBack={() => router.back()}
    />
  );
}
