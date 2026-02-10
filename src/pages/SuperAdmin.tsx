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
import { Shield, Search, Trash2, Loader2, Palette, Users, Mail, Building2, Pencil, X, Check, UserPlus, KeyRound, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PlanType } from '@/lib/subscription';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

      const { data: overrides } = await supabase.from('user_plan_overrides').select('*');
      const { data: subscriptions } = await supabase.from('subscriptions').select('user_id, plan, status');
      const { data: whiteLabels } = await supabase.from('white_label_configs').select('*');

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

  // Plan override actions
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

  // White label actions
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

  // Account management actions
  const deleteAccount = async (targetUserId: string) => {
    setSaving(targetUserId);
    try {
      await callAdminFunction({ action: 'delete_account', target_user_id: targetUserId });
      toast({ title: 'Account deleted', description: 'User and all associated data have been removed.' });
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin</h1>
          <p className="text-sm text-muted-foreground">Manage users, organizations, plans, and branding</p>
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

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">
            <Users className="w-4 h-4 mr-2" />
            Account Management
          </TabsTrigger>
          <TabsTrigger value="overrides">
            <Shield className="w-4 h-4 mr-2" />
            Plan Overrides
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Building2 className="w-4 h-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="whitelabel">
            <Palette className="w-4 h-4 mr-2" />
            White Label
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="space-y-4">
            {/* Create User Card */}
            <CreateUserCard callAdminFunction={callAdminFunction} onCreated={fetchUsers} toast={toast} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">User Accounts</CardTitle>
                <p className="text-sm text-muted-foreground">Manage accounts, email connections, passwords, and access.</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Connections</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <AccountRow
                        key={u.user_id}
                        user={u}
                        saving={saving === u.user_id}
                        currentUserId={user!.id}
                        callAdminFunction={callAdminFunction}
                        onDeleteAccount={() => deleteAccount(u.user_id)}
                        onRefresh={fetchUsers}
                        toast={toast}
                      />
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
          </div>
        </TabsContent>

        {/* Plan Overrides Tab */}
        <TabsContent value="overrides">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">User Plan Overrides</CardTitle>
              <p className="text-sm text-muted-foreground">Grant users a plan for free — they get full plan access without paying.</p>
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

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <OrganizationsTab
            callAdminFunction={callAdminFunction}
            currentUserId={user!.id}
            users={users}
            toast={toast}
          />
        </TabsContent>

        {/* White Label Tab */}
        <TabsContent value="whitelabel">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">White Label Branding</CardTitle>
              <p className="text-sm text-muted-foreground">Assign custom branding per user.</p>
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
      toast({ title: 'User created', description: `${email} has been created successfully.` });
      setEmail('');
      setFullName('');
      setPassword('');
      setPlanOverride('none');
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
          Create New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assign Plan (Free Override)</Label>
            <Select value={planOverride} onValueChange={setPlanOverride}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No override (Starter default)</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Business</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">If set, the user gets this plan for free without Stripe.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={creating || !email || !password || password.length < 6}>
            {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Account Row with expandable connections =====
function AccountRow({
  user: u,
  saving,
  currentUserId,
  callAdminFunction,
  onDeleteAccount,
  onRefresh,
  toast,
}: {
  user: UserWithOverride;
  saving: boolean;
  currentUserId: string;
  callAdminFunction: (body: Record<string, any>) => Promise<any>;
  onDeleteAccount: () => void;
  onRefresh: () => void;
  toast: any;
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

  // Load user ban status on mount
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
      toast({ title: isBanned ? 'Account unlocked' : 'Account locked', description: isBanned ? 'User can now sign in.' : 'User is blocked from signing in.' });
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
      setNewPassword('');
      setResetDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setResettingPassword(false);
    }
  };

  const effectivePlan = u.override?.is_active ? u.override.granted_plan : u.subscription?.plan || 'starter';

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
          {isBanned === null ? (
            <Badge variant="outline" className="text-xs">Loading...</Badge>
          ) : isBanned ? (
            <Badge variant="destructive" className="text-xs">Locked</Badge>
          ) : (
            <Badge variant="default" className="text-xs">Active</Badge>
          )}
        </TableCell>
        <TableCell>
          <Button variant="outline" size="sm" onClick={loadConnections} disabled={loadingConns}>
            {loadingConns ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
            {showConnections ? 'Hide' : 'View'}
          </Button>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">{effectivePlan}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-0.5">
            {/* Reset Password */}
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Reset Password">
                  <KeyRound className="w-4 h-4" />
                </Button>
              </DialogTrigger>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
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

            {/* Lock/Unlock */}
            {!isSelf && (
              <Button variant="ghost" size="icon" onClick={toggleBan} disabled={togglingBan || isBanned === null} title={isBanned ? 'Unlock account' : 'Lock account'}>
                {togglingBan ? <Loader2 className="w-4 h-4 animate-spin" /> : isBanned ? <Unlock className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
              </Button>
            )}

            {/* Delete */}
            {!isSelf && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={saving} title="Delete account">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete <strong>{u.email}</strong> and all their data. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isSelf && <span className="text-xs text-muted-foreground ml-1">You</span>}
          </div>
        </TableCell>
      </TableRow>
      {showConnections && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/30 p-0">
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
                            This will remove <strong>{conn.connected_email}</strong> and all associated data. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteConnection(conn.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Connection
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
  toast,
}: {
  callAdminFunction: (body: Record<string, any>) => Promise<any>;
  currentUserId: string;
  users: UserWithOverride[];
  toast: any;
}) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const result = await callAdminFunction({ action: 'get_organizations' });
      setOrganizations(result.organizations || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateOrgName = async (orgId: string) => {
    setSaving(orgId);
    try {
      await callAdminFunction({ action: 'update_organization', organization_id: orgId, name: editName });
      toast({ title: 'Organization updated' });
      setEditingOrg(null);
      loadOrganizations();
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
      toast({ title: 'Organization deleted', description: 'Organization and all members removed.' });
      loadOrganizations();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const callerOrgId = users.find(u => u.user_id === currentUserId)?.organization_id;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Organizations</CardTitle>
        <p className="text-sm text-muted-foreground">View, rename, or delete organizations and their members.</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
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
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-[160px] h-8"
                          disabled={saving === org.id}
                        />
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
                    <span className="text-xs text-muted-foreground font-mono">{org.id.slice(0, 8)}…</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{org.member_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{new Date(org.created_at).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingOrg(org.id); setEditName(org.name); }}
                        disabled={saving === org.id}
                      >
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
                                This will permanently delete <strong>{org.name}</strong> and all {org.member_count} member(s), including their accounts and data. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteOrganization(org.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete Organization
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
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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
