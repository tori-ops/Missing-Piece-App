import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  // Route to appropriate dashboard based on role
  const userRole = (session.user as any)?.role;
  
  if (userRole === 'SUPERADMIN') {
    redirect('/dashboard/superadmin');
  }

  if (userRole === 'TENANT') {
    redirect('/dashboard/tenant');
  }

  if (userRole === 'CLIENT') {
    redirect('/dashboard/client');
  }

  // Fallback
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
      <h1>Invalid Role: {userRole}</h1>
      <p>Your account role is not recognized. Please contact support.</p>
    </div>
  );
}
