import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MeetingNotesPageContent from './MeetingNotesPageContent';

export default async function MeetingNotesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.email) {
    redirect('/login');
  }

  // Get user by email
  const user = await prisma.user.findUnique({
    where: { email: (session.user as any).email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      clientProfile: {
        select: {
          id: true,
          tenantId: true,
          tenant: {
            select: {
              id: true,
              brandingPrimaryColor: true,
              brandingBackgroundColor: true,
              brandingFontColor: true,
              brandingFontFamily: true,
              brandingHeaderFontFamily: true,
              brandingBodyFontFamily: true,
              brandingLogoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.clientProfile) {
    redirect('/dashboard/client');
  }

  const clientProfile = user.clientProfile;
  const tenant = clientProfile.tenant;

  return (
    <MeetingNotesPageContent
      clientId={clientProfile.id}
      tenantId={clientProfile.tenantId}
      primaryColor={tenant.brandingPrimaryColor}
      backgroundColor={tenant.brandingBackgroundColor}
      fontColor={tenant.brandingFontColor}
      fontFamily={tenant.brandingFontFamily}
      headerFontFamily={tenant.brandingHeaderFontFamily}
      bodyFontFamily={tenant.brandingBodyFontFamily}
      logoUrl={tenant.brandingLogoUrl}
    />
  );
}
