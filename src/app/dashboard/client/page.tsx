import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderTemplateDashboard } from '@/lib/template-renderer';
import { hexToRgba } from '@/lib/branding';
import LogoutButton from '@/components/LogoutButton';

// Component library for template rendering
const componentLibrary = {
  LogoutButton
};

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'CLIENT') {
    redirect('/');
  }

  // Get client profile
  const userEmail = (session.user as any)?.email || '';
  console.log('ClientDashboard - Loading profile for:', userEmail);
  
  // Fetch user first
  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  console.log('ClientDashboard - User found:', !!user);

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
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { id: user.clientId }
  });

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
  const tenant = await prisma.tenant.findUnique({
    where: { id: clientProfile.tenantId }
  });

  // Render dashboard using master template
  const dashboardConfig = await renderTemplateDashboard('CLIENT', user, tenant, { clientProfile });
  
  // Extract branding and layout
  const { branding, layout, componentsBySection, features } = dashboardConfig;
  
  // Fallback branding if template doesn't provide it
  const accentColor = branding?.primaryColor || '#274E13';
  const backgroundColor = branding?.secondaryColor || '#D0CEB5';
  const backgroundColorWithOpacity = hexToRgba(backgroundColor, branding?.secondaryColorOpacity || 55);
  const fontColor = branding?.fontColor || '#000000';
  const companyName = branding?.companyName || 'The Missing Piece';
  const fontFamily = branding?.fontFamily || "'Poppins', sans-serif";
  const headerFontFamily = branding?.headerFontFamily || "'Playfair Display', serif";
  const bodyFontFamily = branding?.bodyFontFamily || "'Poppins', sans-serif";

  return (
    <div style={{ 
      padding: layout.spacing || '2rem', 
      minHeight: '100vh', 
      background: backgroundColorWithOpacity, 
      fontFamily, 
      color: fontColor,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      
      {/* Header Section */}
      {componentsBySection.header?.map((component) => (
        <div key={component.id} style={{ marginBottom: '2rem' }}>
          {component.type === 'header' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ color: accentColor, margin: 0, fontSize: '2rem', fontFamily: headerFontFamily }}>
                  Welcome, {clientProfile?.couple1FirstName || 'friend'}!
                </h1>
                <p style={{ color: accentColor, fontSize: '0.95rem', margin: '0.5rem 0 0 0', opacity: 0.7, fontFamily: bodyFontFamily }}>
                  Coordinated by {companyName}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {branding?.logoUrl ? (
                  <img 
                    src={branding.logoUrl} 
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
          )}
        </div>
      ))}

      {/* Main Section */}
      {componentsBySection.main?.map((component) => (
        <div key={component.id} style={{ marginBottom: '2rem' }}>
          {component.type === 'stats' && component.isVisible && (
            <div style={{ 
              background: 'white', 
              border: `2px solid ${accentColor}`, 
              borderRadius: '8px', 
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: `0 10px 40px ${accentColor}26`,
              fontFamily: bodyFontFamily
            }}>
              {features.showWeddingStats && (
                <>
                  {clientProfile?.weddingDate && (
                    <p style={{ color: fontColor }}>
                      📅 Your Big Day: <strong>{new Date(clientProfile.weddingDate).toLocaleDateString()}</strong>
                    </p>
                  )}
                  {clientProfile?.budgetCents && (
                    <p style={{ color: fontColor }}>
                      💰 Budget: <strong>${(clientProfile.budgetCents / 100).toLocaleString()}</strong>
                    </p>
                  )}
                  {clientProfile?.estimatedGuestCount && (
                    <p style={{ color: fontColor }}>
                      👥 Guest Count: <strong>{clientProfile.estimatedGuestCount}</strong>
                    </p>
                  )}
                  {clientProfile?.weddingLocation && (
                    <p style={{ color: fontColor }}>
                      🏛️ Venue: <strong>{clientProfile.weddingLocation}</strong>
                    </p>
                  )}
                  {clientProfile?.addressLine1 && (
                    <p style={{ color: fontColor, fontSize: '0.9rem' }}>
                      📍 {clientProfile.addressLine1}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Additional template-driven components can be added here */}
          {component.type !== 'header' && component.type !== 'stats' && (
            dashboardConfig.renderComponent(component, componentLibrary)
          )}
        </div>
      ))}

      {/* Footer Section */}
      {componentsBySection.footer?.map((component) => (
        <div key={component.id}>
          {dashboardConfig.renderComponent(component, componentLibrary)}
        </div>
      )) || (
        <div style={{ 
          marginTop: '4rem', 
          paddingTop: '2rem', 
          borderTop: `1px solid ${accentColor}40`,
          textAlign: 'right',
          fontSize: '0.8rem',
          color: fontColor,
          opacity: 0.6
        }}>
          Powered by The Missing Piece Planning and Events, LLC
        </div>
      )}

      {/* Logout Button - Bottom Center */}
      <div style={{ 
        marginTop: '4rem', 
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <LogoutButton primaryColor={accentColor} />
      </div>
    </div>
  );
}