import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <img src={wibooklyLogo} alt="WeBookly" className="h-8 w-auto" />
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}
