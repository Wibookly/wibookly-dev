
-- Disable only user triggers on user_roles
ALTER TABLE public.user_roles DISABLE TRIGGER USER;

-- Clean up orphaned organizations
DELETE FROM public.subscriptions WHERE organization_id IN ('7c7cf949-83ba-4717-b08b-8b653f46c3e7', '6f07c26a-8280-4432-bb0f-765c79f36c3d', '66a7cb87-174b-4bef-8b76-30854855368b', 'b022ca13-43d9-45e5-a291-757ee427312a', '50ae5f74-51ed-4d34-805f-7aaed822e846');
DELETE FROM public.user_roles WHERE organization_id IN ('7c7cf949-83ba-4717-b08b-8b653f46c3e7', '6f07c26a-8280-4432-bb0f-765c79f36c3d', '66a7cb87-174b-4bef-8b76-30854855368b', 'b022ca13-43d9-45e5-a291-757ee427312a', '50ae5f74-51ed-4d34-805f-7aaed822e846');
DELETE FROM public.organization_members WHERE organization_id IN ('7c7cf949-83ba-4717-b08b-8b653f46c3e7', '6f07c26a-8280-4432-bb0f-765c79f36c3d', '66a7cb87-174b-4bef-8b76-30854855368b', 'b022ca13-43d9-45e5-a291-757ee427312a', '50ae5f74-51ed-4d34-805f-7aaed822e846');
DELETE FROM public.user_profiles WHERE organization_id IN ('7c7cf949-83ba-4717-b08b-8b653f46c3e7', '6f07c26a-8280-4432-bb0f-765c79f36c3d', '66a7cb87-174b-4bef-8b76-30854855368b', 'b022ca13-43d9-45e5-a291-757ee427312a', '50ae5f74-51ed-4d34-805f-7aaed822e846');
DELETE FROM public.categories WHERE organization_id IN ('7c7cf949-83ba-4717-b08b-8b653f46c3e7', '6f07c26a-8280-4432-bb0f-765c79f36c3d', '66a7cb87-174b-4bef-8b76-30854855368b', 'b022ca13-43d9-45e5-a291-757ee427312a', '50ae5f74-51ed-4d34-805f-7aaed822e846');
DELETE FROM public.ai_settings WHERE organization_id IN ('7c7cf949-83ba-4717-b08b-8b653f46c3e7', '6f07c26a-8280-4432-bb0f-765c79f36c3d', '66a7cb87-174b-4bef-8b76-30854855368b', 'b022ca13-43d9-45e5-a291-757ee427312a', '50ae5f74-51ed-4d34-805f-7aaed822e846');
DELETE FROM public.organizations WHERE id IN ('7c7cf949-83ba-4717-b08b-8b653f46c3e7', '6f07c26a-8280-4432-bb0f-765c79f36c3d', '66a7cb87-174b-4bef-8b76-30854855368b', 'b022ca13-43d9-45e5-a291-757ee427312a', '50ae5f74-51ed-4d34-805f-7aaed822e846');

-- Re-enable triggers
ALTER TABLE public.user_roles ENABLE TRIGGER USER;
