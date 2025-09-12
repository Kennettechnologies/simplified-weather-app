-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.handle_new_weather_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(resource text, permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.profiles p ON p.role = rp.role
    WHERE p.id = auth.uid()
    AND (rp.resource = resource OR rp.resource = 'all')
    AND permission = ANY(rp.permissions)
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'worker')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_staff_access(staff_id uuid, access_type text DEFAULT 'VIEW'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.staff_access_audit (
    accessed_by,
    operation,
    staff_record_id,
    ip_address,
    sensitive_data_accessed
  ) VALUES (
    auth.uid(),
    access_type,
    staff_id,
    inet_client_addr(),
    true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.enable_emergency_staff_access()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only farm owners can enable emergency access
  IF get_current_user_role() != 'farm_owner'::user_role THEN
    RAISE EXCEPTION 'Access denied: Only farm owners can enable emergency access';
  END IF;
  
  -- Log the emergency access activation
  INSERT INTO public.staff_access_audit (
    accessed_by,
    operation,
    ip_address,
    sensitive_data_accessed
  ) VALUES (
    auth.uid(),
    'EMERGENCY_ACCESS_ENABLED',
    inet_client_addr(),
    true
  );
  
  -- Set emergency access (this would need to be implemented at application level)
  PERFORM set_config('app.emergency_access', 'true', false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_staff_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Log any changes to staff records
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    INSERT INTO public.staff_access_audit (
      accessed_by,
      operation,
      staff_record_id,
      ip_address,
      sensitive_data_accessed
    ) VALUES (
      auth.uid(),
      TG_OP,
      OLD.id,
      inet_client_addr(),
      true -- Any modification is considered sensitive access
    );
  END IF;
  
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    INSERT INTO public.staff_access_audit (
      accessed_by,
      operation,
      staff_record_id,
      ip_address,
      sensitive_data_accessed
    ) VALUES (
      auth.uid(),
      TG_OP,
      NEW.id,
      inet_client_addr(),
      true -- Any modification is considered sensitive access
    );
  END IF;
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;