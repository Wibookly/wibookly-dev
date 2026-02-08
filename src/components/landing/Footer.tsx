import { Link } from 'react-router-dom';
import wibooklyLogo from '@/assets/wibookly-logo.png';

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Link to="/" className="flex items-center group">
            <img 
              src={wibooklyLogo} 
              alt="Wibookly" 
              className="h-24 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <nav className="flex items-center gap-8 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <a href="mailto:support@wibookly.ai" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wibookly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
