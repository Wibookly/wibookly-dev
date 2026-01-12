CREATE OR REPLACE FUNCTION public.initialize_email_connection()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_profile RECORD;
  default_cats TEXT[][] := ARRAY[
    ['Urgent', '#EF4444'],
    ['Follow Up', '#F97316'],
    ['Approvals', '#EAB308'],
    ['Events', '#22C55E'],
    ['Customers', '#06B6D4'],
    ['Vendors', '#3B82F6'],
    ['Internal', '#8B5CF6'],
    ['Projects', '#EC4899'],
    ['Finance', '#14B8A6'],
    ['FYI', '#6B7280']
  ];
  i INT;
BEGIN
  -- Only run when connection becomes active
  IF NEW.is_connected = true AND (OLD IS NULL OR OLD.is_connected = false) THEN
    -- Get user profile data
    SELECT full_name, title, phone, mobile, website, email_signature, 
           signature_logo_url, signature_font, signature_color
    INTO v_user_profile
    FROM public.user_profiles
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    -- Create email profile if it doesn't exist
    INSERT INTO public.email_profiles (
      connection_id, user_id, organization_id,
      full_name, title, phone, mobile, website, email_signature,
      signature_logo_url, signature_font, signature_color
    )
    VALUES (
      NEW.id, NEW.user_id, NEW.organization_id,
      COALESCE(v_user_profile.full_name, ''),
      v_user_profile.title,
      v_user_profile.phone,
      v_user_profile.mobile,
      v_user_profile.website,
      v_user_profile.email_signature,
      v_user_profile.signature_logo_url,
      COALESCE(v_user_profile.signature_font, 'Arial, sans-serif'),
      COALESCE(v_user_profile.signature_color, '#333333')
    )
    ON CONFLICT (connection_id) DO NOTHING;
    
    -- Create default categories if none exist for this connection
    IF NOT EXISTS (
      SELECT 1 FROM public.categories 
      WHERE connection_id = NEW.id
    ) THEN
      FOR i IN 1..array_length(default_cats, 1) LOOP
        INSERT INTO public.categories (
          organization_id, connection_id, name, color, sort_order, is_enabled
        )
        VALUES (
          NEW.organization_id, NEW.id, default_cats[i][1], default_cats[i][2], i - 1, true
        );
      END LOOP;
    END IF;
    
    -- Create default AI settings if none exist for this connection
    INSERT INTO public.ai_settings (
      organization_id, connection_id, writing_style
    )
    VALUES (
      NEW.organization_id, NEW.id, 'professional'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;