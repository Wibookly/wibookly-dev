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
import { LogOut, User, Sparkles } from 'lucide-react';
import { useActiveEmail } from '@/contexts/ActiveEmailContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const { activeConnection } = useActiveEmail();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const firstName = profile?.full_name?.trim().split(' ')[0] || 'there';

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || 'U';

  // Fetch profile photo from email_profiles table
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
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="hidden lg:flex h-16 border-b border-border/40 bg-card/30 backdrop-blur-sm px-6 items-center justify-between">
      {/* Left: Greeting */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
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
