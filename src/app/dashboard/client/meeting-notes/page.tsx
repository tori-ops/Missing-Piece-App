import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MeetingNotesPageContent from './MeetingNotesPageContent';

interface MeetingNotesPageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function MeetingNotesPage({ searchParams }: MeetingNotesPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.email) {
    redirect('/login');
  }

  const params = await searchParams;
  const currentUserId = params.userId;

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
              brandingSecondaryColor: true,
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

  // Use tenant branding with fallbacks
  const primaryColor = tenant?.brandingPrimaryColor || '#274E13';
  const backgroundColor = tenant?.brandingSecondaryColor || '#e1e0d0';
  const fontColor = tenant?.brandingFontColor || '#1B5E20';
  const fontFamily = tenant?.brandingFontFamily || "'Poppins', sans-serif";
  const headerFontFamily = tenant?.brandingHeaderFontFamily || "'Playfair Display', serif";
  const bodyFontFamily = tenant?.brandingBodyFontFamily || "'Poppins', sans-serif";
  const logoUrl = tenant?.brandingLogoUrl || null;

  return (
    <MeetingNotesPageContent
      clientId={clientProfile.id}
      tenantId={clientProfile.tenantId}
      currentUserId={currentUserId}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      fontColor={fontColor}
      fontFamily={fontFamily}
      headerFontFamily={headerFontFamily}
      bodyFontFamily={bodyFontFamily}
      logoUrl={logoUrl}
    />
  );
}
