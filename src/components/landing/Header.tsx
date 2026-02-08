import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="flex items-center justify-between w-full max-w-3xl h-16 px-8 rounded-full glass-panel">
        {/* Logo — left side */}
        <Link to="/" className="flex items-center">
          <img 
            src={wibooklyLogo} 
            alt="Wibookly" 
            className="h-14 w-auto" 
          />
        </Link>

        {/* Buttons — right side */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full px-5 border-border/50 bg-card/60 hover:bg-card/80"
            onClick={onSignInClick}
          >
            Log In
          </Button>
          <Button 
            variant="gradient"
            size="sm" 
            className="rounded-full px-5"
            onClick={onSignInClick}
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
