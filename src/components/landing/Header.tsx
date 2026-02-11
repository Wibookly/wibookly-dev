import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface HeaderProps {
  onSignInClick: () => void;
  onGetStartedClick: () => void;
}

export function Header({ onSignInClick, onGetStartedClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="flex items-center justify-between w-full max-w-2xl h-14 px-6 rounded-full glass-panel">
        {/* Logo — left side */}
        <Link to="/" className="flex items-center">
          <img 
            src={wibooklyLogo} 
            alt="Wibookly" 
            className="h-28 w-auto logo-holo" 
          />
        </Link>

        {/* Buttons — right side */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full px-5 border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 hover:border-primary/60"
            onClick={onSignInClick}
          >
            Log In
          </Button>
          <Button 
            variant="gradient"
            size="sm" 
            className="rounded-full px-5"
            onClick={onGetStartedClick}
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
