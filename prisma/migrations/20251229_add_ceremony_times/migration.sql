-- Add ceremony_times JSONB column to store multiple ceremonies with time and type
ALTER TABLE public.client_profiles 
ADD COLUMN ceremony_times JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add comment to document the structure
COMMENT ON COLUMN public.client_profiles.ceremony_times IS 
'Array of ceremony times with structure: [{"ceremonyType": "Main Ceremony", "timeOfDay": "14:30"}, ...]';
