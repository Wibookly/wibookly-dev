import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Search, Trash2, Loader2, Palette, Globe, Image } from 'lucide-react';
import { PlanType } from '@/lib/subscription';

interface UserWithOverride {
  user_id: string;
  email: string;
  full_name: string | null;
  organization_id: string;
  override?: {
    id: string;
    granted_plan: string;
    is_active: boolean;
    notes: string | null;
  };
  subscription?: {
    plan: string;
    status: string;
  };
  whiteLabel?: {
    id: string;
    subdomain_slug: string | null;
    brand_name: string;
    logo_url: string | null;
    is_enabled: boolean;
  };
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserWithOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    checkSuperAdmin();
  }, [user]);

  const checkSuperAdmin = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user!.id)
      .eq('role', 'super_admin')
      .maybeSingle();
    
    const isAdmin = !!data;
    setIsSuperAdmin(isAdmin);
    if (isAdmin) fetchUsers();
    else setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, email, full_name, organization_id');
      if (profileError) throw profileError;

      const { data: overrides } = await supabase
        .from('user_plan_overrides')
        .select('*');

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id, plan, status');

      const { data: whiteLabels } = await supabase
        .from('white_label_configs')
        .select('*');

      const merged: UserWithOverride[] = (profiles || []).map((p: any) => {
        const override = (overrides || []).find((o: any) => o.user_id === p.user_id);
        const sub = (subscriptions || []).find((s: any) => s.user_id === p.user_id);
        const wl = (whiteLabels || []).find((w: any) => w.user_id === p.user_id);
        return {
          user_id: p.user_id,
          email: p.email,
          full_name: p.full_name,
          organization_id: p.organization_id,
          override: override ? {
            id: override.id,
            granted_plan: override.granted_plan,
            is_active: override.is_active,
            notes: override.notes,
          } : undefined,
          subscription: sub ? { plan: sub.plan, status: sub.status } : undefined,
          whiteLabel: wl ? {
            id: wl.id,
            subdomain_slug: wl.subdomain_slug,
            brand_name: wl.brand_name,
            logo_url: wl.logo_url,
            is_enabled: wl.is_enabled,
          } : undefined,
        };
      });

      setUsers(merged);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const grantOverride = async (targetUserId: string, plan: PlanType) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase
        .from('user_plan_overrides')
        .upsert({
          user_id: targetUserId,
          granted_plan: plan,
          granted_by: user!.id,
          is_active: true,
        }, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Override granted', description: `User now has ${plan} plan access for free.` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const toggleOverride = async (targetUserId: string, isActive: boolean) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase
        .from('user_plan_overrides')
        .update({ is_active: isActive })
        .eq('user_id', targetUserId);
      if (error) throw error;
      toast({ title: isActive ? 'Override enabled' : 'Override disabled' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const removeOverride = async (targetUserId: string) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase
        .from('user_plan_overrides')
        .delete()
        .eq('user_id', targetUserId);
      if (error) throw error;
      toast({ title: 'Override removed' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  // White Label actions
  const saveWhiteLabel = async (targetUserId: string, data: { subdomain_slug: string; brand_name: string; logo_url: string }) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase
        .from('white_label_configs')
        .upsert({
          user_id: targetUserId,
          subdomain_slug: data.subdomain_slug || null,
          brand_name: data.brand_name,
          logo_url: data.logo_url || null,
          is_enabled: true,
        }, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'White label saved', description: 'Branding config updated.' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const toggleWhiteLabel = async (targetUserId: string, isEnabled: boolean) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase
        .from('white_label_configs')
        .update({ is_enabled: isEnabled })
        .eq('user_id', targetUserId);
      if (error) throw error;
      toast({ title: isEnabled ? 'White label enabled' : 'White label disabled' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const removeWhiteLabel = async (targetUserId: string) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase
        .from('white_label_configs')
        .delete()
        .eq('user_id', targetUserId);
      if (error) throw error;
      toast({ title: 'White label removed' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  if (isSuperAdmin === null || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/integrations" replace />;
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin</h1>
          <p className="text-sm text-muted-foreground">Manage user access, plan overrides, and white-label branding</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="overrides">
        <TabsList>
          <TabsTrigger value="overrides">
            <Shield className="w-4 h-4 mr-2" />
            Plan Overrides
          </TabsTrigger>
          <TabsTrigger value="whitelabel">
            <Palette className="w-4 h-4 mr-2" />
            White Label
          </TabsTrigger>
        </TabsList>

        {/* Plan Overrides Tab */}
        <TabsContent value="overrides">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">User Plan Overrides</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Stripe Plan</TableHead>
                    <TableHead>Override Plan</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{u.full_name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.subscription ? (
                          <Badge variant={u.subscription.status === 'active' ? 'default' : 'secondary'}>
                            {u.subscription.plan} ({u.subscription.status})
                          </Badge>
                        ) : (
                          <Badge variant="outline">No subscription</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.override?.granted_plan || ''}
                          onValueChange={(val) => grantOverride(u.user_id, val as PlanType)}
                          disabled={saving === u.user_id}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="No override" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {u.override && (
                          <Switch
                            checked={u.override.is_active}
                            onCheckedChange={(checked) => toggleOverride(u.user_id, checked)}
                            disabled={saving === u.user_id}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {u.override && (
                          <Button variant="ghost" size="icon" onClick={() => removeOverride(u.user_id)} disabled={saving === u.user_id}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {searchQuery ? 'No users match your search' : 'No users found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* White Label Tab */}
        <TabsContent value="whitelabel">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">White Label Branding</CardTitle>
              <p className="text-sm text-muted-foreground">Assign custom branding per user — their auth page and dashboard will show their logo instead of Wibookly.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Subdomain</TableHead>
                    <TableHead>Logo URL</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <WhiteLabelRow
                      key={u.user_id}
                      user={u}
                      saving={saving === u.user_id}
                      onSave={(data) => saveWhiteLabel(u.user_id, data)}
                      onToggle={(enabled) => toggleWhiteLabel(u.user_id, enabled)}
                      onRemove={() => removeWhiteLabel(u.user_id)}
                    />
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {searchQuery ? 'No users match your search' : 'No users found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Inline editable row for white label config
function WhiteLabelRow({
  user: u,
  saving,
  onSave,
  onToggle,
  onRemove,
}: {
  user: UserWithOverride;
  saving: boolean;
  onSave: (data: { subdomain_slug: string; brand_name: string; logo_url: string }) => void;
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
}) {
  const [brandName, setBrandName] = useState(u.whiteLabel?.brand_name || '');
  const [subdomain, setSubdomain] = useState(u.whiteLabel?.subdomain_slug || '');
  const [logoUrl, setLogoUrl] = useState(u.whiteLabel?.logo_url || '');
  const hasChanges = u.whiteLabel
    ? brandName !== u.whiteLabel.brand_name || subdomain !== (u.whiteLabel.subdomain_slug || '') || logoUrl !== (u.whiteLabel.logo_url || '')
    : brandName || subdomain || logoUrl;

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="text-sm font-medium">{u.full_name || 'No name'}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Brand name"
          className="w-[120px]"
          disabled={saving}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="slug"
            className="w-[100px]"
            disabled={saving}
          />
          <span className="text-xs text-muted-foreground">.wibookly.ai</span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          className="w-[160px]"
          disabled={saving}
        />
      </TableCell>
      <TableCell>
        {u.whiteLabel && (
          <Switch
            checked={u.whiteLabel.is_enabled}
            onCheckedChange={onToggle}
            disabled={saving}
          />
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {hasChanges && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onSave({ subdomain_slug: subdomain, brand_name: brandName, logo_url: logoUrl })}
              disabled={saving || !brandName}
            >
              Save
            </Button>
          )}
          {u.whiteLabel && (
            <Button variant="ghost" size="icon" onClick={onRemove} disabled={saving}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
