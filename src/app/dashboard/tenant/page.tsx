import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BrandingFooter from '@/components/BrandingFooter';
import TenantDashboardContent from './TenantDashboardContent';

export const dynamic = 'force-dynamic';

export default async function TenantDashboard() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'TENANT') {
      redirect('/');
    }

    // Get tenant info - split queries to avoid connection issues
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user?.email || '' }
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Database Error</h1>
          <p>Unable to find your account. Please try again later.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{err instanceof Error ? err.message : 'Unknown error'}</p>
        </div>
      );
    }

    if (!user?.tenantId) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Tenant Account Not Found</h1>
          <p>We couldn&apos;t find your tenant account. Please contact support.</p>
        </div>
      );
    }

    // Fetch tenant separately
    let tenant;
    try {
      tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId }
      });
    } catch (err) {
      console.error('Error fetching tenant:', err);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Database Error</h1>
          <p>Unable to load tenant information. Please try again later.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{err instanceof Error ? err.message : 'Unknown error'}</p>
        </div>
      );
    }

    // Fetch clients separately
    let clients: any[] = [];
    try {
      clients = await prisma.clientProfile.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (err) {
      console.error('Error fetching clients:', err);
      // Clients are optional, don't fail if this errors
      clients = [];
    }

    if (!tenant) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Tenant Not Found</h1>
          <p>We couldn&apos;t find your tenant account. Please contact support.</p>
        </div>
      );
    }

    return (
      <>
        <TenantDashboardContent
          tenant={tenant}
          clients={clients}
          user={{ id: user.id, tenantId: user.tenantId || '' }}
        />
        <BrandingFooter primaryColor={tenant.brandingPrimaryColor || '#274E13'} />
      </>
    );
  } catch (error) {
    console.error('TenantDashboard error:', error);
    return (
      <>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Oops! Something went wrong</h1>
          <p>We encountered an error loading your dashboard. Please try refreshing the page.</p>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'left', overflow: 'auto' }}>
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </>
    );
  }
}
