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
      clientProfiles: {
        select: {
          id: true,
          tenantId: true,
          tenant: {
            select: {
              id: true,
              name: true,
              primaryColor: true,
              backgroundColor: true,
              fontColor: true,
              fontFamily: true,
              headerFontFamily: true,
              bodyFontFamily: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.clientProfiles.length === 0) {
    redirect('/dashboard/client');
  }

  const clientProfile = user.clientProfiles[0];
  const tenant = clientProfile.tenant;

  return (
    <MeetingNotesPageContent
      clientId={clientProfile.id}
      tenantId={clientProfile.tenantId}
      primaryColor={tenant.primaryColor}
      backgroundColor={tenant.backgroundColor}
      fontColor={tenant.fontColor}
      fontFamily={tenant.fontFamily}
      headerFontFamily={tenant.headerFontFamily}
      bodyFontFamily={tenant.bodyFontFamily}
      logoUrl={tenant.logoUrl}
    />
  );
}
