import { NavLink, useLocation } from 'react-router-dom';
import { Plug, FolderOpen, Settings, LogOut, Sparkles, BarChart3, ChevronDown, Check, Mail, Calendar, Clock, Tag, Palette, User, PenTool, ListFilter, MessageSquare, Sun, Bot, UserPlus, Link2, Cog, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';
import { OnboardingChecklist } from './OnboardingChecklist';
import { PostOnboardingNav } from './PostOnboardingNav';
import { useActiveEmail } from '@/contexts/ActiveEmailContext';
import { useSubscription } from '@/lib/subscription';
import { UpgradeBadge } from '@/components/subscription/PlanBadge';
import { useState, useEffect } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function ProviderIcon({ provider, className }: { provider: 'google' | 'outlook'; className?: string }) {
  if (provider === 'google') {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none">
        <path d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FFC107"/>
        <path d="M6.306 14.691L12.877 19.51C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691Z" fill="#FF3D00"/>
        <path d="M24 44C29.166 44 33.86 42.023 37.409 38.808L31.219 33.57C29.211 35.091 26.715 36 24 36C18.798 36 14.381 32.683 12.717 28.054L6.195 33.079C9.505 39.556 16.227 44 24 44Z" fill="#4CAF50"/>
        <path d="M43.611 20.083H42V20H24V28H35.303C34.511 30.237 33.072 32.166 31.216 33.571L31.219 33.57L37.409 38.808C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#1976D2"/>
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <path d="M28 8H44V40H28V8Z" fill="#1976D2"/>
      <path d="M28 8L4 13V35L28 40V8Z" fill="#2196F3"/>
      <path d="M16 18C12.686 18 10 20.686 10 24C10 27.314 12.686 30 16 30C19.314 30 22 27.314 22 24C22 20.686 19.314 18 16 18ZM16 27C14.343 27 13 25.657 13 24C13 22.343 14.343 21 16 21C17.657 21 19 22.343 19 24C19 25.657 17.657 27 16 27Z" fill="white"/>
    </svg>
  );
}

interface NavSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function NavSection({ title, icon: Icon, children, defaultOpen = false }: NavSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors group">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-secondary">
            <Icon className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-foreground">{title}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-0.5 mt-1 ml-3 border-l-2 border-border">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  showUpgradeBadge?: boolean;
}

function NavItem({ href, icon: Icon, children, showUpgradeBadge }: NavItemProps) {
  const location = useLocation();
  const currentUrl = location.pathname + location.search;
  const isActive = currentUrl === href || (location.pathname === href.split('?')[0] && location.search === '?' + href.split('?')[1]);
  
  return (
    <NavLink
      to={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1">{children}</span>
      {showUpgradeBadge && <UpgradeBadge />}
    </NavLink>
  );
}

export function AppSidebar() {
  const { signOut, user, organization } = useAuth();
  const location = useLocation();
  const { connections, activeConnection, setActiveConnectionId, loading } = useActiveEmail();
  const { hasFeature } = useSubscription();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if current user is super_admin
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .maybeSingle()
      .then(({ data }) => setIsSuperAdmin(!!data));
  }, [user]);

  // Check feature access for upgrade badges
  const needsUpgradeForAutoReply = !hasFeature('aiAutoReply');
  const needsUpgradeForAnalytics = !hasFeature('advancedAnalytics');

  // Check if onboarding has been dismissed
  useEffect(() => {
    if (organization?.id) {
      const dismissed = localStorage.getItem(`onboarding-dismissed-${organization.id}`);
      setIsOnboardingComplete(dismissed === 'true');
    }
  }, [organization?.id]);

  const { logoUrl, brandName } = useBranding();

  return (
    <aside className="hidden lg:flex w-72 h-screen bg-[image:var(--gradient-card)] backdrop-blur-md border-r border-border/40 flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <img src={logoUrl} alt={brandName} className="h-12 w-auto" />
      </div>

      {/* Active Email Selector */}
      <div className="px-4 py-3 border-b border-border" data-tour="email-selector">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connected Emails</h3>
        {loading ? (
          <div className="h-10 bg-secondary animate-pulse rounded-lg" />
        ) : connections.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors cursor-pointer min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {activeConnection && (
                    <ProviderIcon provider={activeConnection.provider} className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium text-foreground truncate">
                    {activeConnection?.email || 'Select email'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px] bg-card">
              {connections.map((connection) => (
                <DropdownMenuItem
                  key={connection.id}
                  onClick={() => setActiveConnectionId(connection.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ProviderIcon provider={connection.provider} className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs truncate flex-1">{connection.email}</span>
                  {activeConnection?.id === connection.id && (
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="px-3 py-2 text-xs text-muted-foreground bg-secondary rounded-lg">
            No emails connected
          </div>
        )}
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-3 space-y-1.5">
          {/* Account Provisioning */}
          <NavSection title="Account Provisioning" icon={UserPlus} defaultOpen>
            <div data-tour="nav-connections">
              <NavItem href="/integrations" icon={Link2}>Email & Calendar Connections</NavItem>
            </div>
          </NavSection>

          {/* Email & Calendar Settings */}
          <NavSection title="Email & Calendar" icon={Cog} defaultOpen>
            <NavItem href="/integrations?tab=settings" icon={Clock}>Availability & Calendar</NavItem>
            <div data-tour="nav-categories">
              <NavItem href="/categories" icon={Tag}>Email Categories</NavItem>
            </div>
          </NavSection>

          {/* AI Settings */}
          <NavSection title="AI Settings" icon={Sparkles} defaultOpen>
            <div data-tour="nav-ai-drafts">
              <NavItem href="/email-draft" icon={Sparkles}>AI Draft Settings</NavItem>
            </div>
            <NavItem href="/email-draft?tab=auto-reply" icon={MessageSquare} showUpgradeBadge={needsUpgradeForAutoReply}>AI Auto Reply</NavItem>
            <NavItem href="/email-draft?tab=labels" icon={Palette}>AI Label Colors</NavItem>
          </NavSection>

          {/* AI Assistant */}
          <NavSection title="AI Assistant" icon={Bot} defaultOpen>
            <div data-tour="nav-daily-brief">
              <NavItem href="/ai-daily-brief" icon={Sun}>My Daily Brief</NavItem>
            </div>
            <div data-tour="nav-ai-chat">
              <NavItem href="/ai-chat" icon={MessageSquare}>AI Chat</NavItem>
            </div>
          </NavSection>

          {/* Settings */}
          <NavSection title="Settings" icon={Settings} defaultOpen>
            <NavItem href="/settings?section=profile" icon={User}>My Profile</NavItem>
            <NavItem href="/settings?section=signature" icon={PenTool}>My Signature</NavItem>
          </NavSection>

          {/* Reports */}
          <NavSection title="Reports" icon={BarChart3} defaultOpen>
            <NavItem href="/ai-activity" icon={BarChart3} showUpgradeBadge={needsUpgradeForAnalytics}>AI Activity</NavItem>
          </NavSection>

          {/* Super Admin - only visible to super_admin users */}
          {isSuperAdmin && (
            <NavSection title="Super Admin" icon={Shield} defaultOpen>
              <NavItem href="/super-admin" icon={Shield}>User Overrides</NavItem>
            </NavSection>
          )}
        </nav>
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-border">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
