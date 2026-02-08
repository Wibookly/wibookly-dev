import { Link } from 'react-router-dom';
import wibooklyLogo from '@/assets/wibookly-logo.png';

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Link to="/" className="flex items-center group">
              <img 
                src={wibooklyLogo} 
                alt="Wibookly" 
                className="h-24 w-auto transition-transform duration-300 group-hover:scale-105"
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
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <a href="mailto:hello@wibookly.ai" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-border/10 text-center">
            <p className="text-sm text-muted-foreground/60">
              © {new Date().getFullYear()} Wibookly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
