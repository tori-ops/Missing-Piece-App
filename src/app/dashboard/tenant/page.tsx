import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderTemplateDashboard } from '@/lib/template-renderer';
import { hexToRgba } from '@/lib/branding';
import LogoutButton from '@/components/LogoutButton';
import TenantStats from '@/components/TenantStats';
import ClientList from '@/components/ClientList';
import CreateClientFormModal from '@/components/CreateClientFormModal';
import TenantHeader from '@/components/TenantHeader';

// Component library for template rendering
const componentLibrary = {
  TenantHeader,
  TenantStats,
  ClientList,
  CreateClientFormModal,
  LogoutButton
};

export default async function TenantDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'TENANT') {
    redirect('/');
  }

  // Get tenant info with clients in single query to avoid pooler issues
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    include: { 
      tenant: {
        include: {
          clientProfiles: {
            include: { users: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      },
      clientProfile: true
    }
  });

  const tenantId = user?.tenantId || '';
  const tenant = user?.tenant;
  const clients = tenant?.clientProfiles || [];

  // Render dashboard using master template
  const dashboardConfig = await renderTemplateDashboard('TENANT', user, tenant, { clients });
  
  // Extract branding and layout
  const { branding, layout, componentsBySection, features } = dashboardConfig;
  
  // Fallback branding if template doesn't provide it
  const accentColor = branding?.primaryColor || '#274E13';
  const backgroundColor = branding?.secondaryColor || '#D0CEB5';
  const backgroundColorWithOpacity = hexToRgba(backgroundColor, branding?.secondaryColorOpacity || 55);
  const fontColor = branding?.fontColor || '#000000';
  const fontFamily = branding?.fontFamily || "'Poppins', sans-serif";

  return (
    <div style={{ 
      padding: layout.spacing || '2rem', 
      minHeight: '100vh', 
      background: backgroundColorWithOpacity, 
      fontFamily, 
      color: fontColor,
      maxWidth: layout.maxWidth,
      margin: '0 auto'
    }}>
      
      {/* Header Section */}
      {componentsBySection.header?.map((component) => (
        <div key={component.id} style={{ marginBottom: '2rem' }}>
          {component.type === 'header' && (
            <TenantHeader
              logo={branding?.logoUrl || undefined}
              companyName={branding?.companyName || tenant?.businessName || 'Tenant Dashboard'}
              userName={user?.firstName || 'Admin'}
              accentColor={accentColor}
              fontColor={fontColor}
              headerFontFamily={branding?.headerFontFamily || "'Playfair Display', serif"}
              bodyFontFamily={branding?.bodyFontFamily || "'Poppins', sans-serif"}
              tenantId={tenantId}
              tenantData={{
                firstName: tenant?.firstName || '',
                lastName: tenant?.lastName || '',
                businessName: tenant?.businessName || '',
                phone: tenant?.phone || '',
                email: tenant?.email || '',
                webAddress: tenant?.webAddress || undefined,
                status: tenant?.status || 'ACTIVE',
                subscriptionTier: tenant?.subscriptionTier || 'FREE',
                weddingDate: tenant?.weddingDate ? new Date(tenant.weddingDate).toISOString().split('T')[0] : undefined,
                budget: tenant?.budget || undefined,
              }}
              logoutButton={<LogoutButton primaryColor={accentColor} />}
            />
          )}
        </div>
      ))}

      {/* Main Section */}
      {componentsBySection.main && (
        <div>
          {/* Stats Component */}
          {componentsBySection.main
            .filter(component => component.type === 'stats' && component.isVisible)
            .map((component) => (
            <div key={component.id} style={{ marginBottom: '2rem' }}>
              <TenantStats 
                tenantId={tenantId} 
                primaryColor={accentColor} 
                fontColor={fontColor} 
                headerFontFamily={branding?.headerFontFamily || "'Playfair Display', serif"}
                bodyFontFamily={branding?.bodyFontFamily || "'Poppins', sans-serif"} 
              />
            </div>
          ))}

          {/* Client Management Section */}
          {componentsBySection.main
            .filter(component => component.type === 'client-list' && component.isVisible)
            .map((component) => (
            <div key={component.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '2rem', gap: '2rem' }}>
                
                {/* Left Column - Client List */}
                <div style={{ flex: 1 }}>
                  <h2 style={{ 
                    color: accentColor, 
                    marginTop: 0, 
                    fontFamily: branding?.headerFontFamily || "'Playfair Display', serif", 
                    fontSize: '2rem' 
                  }}>
                    Your Clients
                  </h2>
                  <ClientList 
                    tenantId={tenantId} 
                    clients={clients} 
                    primaryColor={accentColor} 
                    fontColor={fontColor} 
                    bodyFontFamily={branding?.bodyFontFamily || "'Poppins', sans-serif"} 
                  />
                </div>

                {/* Right Column - Add Client Button */}
                {features.allowClientCreation && (
                  <div style={{ marginTop: '1rem' }}>
                    <CreateClientFormModal tenantId={tenantId} primaryColor={accentColor} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
          fontSize: '0.85rem',
          color: fontColor
        }}>
          Powered by The Missing Piece Planning
        </div>
      )}
    </div>
  );
}
