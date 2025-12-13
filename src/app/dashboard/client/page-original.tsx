import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTenantBranding, hexToRgba } from '@/lib/branding';
import LogoutButton from '@/components/LogoutButton';

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'CLIENT') {
    redirect('/');
  }

  // Get client profile
  const userEmail = (session.user as any)?.email || '';
  console.log('ClientDashboard - Loading profile for:', userEmail);
  
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { 
      clientProfile: {
        include: { tenant: true }
      }
    }
  });

  console.log('ClientDashboard - User found:', !!user, 'Has profile:', !!user?.clientProfile);

  if (!user || !user.clientProfile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#274E13' }}>
        <h1>Profile Not Found</h1>
        <p>User email: {userEmail}</p>
        <p>We couldn&apos;t find your client profile. Please contact support.</p>
      </div>
    );
  }

  const clientProfile = user.clientProfile;
  const tenant = clientProfile.tenant;
  const branding = tenant ? getTenantBranding(tenant) : null;

  // Color assignments (FIXED: secondary is background, primary is accent, fontColor is text)
  const accentColor = branding?.primaryColor || '#274E13';          // Primary = accent/borders/headings
  const backgroundColor = branding?.secondaryColor || '#D0CEB5';    // Secondary = background
  const backgroundColorWithOpacity = hexToRgba(backgroundColor, branding?.secondaryColorOpacity || 55);
  const fontColor = branding?.fontColor || '#000000';              // Font color = text color
  const logoBackgroundRemoval = branding?.logoBackgroundRemoval || false;
  const companyName = branding?.companyName || 'The Missing Piece';
  const fontFamily = branding?.fontFamily || "'Poppins', sans-serif";
  const headerFontFamily = branding?.headerFontFamily || "'Playfair Display', serif";
  const bodyFontFamily = branding?.bodyFontFamily || "'Poppins', sans-serif";

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: backgroundColorWithOpacity, fontFamily, color: fontColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          {branding?.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt={companyName} 
              style={{ 
                height: '50px', 
                marginBottom: '0.5rem', 
                backgroundColor: logoBackgroundRemoval ? 'transparent' : 'white',
                padding: logoBackgroundRemoval ? 0 : '0.25rem',
                borderRadius: logoBackgroundRemoval ? 0 : '4px'
              }} 
            />
          ) : (
            <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}>�</span>
          )}
          <h1 style={{ color: accentColor, margin: 0, fontFamily: headerFontFamily }}>💍 My Wedding Planning Workspace</h1>
          <p style={{ color: accentColor, fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontFamily: bodyFontFamily }}>
            Powered by {companyName}
          </p>
        </div>
        <LogoutButton primaryColor={accentColor} />
      </div>
      
      <div style={{ 
        background: 'white', 
        border: `2px solid ${accentColor}`, 
        borderRadius: '8px', 
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: `0 10px 40px ${accentColor}26`,
        fontFamily: bodyFontFamily
      }}>
        <h2 style={{ color: accentColor, fontFamily: headerFontFamily }}>
          Welcome, {clientProfile?.couple1FirstName}!
        </h2>
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        
        <div style={{
          background: 'white',
          border: `2px solid ${accentColor}`,
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: `0 4px 6px ${accentColor}1a`
        }}>
          <h3 style={{ color: accentColor }}>📋 Planning Checklist</h3>
          <p style={{ color: fontColor, fontSize: '0.9rem', marginTop: '0.5rem' }}>Track your wedding planning progress</p>
        </div>
        
        <div style={{
          background: 'white',
          border: `2px solid ${accentColor}`,
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: `0 4px 6px ${accentColor}1a`
        }}>
          <h3 style={{ color: accentColor }}>👥 Guest List</h3>
          <p style={{ color: fontColor, fontSize: '0.9rem', marginTop: '0.5rem' }}>Manage guests and RSVPs</p>
        </div>

        <div style={{
          background: 'white',
          border: `2px solid ${accentColor}`,
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: `0 4px 6px ${accentColor}1a`
        }}>
          <h3 style={{ color: accentColor }}>💐 Vendors</h3>
          <p style={{ color: fontColor, fontSize: '0.9rem', marginTop: '0.5rem' }}>View vendor info and communications</p>
        </div>

        <div style={{
          background: 'white',
          border: `2px solid ${accentColor}`,
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: `0 4px 6px ${accentColor}1a`
        }}>
          <h3 style={{ color: accentColor }}>📸 Gallery</h3>
          <p style={{ color: fontColor, fontSize: '0.9rem', marginTop: '0.5rem' }}>Share and view planning ideas</p>
        </div>

        <div style={{
          background: 'white',
          border: `2px solid ${accentColor}`,
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: `0 4px 6px ${accentColor}1a`
        }}>
          <h3 style={{ color: accentColor }}>💬 Messages</h3>
          <p style={{ color: fontColor, fontSize: '0.9rem', marginTop: '0.5rem' }}>Communicate with your planner</p>
        </div>

        <div style={{
          background: 'white',
          border: `2px solid ${accentColor}`,
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: `0 4px 6px ${accentColor}1a`
        }}>
          <h3 style={{ color: accentColor }}>⚙️ Settings</h3>
          <p style={{ color: fontColor, fontSize: '0.9rem', marginTop: '0.5rem' }}>Manage your profile and preferences</p>
        </div>

      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: backgroundColor, borderRadius: '8px', borderLeft: `4px solid ${accentColor}` }}>
        <p style={{ color: fontColor, margin: 0, fontSize: '0.85rem' }}>
          {branding?.footerText ? (
            <>
              <strong>{companyName}</strong> - {branding.footerText}
            </>
          ) : (
            <>
              💍 <strong>{companyName}</strong> - Making wedding planning easier
            </>
          )}
        </p>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '4rem', 
        paddingTop: '2rem', 
        borderTop: `1px solid ${accentColor}40`,
        textAlign: 'right',
        fontSize: '0.85rem',
        color: fontColor
      }}>
        Powered by The Missing Piece Planning
      </div>
    </div>
  );
}
