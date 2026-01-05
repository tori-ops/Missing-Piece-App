-- CreateTable "client_websites"
CREATE TABLE "client_websites" (
    "id" TEXT NOT NULL,
    "client_profile_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "how_we_met" TEXT,
    "engagement_story" TEXT,
    "header_font" TEXT,
    "body_font" TEXT,
    "font_color" character varying(7),
    "color_primary" character varying(7),
    "color_secondary" character varying(7),
    "color_accent" character varying(7),
    "url_ending_1" TEXT,
    "url_ending_2" TEXT,
    "allow_tenant_edits" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable "website_images"
CREATE TABLE "website_images" (
    "id" TEXT NOT NULL,
    "client_website_id" TEXT NOT NULL,
    "category" character varying(50) NOT NULL,
    "image_path" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable "website_registries"
CREATE TABLE "website_registries" (
    "id" TEXT NOT NULL,
    "client_website_id" TEXT NOT NULL,
    "registry_name" TEXT NOT NULL,
    "registry_url" TEXT NOT NULL,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "registry_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_registries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_websites_client_profile_id_key" ON "client_websites"("client_profile_id");

-- CreateIndex
CREATE INDEX "client_websites_client_profile_id_idx" ON "client_websites"("client_profile_id");

-- CreateIndex
CREATE INDEX "client_websites_tenant_id_idx" ON "client_websites"("tenant_id");

-- CreateIndex
CREATE INDEX "website_images_client_website_id_idx" ON "website_images"("client_website_id");

-- CreateIndex
CREATE INDEX "website_registries_client_website_id_idx" ON "website_registries"("client_website_id");

-- AddForeignKey
ALTER TABLE "client_websites" ADD CONSTRAINT "client_websites_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_websites" ADD CONSTRAINT "client_websites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_images" ADD CONSTRAINT "website_images_client_website_id_fkey" FOREIGN KEY ("client_website_id") REFERENCES "client_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_registries" ADD CONSTRAINT "website_registries_client_website_id_fkey" FOREIGN KEY ("client_website_id") REFERENCES "client_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
