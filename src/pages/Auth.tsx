import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import outlookLogo from '@/assets/outlook-logo.png';
import { testimonials } from '@/data/testimonials';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const OutlookIcon = ({ logo }: { logo: string }) => (
  <img src={logo} alt="Outlook" className="w-8 h-8 object-contain" />
);

export default function Auth() {
  const { user, loading, signInWithCognito } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const isSignUp = mode === 'signup';

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (user) {
      navigate('/integrations', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        setFadeState('in');
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const toggleMode = () => {
    setSearchParams({ mode: isSignUp ? 'signin' : 'signup' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-bg">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const testimonial = testimonials[currentTestimonial];

  return (
    <div className="min-h-screen flex ocean-bg">
      {/* Left — Sign-in/Sign-up form */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={wibooklyLogo} alt="Wibookly" className="h-32 w-auto" />
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto flex flex-col items-center text-center">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {isSignUp ? (
              <>
                Get started with
                <br />
                <span className="text-primary">Wibookly</span>
              </>
            ) : (
              <>
                Welcome back to
                <br />
                <span className="text-primary">Wibookly</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {isSignUp
              ? <>Create your account to get started with Wibookly.</>
              : <>Sign in to continue managing your inbox with AI.</>
            }
          </p>

          <div className="mt-8 space-y-3 w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-14 text-base rounded-2xl border-border/50 bg-card/60 hover:bg-card/80 backdrop-blur-sm transition-all"
              onClick={() => signInWithCognito('google')}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-14 text-base rounded-2xl border-border/50 bg-card/60 hover:bg-card/80 backdrop-blur-sm transition-all"
              onClick={() => signInWithCognito('microsoft')}
            >
              <OutlookIcon logo={outlookLogo} />
              Continue with Outlook
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>

        {/* Bottom: Compliance badges */}
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-center gap-10 mb-5">
            {/* CASA */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                  <path d="M20 3L5 10V19C5 28.94 11.4 38.12 20 40C28.6 38.12 35 28.94 35 19V10L20 3Z" fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                  <path d="M15 20L18.5 23.5L26 16" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground">CASA</span>
              <span className="text-[10px] text-muted-foreground">Tier 3 Certified</span>
            </div>
            {/* GDPR */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const cx = 20 + 14 * Math.cos(rad - Math.PI / 2);
                    const cy = 20 + 14 * Math.sin(rad - Math.PI / 2);
                    return <circle key={angle} cx={cx} cy={cy} r="1.2" fill="hsl(var(--primary))" />;
                  })}
                  <rect x="14" y="19" width="12" height="10" rx="2" fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                  <path d="M16.5 19V15.5C16.5 13.57 18.07 12 20 12C21.93 12 23.5 13.57 23.5 15.5V19" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="20" cy="24" r="1.5" fill="hsl(var(--primary))"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground">GDPR</span>
              <span className="text-[10px] text-muted-foreground">Aligned</span>
            </div>
            {/* CCPA */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                  <path d="M14 6C14 6 12 8 11 11C10 14 9 16 9 18C9 20 10 23 11 25C12 27 13 29 14 31C15 33 16 35 18 36C20 37 22 36 23 35C24 34 25 32 26 30C27 28 28 26 29 24C30 22 31 20 31 18C31 16 30 13 29 11C28 9 27 8 26 7C25 6 23 5 21 5C19 5 16 5 14 6Z" fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                  <path d="M16 20L19 23L25 17" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground">CCPA</span>
              <span className="text-[10px] text-muted-foreground">Compliant</span>
            </div>
            {/* SOC 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                  <path d="M20 3L6 9V18.5C6 28.5 12 36.5 20 39C28 36.5 34 28.5 34 18.5V9L20 3Z" fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                  <path d="M14.5 20.5L18 24L25.5 16.5" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground">SOC 2</span>
              <span className="text-[10px] text-muted-foreground">Type 1 Audited</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md text-center">
            Wibookly has undergone a SOC 2® Type 1 examination and complies with GDPR, CCPA, and CASA Tier 3 requirements. By signing up, you agree to the Wibookly{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
          </p>
        </div>
      </div>

      {/* Right — Rotating testimonials (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-foreground/[0.03] backdrop-blur-[1px]" />
        
        <div
          className={`relative z-10 max-w-md glass-panel p-10 transition-opacity duration-400 ${
            fadeState === 'in' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-4xl text-primary/30 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "
          </div>
          <p
            className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {testimonial.quote}
          </p>
          <div className="flex items-center gap-4">
            <img
              src={testimonial.avatarUrl}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <div className="font-semibold text-foreground">{testimonial.name}</div>
              <div className="text-sm text-muted-foreground">{testimonial.title}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentTestimonial + 1} / {testimonials.length}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                // Map 5 dots to the progress through 50 testimonials
                const segment = Math.floor(currentTestimonial / (testimonials.length / 5));
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === segment ? 'bg-primary w-4' : 'bg-primary/20'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
