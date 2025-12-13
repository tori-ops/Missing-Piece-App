import { prisma } from '@/lib/prisma';

interface TenantStatsProps {
  tenantId: string;
  primaryColor?: string;
  accentColor?: string;
  fontColor?: string;
  headerFontFamily?: string;
  bodyFontFamily?: string;
}

export default async function TenantStats({ tenantId, primaryColor = '#274E13', fontColor = '#000000', headerFontFamily = "'Playfair Display', serif", bodyFontFamily = "'Poppins', sans-serif" }: TenantStatsProps) {
  // Get stats for this tenant
  const totalClients = await prisma.clientProfile.count({
    where: { tenantId }
  });

  // Get next upcoming wedding
  const nextWedding = await prisma.clientProfile.findFirst({
    where: {
      tenantId,
      weddingDate: {
        gte: new Date()
      }
    },
    orderBy: { weddingDate: 'asc' }
  });

  // Calculate days until next wedding
  let daysUntil = 'N/A';
  if (nextWedding?.weddingDate) {
    const today = new Date();
    const weddingDate = new Date(nextWedding.weddingDate);
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysUntil = diffDays < 0 ? 'Passed' : `${diffDays} days`;
  }

  // Get couple name for next wedding
  const nextWeddingCoupleName = nextWedding?.couple1LastName || '—';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{
        background: 'white',
        border: `2px solid ${primaryColor}`,
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: `0 2px 8px ${primaryColor}20`
      }}>
        <p style={{ color: fontColor, margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, fontFamily: bodyFontFamily }}>Total Clients</p>
        <h3 style={{ color: primaryColor, margin: 0, fontSize: '2.5rem', fontWeight: 'bold', fontFamily: headerFontFamily }}>{totalClients}</h3>
      </div>

      <div style={{
        background: 'white',
        border: `2px solid ${primaryColor}`,
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: `0 2px 8px ${primaryColor}20`
      }}>
        <p style={{ color: fontColor, margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, fontFamily: bodyFontFamily }}>Next Wedding</p>
        <h3 style={{ color: primaryColor, margin: 0, fontSize: '2.5rem', fontWeight: 'bold', fontFamily: headerFontFamily }}>{nextWeddingCoupleName}</h3>
      </div>

      <div style={{
        background: 'white',
        border: `2px solid ${primaryColor}`,
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: `0 2px 8px ${primaryColor}20`
      }}>
        <p style={{ color: fontColor, margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, fontFamily: bodyFontFamily }}>Days Until Wedding</p>
        <h3 style={{ color: primaryColor, margin: 0, fontSize: '2.5rem', fontWeight: 'bold', fontFamily: headerFontFamily }}>{daysUntil}</h3>
      </div>
    </div>
  );
}
