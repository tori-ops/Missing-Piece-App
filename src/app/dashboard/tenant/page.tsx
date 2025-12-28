import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lightenColor } from '@/lib/branding';
import LogoutButton from '@/components/LogoutButton';
import ClientList from '@/components/ClientList';
import CreateClientFormModal from '@/components/CreateClientFormModal';
import BrandingFooter from '@/components/BrandingFooter';

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
    
    // Use tenant branding with fallbacks
    const primaryColor = tenant.brandingPrimaryColor || '#274E13';
    const secondaryColor = tenant.brandingSecondaryColor || '#e1e0d0';
    const backgroundColor = secondaryColor; // Main container uses secondary color
    const fontColor = tenant.brandingFontColor || '#1B5E20';
    const companyName = tenant.brandingCompanyName || tenant.businessName || 'The Missing Piece';
    const fontFamily = tenant.brandingFontFamily || "'Poppins', sans-serif";
    const headerFontFamily = tenant.brandingHeaderFontFamily || "'Playfair Display', serif";
    const bodyFontFamily = tenant.brandingBodyFontFamily || "'Poppins', sans-serif";
    const logoUrl = tenant.brandingLogoUrl;

    return (
      <>
      <div style={{ 
        padding: '2rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: primaryColor, margin: 0, fontSize: '2.5rem', fontFamily: headerFontFamily }}>
              Welcome, {tenant.firstName}!
            </h1>
            <p style={{ color: primaryColor, fontSize: '0.95rem', margin: '0.5rem 0 0 0', opacity: 0.7, fontFamily: bodyFontFamily }}>
              {companyName}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={companyName} 
                style={{ 
                  height: '60px', 
                  backgroundColor: 'transparent'
                }} 
              />
            ) : (
              <span style={{ fontSize: '3rem' }}>👰</span>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div style={{ 
          background: primaryColor, 
          border: `2px solid ${primaryColor}`, 
          borderRadius: '8px', 
          padding: '1rem 2rem 2rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontFamily: bodyFontFamily
        }}>
          <h2 style={{ color: lightenColor(primaryColor, 120), marginTop: 0, fontFamily: headerFontFamily, fontSize: '2.05rem' }}>Business Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
            <div>
              <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>Business Name</p>
              <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.businessName}</p>
            </div>
            <div>
              <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>Email</p>
              <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.email}</p>
            </div>
            <div>
              <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>Phone</p>
              <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.phone || 'Not provided'}</p>
            </div>
            <div>
              <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>Subscription</p>
              <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.subscriptionTier || 'FREE'}</p>
            </div>
          </div>
        </div>

        {/* Clients Section */}
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.8rem', fontFamily: headerFontFamily, marginBottom: '1.5rem' }}>
            Your Clients ({clients.length})
          </h2>
          {clients.length > 0 ? (
            <ClientList 
              tenantId={tenant.id} 
              clients={clients} 
              primaryColor={primaryColor} 
              fontColor={fontColor} 
              bodyFontFamily={bodyFontFamily} 
            />
          ) : (
            <div style={{ 
              background: primaryColor, 
              border: `2px solid ${primaryColor}`, 
              borderRadius: '8px', 
              padding: '2rem',
              textAlign: 'center',
              color: fontColor,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>No clients yet. Create your first client to get started!</p>
            </div>
          )}
        </div>

        {/* Add Client Button */}
        <div style={{ marginTop: '2rem' }}>
          <CreateClientFormModal tenantId={tenant.id} primaryColor={primaryColor} />
        </div>

        {/* Footer */}
        {/* Logout Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LogoutButton primaryColor={primaryColor} />
        </div>
      </div>
      <BrandingFooter primaryColor={primaryColor} />
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
