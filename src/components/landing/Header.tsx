import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="w-full pt-6 pb-4 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto bg-card/80 backdrop-blur-sm rounded-full px-6 py-2 border border-border/50 shadow-sm">
          <Link to="/" className="flex items-center group">
            <img 
              src={wibooklyLogo} 
              alt="Wibookly" 
              className="h-28 w-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-foreground/80 hover:text-foreground hover:bg-transparent font-medium"
              onClick={onSignInClick}
            >
              Log In
            </Button>
            <Button 
              size="sm" 
              className="rounded-full px-5 font-medium"
              onClick={onSignInClick}
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
