import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { ReplaceTools } from '@/components/landing/ReplaceTools';
import { PricingSection } from '@/components/landing/PricingSection';
import { Security } from '@/components/landing/Security';
import { CTASection } from '@/components/landing/CTASection';
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
    <div className="min-h-screen ocean-bg">
      <Header onSignInClick={handleSignIn} />
      <main>
        <div className="section-divider">
          <Hero onGetStartedClick={handleGetStarted} />
        </div>
        <div className="section-divider">
          <HowItWorks />
        </div>
        <div className="section-divider">
          <Features />
        </div>
        <div className="section-divider">
          <ReplaceTools />
        </div>
        <div className="section-divider">
          <PricingSection />
        </div>
        <div className="section-divider">
          <Security />
        </div>
        <CTASection onGetStartedClick={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
}
