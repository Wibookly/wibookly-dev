import { Link } from 'react-router-dom';
import wibooklyLogo from '@/assets/wibookly-logo.png';

export function Footer() {
  return (
    <footer className="py-16 border-t border-foreground/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Link to="/" className="flex items-center group">
            <img 
              src={wibooklyLogo} 
              alt="Wibookly" 
              className="h-32 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <nav className="flex items-center gap-8 text-sm text-foreground/70">
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

          <p className="text-sm text-foreground/50">
            © {new Date().getFullYear()} Wibookly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
