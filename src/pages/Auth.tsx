import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';

// Google icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Microsoft icon component
const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
  </svg>
);

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
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col">
      <header className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-10">
            <div className="text-center mb-10">
              <img src={wibooklyLogo} alt="WeBookly" className="h-12 w-auto mx-auto mb-8" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="mt-2 text-muted-foreground">
                Sign in to continue to WeBookly
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start gap-3 h-13 text-base rounded-xl"
                onClick={() => signInWithCognito('google')}
              >
                <GoogleIcon />
                <span className="flex-1 text-left">Continue with Google</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start gap-3 h-13 text-base rounded-xl"
                onClick={() => signInWithCognito('microsoft')}
              >
                <MicrosoftIcon />
                <span className="flex-1 text-left">Continue with Microsoft</span>
              </Button>
            </div>

            <p className="mt-10 text-center text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
