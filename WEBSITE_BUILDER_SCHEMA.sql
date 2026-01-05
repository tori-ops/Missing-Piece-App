-- Website Builder Schema for Supabase
-- This migration adds website builder functionality to the platform

-- 1. Add website builder toggle and basic fields to ClientProfile
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS website_builder_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS website_url_slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS website_status VARCHAR(50) DEFAULT 'draft'; -- 'draft', 'published', 'disabled'

-- 2. Create client_websites table for storing website builder content
CREATE TABLE IF NOT EXISTS public.client_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Story Content
  how_we_met TEXT,
  engagement_story TEXT,
  
  -- Design Preferences
  font_family VARCHAR(255),
  color_primary VARCHAR(7), -- HEX color
  color_secondary VARCHAR(7), -- HEX color
  color_accent VARCHAR(7), -- HEX color
  
  -- Website URL
  url_slug VARCHAR(255) NOT NULL UNIQUE,
  
  -- Status & Metadata
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_slug_per_tenant UNIQUE(tenant_id, url_slug),
  CONSTRAINT valid_hex_colors CHECK (
    (color_primary IS NULL OR color_primary ~ '^#[0-9A-Fa-f]{6}$') AND
    (color_secondary IS NULL OR color_secondary ~ '^#[0-9A-Fa-f]{6}$') AND
    (color_accent IS NULL OR color_accent ~ '^#[0-9A-Fa-f]{6}$')
  ),
  CONSTRAINT valid_slug CHECK (url_slug ~ '^[a-z0-9\-]+$')
);

CREATE INDEX idx_client_websites_client_id ON public.client_websites(client_profile_id);
CREATE INDEX idx_client_websites_tenant_id ON public.client_websites(tenant_id);
CREATE INDEX idx_client_websites_slug ON public.client_websites(url_slug);
CREATE INDEX idx_client_websites_status ON public.client_websites(status);

-- 3. Create website_images table for managing uploaded images
CREATE TABLE IF NOT EXISTS public.website_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_website_id UUID NOT NULL REFERENCES public.client_websites(id) ON DELETE CASCADE,
  
  -- Image category
  category VARCHAR(50) NOT NULL, -- 'ring_photo', 'background_image', 'couple_photo'
  
  -- Storage reference (path in Supabase storage)
  storage_bucket VARCHAR(255) NOT NULL,
  storage_path VARCHAR(1024) NOT NULL,
  
  -- Metadata
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(50),
  
  -- Ordering for display
  display_order INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_category CHECK (category IN ('ring_photo', 'background_image', 'couple_photo'))
);

CREATE INDEX idx_website_images_client_website_id ON public.website_images(client_website_id);
CREATE INDEX idx_website_images_category ON public.website_images(category);

-- 4. Create website_registries table for registry links
CREATE TABLE IF NOT EXISTS public.website_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_website_id UUID NOT NULL REFERENCES public.client_websites(id) ON DELETE CASCADE,
  
  -- Registry details
  registry_name VARCHAR(255) NOT NULL, -- e.g., "Williams-Sonoma", "Bed Bath & Beyond", custom name
  registry_url VARCHAR(1024) NOT NULL,
  registry_order INTEGER NOT NULL DEFAULT 0,
  
  -- Tenant configuration
  is_optional BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT max_registries CHECK ((SELECT COUNT(*) FROM public.website_registries WHERE client_website_id = id) <= 5),
  CONSTRAINT valid_url CHECK (registry_url ~ '^https?://'),
  CONSTRAINT max_url_length CHECK (CHAR_LENGTH(registry_url) <= 250)
);

CREATE INDEX idx_website_registries_client_website_id ON public.website_registries(client_website_id);

-- 5. Create website_publish_history table for tracking changes
CREATE TABLE IF NOT EXISTS public.website_publish_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_website_id UUID NOT NULL REFERENCES public.client_websites(id) ON DELETE CASCADE,
  
  action VARCHAR(50) NOT NULL, -- 'published', 'drafted', 'archived', 'updated'
  published_by UUID, -- User ID (tenant or system)
  published_by_type VARCHAR(50), -- 'tenant', 'client', 'system'
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_website_publish_history_client_website_id ON public.website_publish_history(client_website_id);

-- 6. Enable RLS on new tables
ALTER TABLE public.client_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_publish_history ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies

-- client_websites policies
CREATE POLICY "Tenants can view their own client websites"
  ON public.client_websites
  FOR SELECT
  USING (tenant_id = auth.uid() OR tenant_id IN (
    SELECT id FROM public.tenants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Tenants can insert website for their clients"
  ON public.client_websites
  FOR INSERT
  WITH CHECK (tenant_id = auth.uid() OR tenant_id IN (
    SELECT id FROM public.tenants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Tenants can update website for their clients"
  ON public.client_websites
  FOR UPDATE
  USING (tenant_id = auth.uid() OR tenant_id IN (
    SELECT id FROM public.tenants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Tenants can delete website for their clients"
  ON public.client_websites
  FOR DELETE
  USING (tenant_id = auth.uid() OR tenant_id IN (
    SELECT id FROM public.tenants WHERE owner_id = auth.uid()
  ));

-- website_images policies
CREATE POLICY "Users can view images for websites they can access"
  ON public.website_images
  FOR SELECT
  USING (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage images for their websites"
  ON public.website_images
  FOR INSERT
  WITH CHECK (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete images for their websites"
  ON public.website_images
  FOR DELETE
  USING (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));

-- website_registries policies
CREATE POLICY "Users can view registries for websites they can access"
  ON public.website_registries
  FOR SELECT
  USING (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage registries for their websites"
  ON public.website_registries
  FOR INSERT
  WITH CHECK (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete registries for their websites"
  ON public.website_registries
  FOR DELETE
  USING (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));

-- website_publish_history policies
CREATE POLICY "Users can view history for websites they can access"
  ON public.website_publish_history
  FOR SELECT
  USING (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create history entries for their websites"
  ON public.website_publish_history
  FOR INSERT
  WITH CHECK (client_website_id IN (
    SELECT id FROM public.client_websites WHERE 
    tenant_id = auth.uid() OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  ));
