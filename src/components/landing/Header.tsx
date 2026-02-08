import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="w-full max-w-5xl rounded-full backdrop-blur-xl bg-card/60 border border-border/30 shadow-lg px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center group shrink-0">
            <img 
              src={wibooklyLogo} 
              alt="Wibookly" 
              className="h-28 w-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#security" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Security
            </a>
            <Link to="/pricing" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-full text-sm"
              onClick={onSignInClick}
            >
              Log In
            </Button>
            <Button 
              size="sm" 
              className="rounded-full px-5 text-sm font-medium shadow-md"
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
