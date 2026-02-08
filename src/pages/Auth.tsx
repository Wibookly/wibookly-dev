import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import outlookLogo from '@/assets/outlook-logo.png';

// Google icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Outlook icon component using imported logo
const OutlookIcon = ({ logo }: { logo: string }) => (
  <img src={logo} alt="Outlook" className="w-5 h-5 object-contain" />
);

const complianceBadges = [
  { label: 'CASA', sublabel: 'Tier 3 Certified' },
  { label: 'GDPR', sublabel: 'Aligned' },
  { label: 'CCPA', sublabel: 'Compliant' },
  { label: 'SOC 2', sublabel: 'Type 1 Audited' },
];

export default function Auth() {
  const { user, loading, signInWithCognito } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/integrations', { replace: true });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Sign-in form */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-16 bg-background">
        {/* Top: Logo + Sign in link */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={wibooklyLogo} alt="Wibookly" className="h-12 w-auto" />
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Middle: Form */}
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Sign up with your
            <br />
            <span className="text-primary">work email</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Use your <span className="font-semibold text-foreground">work email</span> to get started with Wibookly.
          </p>

          <div className="mt-8 space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-14 text-base rounded-xl border-border hover:bg-secondary transition-colors"
              onClick={() => signInWithCognito('google')}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-14 text-base rounded-xl border-border hover:bg-secondary transition-colors"
              onClick={() => signInWithCognito('microsoft')}
            >
              <OutlookIcon logo={outlookLogo} />
              Continue with Outlook
            </Button>
          </div>
        </div>

        {/* Bottom: Compliance badges */}
        <div className="mt-12">
          <div className="flex items-center gap-6 mb-4">
            {complianceBadges.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
                  {badge.label === 'SOC 2' ? (
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  ) : badge.label === 'GDPR' ? (
                    <Lock className="w-4 h-4 text-primary" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="text-xs font-semibold text-foreground">{badge.label}</span>
                <span className="text-[10px] text-muted-foreground">{badge.sublabel}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            Wibookly has undergone a SOC 2® Type 1 examination and complies with GDPR, CCPA, and CASA Tier 3 requirements. By signing up, you agree to the Wibookly{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
          </p>
        </div>
      </div>

      {/* Right — Testimonial + gradient (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-12"
        style={{
          background: 'linear-gradient(135deg, hsl(150 40% 92%) 0%, hsl(180 40% 88%) 30%, hsl(210 50% 90%) 60%, hsl(170 35% 85%) 100%)',
        }}
      >
        <div className="max-w-md bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-10">
          <div className="text-4xl text-primary/30 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "
          </div>
          <p
            className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            I'm impressed by how good the generated replies are. It's just like myself. And I hardly ever need to edit them. I'm saving hours a week on email.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">S</span>
            </div>
            <div>
              <div className="font-semibold text-foreground">Sarah Mitchell</div>
              <div className="text-sm text-muted-foreground">VP of Sales, TechCorp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
