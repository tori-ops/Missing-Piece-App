// ============================================================================
// TENANT BRANDING UTILITY
// Provides type-safe tenant branding with smart defaults
// ============================================================================

import { getFontFamily, getHeaderFontFamily, getBodyFontFamily } from './fonts';

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  secondaryColorOpacity: number; // 0-100, represents percentage
  fontColor: string;
  logoUrl: string | null;
  logoBackgroundRemoval: boolean; // For logos with white backgrounds
  companyName: string;
  tagline: string | null;
  faviconUrl: string | null;
  footerText: string | null;
  fontFamily: string;
  headerFontFamily: string;
  bodyFontFamily: string;
}

// Default branding (The Missing Piece theme)
export const DEFAULT_BRANDING: TenantBranding = {
  primaryColor: '#274E13',
  secondaryColor: '#D0CEB5',
  secondaryColorOpacity: 55, // 55% opacity
  fontColor: '#000000', // Black text
  logoUrl: null,
  logoBackgroundRemoval: false,
  companyName: 'The Missing Piece',
  tagline: null,
  faviconUrl: null,
  footerText: null,
  fontFamily: "'Poppins', sans-serif",
  headerFontFamily: "'Playfair Display', serif",
  bodyFontFamily: "'Poppins', sans-serif",
};

/**
 * Converts Tenant database model to TenantBranding object
 * Applies safe defaults for any missing values
 */
export function getTenantBranding(tenant: {
  brandingPrimaryColor?: string | null;
  brandingSecondaryColor?: string | null;
  brandingSecondaryColorOpacity?: number | null;
  brandingFontColor?: string | null;
  brandingLogoUrl?: string | null;
  brandingLogoBackgroundRemoval?: boolean | null;
  brandingCompanyName?: string | null;
  brandingTagline?: string | null;
  brandingFaviconUrl?: string | null;
  brandingFooterText?: string | null;
  brandingFontFamily?: string | null;
  brandingHeaderFontFamily?: string | null;
  brandingBodyFontFamily?: string | null;
  businessName: string;
}): TenantBranding {
  return {
    primaryColor: tenant.brandingPrimaryColor || DEFAULT_BRANDING.primaryColor,
    secondaryColor: tenant.brandingSecondaryColor || DEFAULT_BRANDING.secondaryColor,
    secondaryColorOpacity: tenant.brandingSecondaryColorOpacity ?? DEFAULT_BRANDING.secondaryColorOpacity,
    fontColor: tenant.brandingFontColor || DEFAULT_BRANDING.fontColor,
    logoUrl: tenant.brandingLogoUrl || null,
    logoBackgroundRemoval: tenant.brandingLogoBackgroundRemoval ?? DEFAULT_BRANDING.logoBackgroundRemoval,
    companyName: tenant.brandingCompanyName || tenant.businessName || DEFAULT_BRANDING.companyName,
    tagline: tenant.brandingTagline || null,
    faviconUrl: tenant.brandingFaviconUrl || null,
    footerText: tenant.brandingFooterText || null,
    fontFamily: getFontFamily(tenant.brandingFontFamily),
    headerFontFamily: getHeaderFontFamily(tenant.brandingHeaderFontFamily),
    bodyFontFamily: getBodyFontFamily(tenant.brandingBodyFontFamily),
  };
}

/**
 * Validates hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Checks if a color is too light (lightness > 70%)
 * Returns true if color is too light, false if it's dark enough
 */
export function isColorTooLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  // Convert RGB to HSL to check lightness
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  
  // If lightness > 0.70 (70%), it's too light
  return lightness > 0.70;
}

/**
 * Converts CSS color to RGB for various uses
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts hex color to RGBA with opacity
 * @param hex Hex color string (#RRGGBB)
 * @param opacity Opacity as percentage (0-100)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, opacity: number = 100): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Ensure opacity is between 0 and 100
  const alpha = Math.max(0, Math.min(100, opacity)) / 100;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Generates HSL lightness value for hover/active states
 */
export function adjustColorLightness(hex: string, amount: number): string {
  if (!isValidHexColor(hex)) return hex;

  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Simple lightness adjustment (not perfect HSL but good enough)
  const adjusted = {
    r: Math.min(255, Math.max(0, rgb.r + amount)),
    g: Math.min(255, Math.max(0, rgb.g + amount)),
    b: Math.min(255, Math.max(0, rgb.b + amount)),
  };

  return `#${[adjusted.r, adjusted.g, adjusted.b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('')
    .toUpperCase()}`;
}
