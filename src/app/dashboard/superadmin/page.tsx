import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import BrandingFooter from '@/components/BrandingFooter';

export default async function SuperAdminDashboardPage() {
  // Server-side auth check can be added here if needed
  return (
    <>
      <SuperAdminDashboard />
      <BrandingFooter />
    </>
  );
}
