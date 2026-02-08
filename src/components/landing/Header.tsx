import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="flex items-center gap-6 h-14 px-6 rounded-full bg-card border border-border shadow-sm">
        <Link to="/" className="flex items-center">
          <img 
            src={wibooklyLogo} 
            alt="WeBookly" 
            className="h-8 w-auto" 
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
            className="rounded-full px-5 bg-foreground text-background hover:bg-foreground/90"
            onClick={onSignInClick}
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
