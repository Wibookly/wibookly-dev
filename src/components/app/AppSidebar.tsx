import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plug, FolderOpen, Settings, LogOut, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import { OnboardingChecklist } from './OnboardingChecklist';
import { useConnectedEmails } from '@/hooks/useConnectedEmails';

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Integrations', href: '/integrations', icon: Plug },
  { title: 'Categories', href: '/categories', icon: FolderOpen },
  { title: 'AI Draft Settings', href: '/email-draft', icon: Sparkles },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const { connectedEmails } = useConnectedEmails();

  return (
    <aside className="hidden lg:flex w-64 h-screen bg-card border-r border-border flex-col">
      <div className="p-4 border-b border-border flex flex-col items-center">
        <img src={wibooklyLogo} alt="Wibookly" className="h-40 w-auto" />
        {/* Connected Emails */}
        {connectedEmails.length > 0 && (
          <div className="mt-3 w-full space-y-1">
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
      </div>

      {/* Onboarding Progress */}
      <div className="p-3">
        <OnboardingChecklist />
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
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
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
