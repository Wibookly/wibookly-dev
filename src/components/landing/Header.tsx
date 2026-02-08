import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between h-14 px-6 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-sm">
          <Link to="/" className="flex items-center group">
            <img 
              src={wibooklyLogo} 
              alt="WeBookly" 
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Security
            </a>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignInClick}
            >
              Sign In
            </Button>
            <Button 
              variant="gradient"
              size="sm" 
              onClick={onSignInClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
