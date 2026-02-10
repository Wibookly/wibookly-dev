import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { useActiveEmail } from '@/contexts/ActiveEmailContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function TimeIcon({ className }: { className?: string }) {
  const tod = getTimeOfDay();
  switch (tod) {
    case 'morning': return <Sunrise className={className} style={{ color: 'hsl(38 92% 50%)' }} />;
    case 'afternoon': return <Sun className={className} style={{ color: 'hsl(38 80% 55%)' }} />;
    case 'evening': return <Sunset className={className} style={{ color: 'hsl(25 90% 55%)' }} />;
    case 'night': return <Moon className={className} style={{ color: 'hsl(230 60% 65%)' }} />;
  }
}

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const { activeConnection } = useActiveEmail();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const firstName = profile?.full_name?.trim().split(' ')[0] || 'there';

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || 'U';

  useEffect(() => {
    if (!activeConnection) return;
    supabase
      .from('email_profiles')
      .select('profile_photo_url')
      .eq('connection_id', activeConnection.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.profile_photo_url) {
          setProfilePhotoUrl(data.profile_photo_url);
        }
      });
  }, [activeConnection]);

  const getGreeting = () => {
    const tod = getTimeOfDay();
    switch (tod) {
      case 'morning': return 'Good morning';
      case 'afternoon': return 'Good afternoon';
      case 'evening': return 'Good evening';
      case 'night': return 'Good night';
    }
  };

  return (
    <header className="hidden lg:flex h-16 border-b border-border/40 bg-card/30 backdrop-blur-sm px-6 items-center justify-between sticky top-0 z-20">
      {/* Left: Greeting with time-based icon */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <TimeIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {getGreeting()}, {firstName}
          </h2>
          <p className="text-xs text-muted-foreground">Here's what's happening with your inbox today</p>
        </div>
      </div>

      {/* Right: Avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-sm font-medium text-foreground hidden xl:block">
              {profile?.full_name || 'User'}
            </span>
            <Avatar className="h-9 w-9 border-2 border-primary/30">
              {profilePhotoUrl && (
                <AvatarImage src={profilePhotoUrl} alt={profile?.full_name || 'User'} />
              )}
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/settings" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Settings
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
