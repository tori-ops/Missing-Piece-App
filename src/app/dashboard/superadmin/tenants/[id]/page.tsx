import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TenantBasicInfoForm from '@/components/TenantBasicInfoForm';
import TenantBrandingForm from '@/components/TenantBrandingForm';

export default async function TenantEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
    redirect('/');
  }

  // Fetch tenant details
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      users: { select: { id: true } },
      clientProfiles: { select: { id: true } },
    },
  });

  if (!tenant) {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', background: '#D0CEB5' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px' }}>
          <h1 style={{ color: '#274E13' }}>Tenant Not Found</h1>
          <p>The tenant you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard/superadmin">
            <button style={{ padding: '0.75rem 1.5rem', background: '#274E13', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#D0CEB5' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Welcome Message */}
        <p style={{ color: '#274E13', margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '500' }}>
          Welcome back, {tenant.firstName || 'Admin'}
        </p>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <Link href="/dashboard/superadmin">
              <button style={{ padding: '0.5rem 1rem', background: 'white', color: '#274E13', border: '2px solid #274E13', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>
                ← Back to Tenants
              </button>
            </Link>
            <h1 style={{ color: '#274E13', margin: '0 0 0.5rem 0' }}>📋 Edit Tenant</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0 0 0' }}>
              {tenant.brandingLogoUrl && (
                <img 
                  src={tenant.brandingLogoUrl} 
                  alt="Logo" 
                  style={{ 
                    height: '48px', 
                    width: 'auto', 
                    objectFit: 'contain',
                    backgroundColor: 'transparent',
                    filter: 'brightness(0) saturate(100%) invert(1) drop-shadow(0 0 0 white)',
                    mixBlendMode: 'lighten'
                  }}
                />
              )}
              <p style={{ color: '#666', margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>{tenant.businessName}</p>
            </div>
            {(tenant.firstName || tenant.lastName) && (
              <p style={{ color: '#999', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{tenant.firstName} {tenant.lastName}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Users</p>
            <p style={{ color: '#274E13', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{tenant.users.length}</p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Clients</p>
            <p style={{ color: '#274E13', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{tenant.clientProfiles.length}</p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Created</p>
            <p style={{ color: '#274E13', margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>{tenant.createdAt.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Basic Info Section */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '2px solid #274E13' }}>
          <h2 style={{ color: '#274E13', marginTop: 0 }}>📝 Basic Information</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Update tenant details</p>
          <TenantBasicInfoForm 
            tenantId={tenant.id} 
            initialData={{
              firstName: tenant.firstName,
              lastName: tenant.lastName,
              businessName: tenant.businessName,
              phone: tenant.phone,
              email: tenant.email,
              webAddress: tenant.webAddress || undefined,
              status: tenant.status,
              subscriptionTier: tenant.subscriptionTier,
              weddingDate: undefined,
              budget: undefined
            }} 
          />
        </div>

        {/* Branding Section */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '2px solid #999' }}>
          <h2 style={{ color: '#274E13', marginTop: 0 }}>🎨 Brand Suite (Optional)</h2>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>Customize how your clients see the platform with your brand colors, logo, and messaging.</p>
          <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Leave fields empty to use default branding.</p>
          <TenantBrandingForm 
            tenantId={tenant.id} 
            initialBranding={tenant}
            isInEditPage={true}
          />
        </div>
      </div>
    </div>
  );
}
