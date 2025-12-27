import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hexToRgba } from '@/lib/branding';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function ClientDashboard() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'CLIENT') {
      redirect('/');
    }

    // Get client profile
    const userEmail = (session.user as any)?.email || '';
    
    // Fetch user first
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: userEmail }
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Database Error</h1>
          <p>Unable to connect to database. Please try again later.</p>
        </div>
      );
    }

    if (!user || !user.clientId) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Profile Not Found</h1>
          <p>User email: {userEmail}</p>
          <p>We couldn&apos;t find your client profile. Please contact support.</p>
        </div>
      );
    }

    // Fetch client profile separately
    let clientProfile;
    try {
      clientProfile = await prisma.clientProfile.findUnique({
        where: { id: user.clientId }
      });
    } catch (err) {
      console.error('Error fetching client profile:', err);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Database Error</h1>
          <p>Unable to load your profile. Please try again later.</p>
        </div>
      );
    }

    if (!clientProfile) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Profile Not Found</h1>
          <p>User email: {userEmail}</p>
          <p>We couldn&apos;t find your client profile. Please contact support.</p>
        </div>
      );
    }

    // Fetch tenant separately
    let tenant;
    try {
      tenant = await prisma.tenant.findUnique({
        where: { id: clientProfile.tenantId }
      });
    } catch (err) {
      console.error('Error fetching tenant:', err);
      // Tenant is optional for basic dashboard
      tenant = null;
    }

  // Use tenant branding with fallbacks
  const accentColor = tenant?.brandingPrimaryColor || '#274E13';
  const backgroundColor = tenant?.brandingSecondaryColor || '#D0CEB5';
  const backgroundColorWithOpacity = hexToRgba(backgroundColor, tenant?.brandingSecondaryColorOpacity || 55);
  const fontColor = tenant?.brandingFontColor || '#000000';
  const companyName = tenant?.brandingCompanyName || tenant?.businessName || 'The Missing Piece';
  const fontFamily = tenant?.brandingFontFamily || "'Poppins', sans-serif";
  const headerFontFamily = tenant?.brandingHeaderFontFamily || "'Playfair Display', serif";
  const bodyFontFamily = tenant?.brandingBodyFontFamily || "'Poppins', sans-serif";
  const logoUrl = tenant?.brandingLogoUrl;

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: backgroundColorWithOpacity, 
      fontFamily, 
      color: fontColor,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: accentColor, margin: 0, fontSize: '2rem', fontFamily: headerFontFamily }}>
            Welcome, {clientProfile.couple1FirstName}!
          </h1>
          <p style={{ color: accentColor, fontSize: '0.95rem', margin: '0.5rem 0 0 0', opacity: 0.7, fontFamily: bodyFontFamily }}>
            Coordinated by {companyName}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={companyName} 
              style={{ 
                height: '50px', 
                backgroundColor: 'transparent'
              }} 
            />
          ) : (
            <span style={{ fontSize: '2.5rem' }}>💍</span>
          )}
        </div>
      </div>

      {/* Wedding Details Card */}
      <div style={{ 
        background: 'white', 
        border: `2px solid ${accentColor}`, 
        borderRadius: '8px', 
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: `0 10px 40px ${accentColor}26`,
        fontFamily: bodyFontFamily
      }}>
        <h2 style={{ color: accentColor, marginTop: 0, fontFamily: headerFontFamily }}>Your Wedding Details</h2>
        {clientProfile.weddingDate && (
          <p style={{ color: fontColor }}>
            📅 Your Big Day: <strong>{new Date(clientProfile.weddingDate).toLocaleDateString()}</strong>
          </p>
        )}
        {clientProfile.budgetCents && (
          <p style={{ color: fontColor }}>
            💰 Budget: <strong>${(clientProfile.budgetCents / 100).toLocaleString()}</strong>
          </p>
        )}
        {clientProfile.estimatedGuestCount && (
          <p style={{ color: fontColor }}>
            👥 Guest Count: <strong>{clientProfile.estimatedGuestCount}</strong>
          </p>
        )}
        {clientProfile.weddingLocation && (
          <p style={{ color: fontColor }}>
            🏛️ Venue: <strong>{clientProfile.weddingLocation}</strong>
          </p>
        )}
        {clientProfile.addressLine1 && (
          <p style={{ color: fontColor, fontSize: '0.9rem' }}>
            📍 {clientProfile.addressLine1}{clientProfile.addressCity ? `, ${clientProfile.addressCity}` : ''}{clientProfile.addressState ? `, ${clientProfile.addressState}` : ''}
          </p>
        )}
        {!clientProfile.weddingDate && !clientProfile.budgetCents && !clientProfile.estimatedGuestCount && (
          <p style={{ color: fontColor, fontStyle: 'italic', opacity: 0.7 }}>
            Your wedding details will appear here once they&apos;re added.
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '4rem', 
        paddingTop: '2rem', 
        borderTop: `1px solid ${accentColor}40`,
        textAlign: 'center',
        fontSize: '0.8rem',
        color: fontColor,
        opacity: 0.6,
        marginBottom: '2rem'
      }}>
        Powered by {companyName}
      </div>

      {/* Logout Button */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center'
      }}>
        <LogoutButton primaryColor={accentColor} />
      </div>
    </div>
  );
  } catch (error) {
    console.error('ClientDashboard error:', error);
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
        <h1>Oops! Something went wrong</h1>
        <p>We encountered an error loading your dashboard. Please try refreshing the page.</p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'left', overflow: 'auto' }}>
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}