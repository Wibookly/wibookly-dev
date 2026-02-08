import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { ToolComparison } from '@/components/landing/ToolComparison';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Security } from '@/components/landing/Security';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSignInClick={handleSignIn} />
      <main>
        <Hero onGetStartedClick={handleGetStarted} />
        <ToolComparison />
        <HowItWorks />
        <Features />
        <Security />
      </main>
      <Footer />
    </div>
  );
}
