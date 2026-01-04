-- Fix organization_members: Allow admins to update and delete members
DROP POLICY IF EXISTS "deny_member_update" ON public.organization_members;
DROP POLICY IF EXISTS "deny_member_delete" ON public.organization_members;

CREATE POLICY "admins_can_update_members"
ON public.organization_members
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') 
  AND public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "admins_can_delete_members"
ON public.organization_members
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin') 
  AND public.is_org_member(auth.uid(), organization_id)
);

-- Fix user_roles: Prevent deletion of last admin in organization
CREATE OR REPLACE FUNCTION public.check_last_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is the last admin role in the organization
  IF OLD.role = 'admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE organization_id = OLD.organization_id
        AND role = 'admin'
        AND id != OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot delete the last admin role in the organization';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS prevent_last_admin_deletion ON public.user_roles;

CREATE TRIGGER prevent_last_admin_deletion
BEFORE DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.check_last_admin_role();