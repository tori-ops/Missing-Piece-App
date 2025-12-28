import LoginForm from '@/components/LoginForm';
import BrandingFooter from '@/components/BrandingFooter';

export default function Home() {
  // Show login form - session check will happen in client
  return (
    <>
      <LoginForm />
      <BrandingFooter />
    </>
  );
}
