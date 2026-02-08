import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="flex items-center gap-8 h-16 px-10 rounded-full bg-card border border-border shadow-sm min-w-[480px]">
        <Link to="/" className="flex items-center">
          <img 
            src={wibooklyLogo} 
            alt="Wibookly" 
            className="h-20 w-auto" 
          />
        </Link>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full px-5"
            onClick={onSignInClick}
          >
            Log In
          </Button>
          <Button 
            size="sm" 
            className="rounded-full px-5 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={onSignInClick}
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
