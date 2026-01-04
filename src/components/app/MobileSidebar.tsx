import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plug, FolderOpen, Settings, LogOut, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import { OnboardingChecklist } from './OnboardingChecklist';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { useConnectedEmails } from '@/hooks/useConnectedEmails';

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Integrations', href: '/integrations', icon: Plug },
  { title: 'Categories', href: '/categories', icon: FolderOpen },
  { title: 'AI Drafts', href: '/email-draft', icon: Sparkles },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const { connectedEmails } = useConnectedEmails();

  const handleNavClick = () => {
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <img src={wibooklyLogo} alt="Wibookly" className="h-10 w-auto" />
          </div>
          {/* Connected Emails */}
          {connectedEmails.length > 0 && (
            <div className="mt-2 space-y-1">
              {connectedEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 rounded-md"
                >
                  <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs font-medium text-primary truncate">{email}</span>
                </div>
              ))}
            </div>
          )}
        </SheetHeader>

        {/* Onboarding Progress */}
        <div className="p-3">
          <OnboardingChecklist onStepClick={handleNavClick} />
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
