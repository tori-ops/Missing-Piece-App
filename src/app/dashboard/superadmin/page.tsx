import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import CreateTenantFormModal from '@/components/CreateTenantFormModal';
import TenantManagementModal from '@/components/TenantManagementModal';
import UserManagementModal from '@/components/UserManagementModal';

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
    redirect('/');
  }

  return (
    <div
      style={{
        padding: '2rem',
        minHeight: '100vh',
        background: "url('/background.png') center center / cover no-repeat fixed",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src="/mp-logo.png"
            alt="The Missing Piece Logo"
            style={{ height: '60px', width: 'auto' }}
          />
          <h1 style={{ color: '#274E13', margin: 0 }}>SuperAdmin Dashboard</h1>
        </div>
        <LogoutButton />
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '2px solid #274E13',
          borderRadius: '8px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 10px 40px rgba(39, 78, 19, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#274E13', margin: 0 }}>Welcome, {session.user?.name || 'SuperAdmin'}</h2>
          <CreateTenantFormModal />
        </div>
        <p style={{ color: '#666', marginTop: '1rem', lineHeight: '1.6' }}>
          You have access to all system management features:
        </p>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <TenantManagementModal />

          <div style={{
            background: '#F9F8F3',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #E0DED0'
          }}>
            <h3 style={{ color: '#274E13' }}>💰 Revenue & Billing</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>View subscription analytics and payments</p>
          </div>

          <UserManagementModal />

          <div style={{
            background: '#F9F8F3',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #E0DED0'
          }}>
            <h3 style={{ color: '#274E13' }}>⚙️ System Settings</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Configure platform-wide settings</p>
          </div>

          <div style={{
            background: '#F9F8F3',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #E0DED0'
          }}>
            <h3 style={{ color: '#274E13' }}>📈 Analytics</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Platform-wide usage and performance metrics</p>
          </div>

          <div style={{
            background: '#F9F8F3',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #E0DED0'
          }}>
            <h3 style={{ color: '#274E13' }}>🔐 Security</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Audit logs and security controls</p>
          </div>

        </div>
      </div>
    </div>
  );
}
