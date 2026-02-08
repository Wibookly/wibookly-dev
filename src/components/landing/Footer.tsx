import { Link } from 'react-router-dom';
import wibooklyLogo from '@/assets/wibookly-logo.png';

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/10">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <Link to="/" className="flex items-center">
              <img
                src={wibooklyLogo}
                alt="Wibookly"
                className="h-20 w-auto"
              />
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <Link to="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <a href="mailto:hello@wibookly.ai" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>

            <p className="text-sm text-muted-foreground/50 text-center">
              © {new Date().getFullYear()} Wibookly — AI-powered email intelligence
              <br />
              Privacy-first · No credit card required
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
