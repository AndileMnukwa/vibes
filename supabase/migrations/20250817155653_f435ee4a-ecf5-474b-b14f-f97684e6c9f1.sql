-- Fix the last remaining function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate ticket number: TKT-YYYYMMDD-XXXXXX (where X is random)
    new_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                  UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if this number already exists
    SELECT EXISTS(SELECT 1 FROM public.tickets WHERE ticket_number = new_number) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$;