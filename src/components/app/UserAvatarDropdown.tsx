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
import { LogOut, User } from 'lucide-react';
import { useActiveEmail } from '@/contexts/ActiveEmailContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function UserAvatarDropdown() {
  const { profile, signOut } = useAuth();
  const { activeConnection } = useActiveEmail();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.trim().split(' ')[0] || 'User';
    }
    return 'User';
  };
  
  const firstName = getFirstName();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="h-9 w-9 border-2 border-primary/30">
            {profilePhotoUrl && (
              <AvatarImage src={profilePhotoUrl} alt={firstName} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
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
  );
}
