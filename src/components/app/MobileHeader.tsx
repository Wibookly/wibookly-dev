import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBranding } from '@/contexts/BrandingContext';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { logoUrl, brandName } = useBranding();
  
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <img src={logoUrl} alt={brandName} className="h-12 w-auto" />
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}
