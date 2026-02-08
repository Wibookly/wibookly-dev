import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { ToolComparison } from '@/components/landing/ToolComparison';
import { Testimonials } from '@/components/landing/Testimonials';
import { Security } from '@/components/landing/Security';
import { FAQ } from '@/components/landing/FAQ';
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
    <div className="min-h-screen bg-[image:var(--gradient-hero)]">
      <Header onSignInClick={handleSignIn} />
      <main>
        <Hero onGetStartedClick={handleGetStarted} />
        <HowItWorks />
        <Features />
        <ToolComparison />
        <Testimonials />
        <Security />
        <FAQ />
        <CTASection onGetStartedClick={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
}
