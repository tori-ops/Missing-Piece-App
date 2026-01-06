import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGreeting } from '@/lib/greetings';
import ClientDashboardContent from './ClientDashboardContent';
import BrandingFooter from '@/components/BrandingFooter';

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
    const primaryColor = tenant?.brandingPrimaryColor || '#274E13';
    const secondaryColor = tenant?.brandingSecondaryColor || '#e1e0d0';
    const secondaryColorOpacity = tenant?.brandingSecondaryColorOpacity || 55;
    const backgroundColor = secondaryColor; // Main container uses secondary color
    const fontColor = tenant?.brandingFontColor || '#1B5E20';
    const companyName = tenant?.brandingCompanyName || tenant?.businessName || 'The Missing Piece';
    const fontFamily = tenant?.brandingFontFamily || "'Poppins', sans-serif";
    const headerFontFamily = tenant?.brandingHeaderFontFamily || "'Playfair Display', serif";
    const bodyFontFamily = tenant?.brandingBodyFontFamily || "'Poppins', sans-serif";
    const logoUrl = tenant?.brandingLogoUrl;
    const overlayUrl = tenant?.brandingOverlayUrl;

    // Track first login
    const isFirstLogin = !clientProfile.firstLoginAt;
    if (isFirstLogin) {
      try {
        await prisma.clientProfile.update({
          where: { id: clientProfile.id },
          data: { firstLoginAt: new Date() }
        });
      } catch (err) {
        console.error('Error updating firstLoginAt:', err);
      }
    }

    // Get greeting message
    const greeting = getGreeting(clientProfile.couple1FirstName, isFirstLogin);

    return (
      <>
        <ClientDashboardContent 
          clientProfile={clientProfile}
          companyName={companyName}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          secondaryColorOpacity={secondaryColorOpacity}
          fontColor={fontColor}
          fontFamily={fontFamily}
          headerFontFamily={headerFontFamily}
          bodyFontFamily={bodyFontFamily}
          logoUrl={logoUrl}
          overlayUrl={overlayUrl}
          currentUserId={user.id}
          greeting={greeting}
        />
        <BrandingFooter primaryColor={primaryColor} />
      </>
    );
  } catch (error) {
    console.error('ClientDashboard error:', error);
    return (
      <>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
          <h1>Oops! Something went wrong</h1>
          <p>We encountered an error loading your dashboard. Please try refreshing the page.</p>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'left', overflow: 'auto' }}>
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
        <BrandingFooter />
      </>
    );
  }
}
