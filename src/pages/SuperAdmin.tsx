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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Search, Trash2, Loader2, Palette, Users, Mail, Building2, Pencil, X, Check, UserPlus, KeyRound, Eye, EyeOff, BarChart3, Filter, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PlanType } from '@/lib/subscription';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface UserConnection {
  id: string;
  provider: string;
  connected_email: string | null;
  is_connected: boolean;
  connected_at: string | null;
}

interface Organization {
  id: string;
  name: string;
  created_at: string;
  member_count: number;
}

// Plan display helpers
function getPlanDisplayInfo(user: UserWithOverride) {
  const hasPaidSubscription = user.subscription?.status === 'active' && user.subscription?.plan;
  const overridePlan = user.override?.is_active ? user.override.granted_plan : null;
  const subPlan = user.subscription?.plan || 'starter';
  const effectivePlan = overridePlan || subPlan;

  // If user has an active override, it's a free grant
  const isFreeOverride = !!overridePlan;

  if (effectivePlan === 'enterprise') {
    return { label: 'Business $', color: 'hsl(38 92% 50%)', bg: 'hsl(38 92% 50% / 0.12)', paid: true };
  }
  if (effectivePlan === 'pro') {
    return { label: isFreeOverride ? 'Pro Free' : 'Pro $', color: 'hsl(280 70% 60%)', bg: 'hsl(280 70% 60% / 0.12)', paid: !isFreeOverride };
  }
  // Starter
  if (hasPaidSubscription && subPlan === 'starter' && !isFreeOverride) {
    return { label: 'Starter $', color: 'hsl(210 80% 55%)', bg: 'hsl(210 80% 55% / 0.12)', paid: true };
  }
  return { label: 'Starter Free', color: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted-foreground) / 0.08)', paid: false };
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserWithOverride[]>([]);
  const [superAdminIds, setSuperAdminIds] = useState<Set<string>>(new Set());
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  // Filters
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
    if (isAdmin) {
      fetchUsers();
      loadOrganizations();
    } else {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, email, full_name, organization_id');
      if (profileError) throw profileError;

      const { data: overrides } = await supabase.from('user_plan_overrides').select('*');
      const { data: subscriptions } = await supabase.from('subscriptions').select('user_id, plan, status');
      const { data: whiteLabels } = await supabase.from('white_label_configs').select('*');
      
      // Fetch super admin roles
      const { data: roles } = await supabase.from('user_roles').select('user_id, role').eq('role', 'super_admin');
      const saIds = new Set((roles || []).map((r: any) => r.user_id));
      setSuperAdminIds(saIds);

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

  const loadOrganizations = async () => {
    try {
      const result = await callAdminFunction({ action: 'get_organizations' });
      setOrganizations(result.organizations || []);
    } catch (err: any) {
      console.error('Failed to load organizations', err);
    }
  };

  const callAdminFunction = async (body: Record<string, any>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Request failed');
    return result;
  };

  const grantOverride = async (targetUserId: string, plan: PlanType) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase.from('user_plan_overrides').upsert({
        user_id: targetUserId,
        granted_plan: plan,
        granted_by: user!.id,
        is_active: true,
      }, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Override granted', description: `User now has ${plan} plan access.` });
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
      const { error } = await supabase.from('user_plan_overrides').update({ is_active: isActive }).eq('user_id', targetUserId);
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
      const { error } = await supabase.from('user_plan_overrides').delete().eq('user_id', targetUserId);
      if (error) throw error;
      toast({ title: 'Override removed' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const saveWhiteLabel = async (targetUserId: string, data: { subdomain_slug: string; brand_name: string; logo_url: string }) => {
    setSaving(targetUserId);
    try {
      const { error } = await supabase.from('white_label_configs').upsert({
        user_id: targetUserId,
        subdomain_slug: data.subdomain_slug || null,
        brand_name: data.brand_name,
        logo_url: data.logo_url || null,
        is_enabled: true,
      }, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'White label saved' });
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
      const { error } = await supabase.from('white_label_configs').update({ is_enabled: isEnabled }).eq('user_id', targetUserId);
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
      const { error } = await supabase.from('white_label_configs').delete().eq('user_id', targetUserId);
      if (error) throw error;
      toast({ title: 'White label removed' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const deleteAccount = async (targetUserId: string) => {
    setSaving(targetUserId);
    try {
      await callAdminFunction({ action: 'delete_account', target_user_id: targetUserId });
      // Immediately remove from local state for instant UI feedback
      setUsers(prev => prev.filter(u => u.user_id !== targetUserId));
      toast({ title: 'Account deleted' });
      // Also refresh organizations since member counts may have changed
      loadOrganizations();
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

  // Separate super admins from subscribers
  const superAdminUsers = users.filter(u => superAdminIds.has(u.user_id));
  const subscriberUsers = users.filter(u => !superAdminIds.has(u.user_id));

  // Apply filters only to subscribers
  const filteredUsers = subscriberUsers.filter(u => {
    // Search
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Org filter
    if (filterOrg !== 'all' && u.organization_id !== filterOrg) return false;

    // Plan filter
    const planInfo = getPlanDisplayInfo(u);
    const effectivePlanKey = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';
    if (filterPlan === 'starter_free' && !(effectivePlanKey === 'starter' && !planInfo.paid)) return false;
    if (filterPlan === 'starter_paid' && !(effectivePlanKey === 'starter' && planInfo.paid)) return false;
    if (filterPlan === 'pro_free' && !(effectivePlanKey === 'pro' && !planInfo.paid)) return false;
    if (filterPlan === 'pro_paid' && !(effectivePlanKey === 'pro' && planInfo.paid)) return false;
    if (filterPlan === 'enterprise' && effectivePlanKey !== 'enterprise') return false;

    // Status filter
    if (filterStatus === 'active' && !(u.subscription?.status === 'active' || u.override?.is_active)) return false;
    if (filterStatus === 'deactivated' && (u.subscription?.status === 'active' || u.override?.is_active)) return false;

    return true;
  });

  // Summary stats (subscribers only, excluding super admins)
  const totalOrgs = organizations.length;
  const totalUsers = subscriberUsers.length;
  const activeUsers = subscriberUsers.filter(u => u.subscription?.status === 'active' || u.override?.is_active).length;
  const totalEmails = subscriberUsers.length;
  const planCounts = {
    starterFree: subscriberUsers.filter(u => {
      const info = getPlanDisplayInfo(u);
      const p = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';
      return p === 'starter' && !info.paid;
    }).length,
    starterPaid: subscriberUsers.filter(u => {
      const info = getPlanDisplayInfo(u);
      const p = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';
      return p === 'starter' && info.paid;
    }).length,
    proFree: subscriberUsers.filter(u => {
      const info = getPlanDisplayInfo(u);
      const p = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';
      return p === 'pro' && !info.paid;
    }).length,
    proPaid: subscriberUsers.filter(u => {
      const info = getPlanDisplayInfo(u);
      const p = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';
      return p === 'pro' && info.paid;
    }).length,
    business: subscriberUsers.filter(u => {
      const p = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';
      return p === 'enterprise';
    }).length,
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'hsl(0 72% 51% / 0.1)' }}>
          <Shield className="w-6 h-6" style={{ color: 'hsl(0 72% 51%)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wibookly Administrators</h1>
          <p className="text-sm text-muted-foreground">Manage subscribers, organizations, plans, and branding</p>
        </div>
      </div>

      {/* Super Admin Card - separate section */}
      <Card className="border-2" style={{ borderColor: 'hsl(0 72% 51% / 0.3)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: 'hsl(0 72% 51%)' }} />
            Platform Super Admins
          </CardTitle>
          <p className="text-sm text-muted-foreground">Full platform access — manage all subscribers, organizations, and settings.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {superAdminUsers.map(sa => (
              <div key={sa.user_id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="p-2 rounded-full" style={{ background: 'hsl(0 72% 51% / 0.1)' }}>
                  <Shield className="w-5 h-5" style={{ color: 'hsl(0 72% 51%)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{sa.full_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{sa.email}</p>
                </div>
                <Badge variant="outline" className="border-2 font-semibold" style={{ borderColor: 'hsl(0 72% 51% / 0.4)', color: 'hsl(0 72% 51%)' }}>
                  Super Admin
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
            ))}
            {superAdminUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">No super admins found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">
            <Users className="w-4 h-4 mr-2" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="whitelabel">
            <Palette className="w-4 h-4 mr-2" />
            White Label
          </TabsTrigger>
        </TabsList>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: 'hsl(210 80% 55%)' }} />
                    Subscriber Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Manage accounts, emails, plans, and access status.</p>
                </div>
                <CreateUserCard callAdminFunction={callAdminFunction} onCreated={fetchUsers} toast={toast} />
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={filterOrg} onValueChange={setFilterOrg}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="All Organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="All Plans" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="starter_free">Starter Free</SelectItem>
                    <SelectItem value="starter_paid">Starter $</SelectItem>
                    <SelectItem value="pro_free">Pro Free</SelectItem>
                    <SelectItem value="pro_paid">Pro $</SelectItem>
                    <SelectItem value="enterprise">Business</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Emails</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <UnifiedAccountRow
                        key={u.user_id}
                        user={u}
                        saving={saving === u.user_id}
                        currentUserId={user!.id}
                        callAdminFunction={callAdminFunction}
                        onDeleteAccount={() => deleteAccount(u.user_id)}
                        onRefresh={fetchUsers}
                        onGrantOverride={grantOverride}
                        onToggleOverride={toggleOverride}
                        onRemoveOverride={removeOverride}
                        organizations={organizations}
                        toast={toast}
                        filterStatus={filterStatus}
                      />
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {searchQuery || filterOrg !== 'all' || filterPlan !== 'all' ? 'No subscribers match your filters' : 'No subscribers found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Organizations Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: 'hsl(280 70% 60%)' }} />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationsTab
                callAdminFunction={callAdminFunction}
                currentUserId={user!.id}
                users={users}
                organizations={organizations}
                onRefresh={() => { loadOrganizations(); fetchUsers(); }}
                toast={toast}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* White Label Tab */}
        <TabsContent value="whitelabel">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5" style={{ color: 'hsl(280 70% 60%)' }} />
                White Label Branding
              </CardTitle>
              <p className="text-sm text-muted-foreground">Assign custom branding per subscriber.</p>
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
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: 'hsl(180 60% 45%)' }} />
          <h2 className="text-lg font-semibold text-foreground">Summary Report</h2>
        </div>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4" style={{ color: 'hsl(280 70% 60%)' }} />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Organizations</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalOrgs}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" style={{ color: 'hsl(210 80% 55%)' }} />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Subscribers</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Accounts</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>{activeUsers}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4" style={{ color: 'hsl(38 92% 50%)' }} />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Emails</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalEmails}</p>
          </Card>
        </div>

        {/* Plan Breakdown */}
        <Card className="p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Plan Distribution</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-foreground">Starter Free</p>
                <p className="text-xs text-muted-foreground">{planCounts.starterFree} subscribers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(210 80% 55%)' }} />
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-foreground">Starter</p>
                  <DollarSign className="w-3 h-3" style={{ color: 'hsl(210 80% 55%)' }} />
                </div>
                <p className="text-xs text-muted-foreground">{planCounts.starterPaid} subscribers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(280 70% 60% / 0.4)' }} />
              <div>
                <p className="text-sm font-medium text-foreground">Pro Free</p>
                <p className="text-xs text-muted-foreground">{planCounts.proFree} subscribers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(280 70% 60%)' }} />
              <div>
                <p className="text-sm font-medium text-foreground">Pro $</p>
                <p className="text-xs text-muted-foreground">{planCounts.proPaid} subscribers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(38 92% 50%)' }} />
              <div>
                <p className="text-sm font-medium text-foreground">Business</p>
                <p className="text-xs text-muted-foreground">{planCounts.business} subscribers</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Org Breakdown */}
        <Card className="p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Subscribers per Organization</p>
          <div className="space-y-2">
            {organizations.map(org => (
              <div key={org.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{org.name}</span>
                <Badge variant="secondary">{org.member_count} member{org.member_count !== 1 ? 's' : ''}</Badge>
              </div>
            ))}
            {organizations.length === 0 && (
              <p className="text-sm text-muted-foreground">No organizations yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ===== Create User Card =====
function CreateUserCard({
  callAdminFunction,
  onCreated,
  toast,
}: {
  callAdminFunction: (body: Record<string, any>) => Promise<any>;
  onCreated: () => void;
  toast: any;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [planOverride, setPlanOverride] = useState('none');
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCreate = async () => {
    if (!email || !password) return;
    setCreating(true);
    try {
      await callAdminFunction({
        action: 'create_user',
        email,
        password,
        full_name: fullName || undefined,
        plan_override: planOverride,
      });
      toast({ title: 'Subscriber created', description: `${email} has been created successfully.` });
      setEmail(''); setFullName(''); setPassword(''); setPlanOverride('none');
      setOpen(false);
      onCreated();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Create Subscriber
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Subscriber</DialogTitle>
          <DialogDescription>Create a new account with optional plan assignment.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assign Plan</Label>
            <Select value={planOverride} onValueChange={setPlanOverride}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Starter Free</SelectItem>
                <SelectItem value="starter">Starter Free (Override)</SelectItem>
                <SelectItem value="pro">Pro Free (Override)</SelectItem>
                <SelectItem value="enterprise">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={creating || !email || !password || password.length < 6}>
            {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Subscriber
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Unified Account Row =====
function UnifiedAccountRow({
  user: u,
  saving,
  currentUserId,
  callAdminFunction,
  onDeleteAccount,
  onRefresh,
  onGrantOverride,
  onToggleOverride,
  onRemoveOverride,
  organizations,
  toast,
  filterStatus,
}: {
  user: UserWithOverride;
  saving: boolean;
  currentUserId: string;
  callAdminFunction: (body: Record<string, any>) => Promise<any>;
  onDeleteAccount: () => void;
  onRefresh: () => void;
  onGrantOverride: (userId: string, plan: PlanType) => void;
  onToggleOverride: (userId: string, isActive: boolean) => void;
  onRemoveOverride: (userId: string) => void;
  organizations: Organization[];
  toast: any;
  filterStatus: string;
}) {
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [showConnections, setShowConnections] = useState(false);
  const [loadingConns, setLoadingConns] = useState(false);
  const [deletingConn, setDeletingConn] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState<boolean | null>(null);
  const [togglingBan, setTogglingBan] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const isSelf = u.user_id === currentUserId;

  const orgName = organizations.find(o => o.id === u.organization_id)?.name || u.organization_id.slice(0, 8) + '…';
  const planInfo = getPlanDisplayInfo(u);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await callAdminFunction({ action: 'get_user_status', target_user_id: u.user_id });
        const bannedUntil = result.banned_until;
        setIsBanned(bannedUntil ? new Date(bannedUntil) > new Date() : false);
      } catch {
        setIsBanned(false);
      }
    };
    checkStatus();
  }, [u.user_id]);

  // Filter by status
  if (filterStatus === 'active' && isBanned === true) return null;
  if (filterStatus === 'deactivated' && isBanned === false) return null;

  const loadConnections = async () => {
    if (showConnections) { setShowConnections(false); return; }
    setLoadingConns(true);
    try {
      const result = await callAdminFunction({ action: 'get_user_connections', target_user_id: u.user_id });
      setConnections(result.connections || []);
      setShowConnections(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingConns(false);
    }
  };

  const deleteConnection = async (connectionId: string) => {
    setDeletingConn(connectionId);
    try {
      await callAdminFunction({ action: 'delete_connection', connection_id: connectionId });
      toast({ title: 'Connection removed' });
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      onRefresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingConn(null);
    }
  };

  const toggleBan = async () => {
    setTogglingBan(true);
    try {
      await callAdminFunction({ action: 'toggle_ban', target_user_id: u.user_id, ban: !isBanned });
      setIsBanned(!isBanned);
      toast({ title: isBanned ? 'Account activated' : 'Account deactivated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setTogglingBan(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) return;
    setResettingPassword(true);
    try {
      await callAdminFunction({ action: 'reset_password', target_user_id: u.user_id, new_password: newPassword });
      toast({ title: 'Password reset', description: `Password updated for ${u.email}.` });
      setNewPassword(''); setResetDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setResettingPassword(false);
    }
  };

  const isFreeOverride = !!u.override?.is_active;
  const rawPlan = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';
  // Build a select-compatible value distinguishing paid vs free
  const selectPlanValue = rawPlan === 'enterprise' 
    ? 'enterprise' 
    : isFreeOverride 
      ? rawPlan  // 'starter' or 'pro' (free override)
      : (u.subscription?.status === 'active' ? `${rawPlan}_paid` : rawPlan);

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <p className="text-sm font-medium">{u.full_name || 'No name'}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-foreground">{orgName}</span>
        </TableCell>
        <TableCell>
          <Button variant="outline" size="sm" onClick={loadConnections} disabled={loadingConns}>
            {loadingConns ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
            {showConnections ? 'Hide' : 'View'}
          </Button>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            <Select
              value={selectPlanValue}
              onValueChange={async (val) => {
                // Free overrides
                if (val === 'starter' || val === 'pro') {
                  onGrantOverride(u.user_id, val as PlanType);
                  return;
                }
                // Paid Stripe plans
                if (val === 'starter_paid' || val === 'pro_paid' || val === 'enterprise') {
                  const stripePlan = val === 'starter_paid' ? 'starter' : val === 'pro_paid' ? 'pro' : 'enterprise';
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-assign-stripe-plan`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`,
                      },
                      body: JSON.stringify({ target_user_id: u.user_id, plan: stripePlan }),
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error || 'Failed to assign plan');
                    toast({ title: 'Paid plan assigned', description: `${u.email} is now on ${stripePlan} (Stripe).` });
                    onRefresh();
                  } catch (err: any) {
                    toast({ title: 'Error', description: err.message, variant: 'destructive' });
                  }
                }
              }}
              disabled={saving}
            >
              <SelectTrigger className="w-[150px] h-8" style={{ borderColor: planInfo.color }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                <SelectItem value="starter">Starter Free</SelectItem>
                <SelectItem value="pro">Pro Free</SelectItem>
                <SelectItem value="starter_paid">Starter $ (Stripe)</SelectItem>
                <SelectItem value="pro_paid">Pro $ (Stripe)</SelectItem>
                <SelectItem value="enterprise">Business $ (Stripe)</SelectItem>
              </SelectContent>
            </Select>
            {planInfo.paid && (
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" style={{ color: planInfo.color }} />
            )}
          </div>
        </TableCell>
        <TableCell>
          {isBanned === null ? (
            <Badge variant="outline" className="text-xs">Loading...</Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Switch
                checked={!isBanned}
                onCheckedChange={() => toggleBan()}
                disabled={togglingBan || isSelf}
              />
              <span className={`text-xs font-medium ${isBanned ? 'text-destructive' : 'text-foreground'}`}>
                {isBanned ? 'Deactivated' : 'Active'}
              </span>
            </div>
          )}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setResetDialogOpen(true)}>
                <KeyRound className="w-4 h-4 mr-2" />
                Reset Password
              </DropdownMenuItem>
              {!isSelf && (
                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                  <AlertDialog>
                    <AlertDialogTrigger className="flex items-center gap-2 w-full">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{u.email}</strong> and all their data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              )}
              {isSelf && (
                <DropdownMenuItem disabled>
                  <span className="text-xs text-muted-foreground">This is your account</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>Set a new password for {u.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
                <Button onClick={resetPassword} disabled={resettingPassword || !newPassword || newPassword.length < 6}>
                  {resettingPassword && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                  Reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
      {showConnections && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-0">
            <div className="px-6 py-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Connected Emails</p>
              {connections.length === 0 ? (
                <p className="text-xs text-muted-foreground">No email connections</p>
              ) : (
                connections.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">{conn.provider}</Badge>
                      <span className="text-sm">{conn.connected_email || 'Unknown'}</span>
                      {conn.is_connected ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Disconnected</Badge>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={deletingConn === conn.id}>
                          {deletingConn === conn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 text-destructive" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Email Connection</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove <strong>{conn.connected_email}</strong> and all associated data?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteConnection(conn.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ===== Organizations Tab =====
function OrganizationsTab({
  callAdminFunction,
  currentUserId,
  users,
  organizations,
  onRefresh,
  toast,
}: {
  callAdminFunction: (body: Record<string, any>) => Promise<any>;
  currentUserId: string;
  users: UserWithOverride[];
  organizations: Organization[];
  onRefresh: () => void;
  toast: any;
}) {
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const updateOrgName = async (orgId: string) => {
    setSaving(orgId);
    try {
      await callAdminFunction({ action: 'update_organization', organization_id: orgId, name: editName });
      toast({ title: 'Organization updated' });
      setEditingOrg(null);
      onRefresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    setSaving(orgId);
    try {
      await callAdminFunction({ action: 'delete_organization', organization_id: orgId });
      toast({ title: 'Organization deleted' });
      // Refresh after a small delay to allow DB to propagate
      setTimeout(() => onRefresh(), 500);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const callerOrgId = users.find(u => u.user_id === currentUserId)?.organization_id;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.map((org) => {
          const isSelfOrg = org.id === callerOrgId;
          return (
            <TableRow key={org.id}>
              <TableCell>
                {editingOrg === org.id ? (
                  <div className="flex items-center gap-1">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-[160px] h-8" disabled={saving === org.id} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateOrgName(org.id)} disabled={saving === org.id || !editName.trim()}>
                      <Check className="w-3 h-3 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingOrg(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{org.name}</span>
                    {isSelfOrg && <Badge variant="outline" className="text-xs">Your org</Badge>}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{org.member_count}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">{new Date(org.created_at).toLocaleDateString()}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingOrg(org.id); setEditName(org.name); }} disabled={saving === org.id}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  {!isSelfOrg && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={saving === org.id}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete <strong>{org.name}</strong> and all {org.member_count} member(s)?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteOrganization(org.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {organizations.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No organizations found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// ===== White Label Row =====
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
        <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Brand name" className="w-[120px]" disabled={saving} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="slug" className="w-[100px]" disabled={saving} />
          <span className="text-xs text-muted-foreground">.wibookly.ai</span>
        </div>
      </TableCell>
      <TableCell>
        <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-[160px]" disabled={saving} />
      </TableCell>
      <TableCell>
        {u.whiteLabel && (
          <Switch checked={u.whiteLabel.is_enabled} onCheckedChange={onToggle} disabled={saving} />
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {hasChanges && (
            <Button size="sm" variant="default" onClick={() => onSave({ subdomain_slug: subdomain, brand_name: brandName, logo_url: logoUrl })} disabled={saving || !brandName}>
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
