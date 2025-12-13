// Template-Driven Dashboard Renderer
// Applies master templates with individual tenant/client branding

import React from 'react';
import { getTenantBranding } from '@/lib/branding';

interface TemplateConfig {
  id: string;
  type: 'TENANT' | 'CLIENT';
  components: TemplateComponent[];
  layout: TemplateLayout;
  features: TemplateFeatures;
}

interface TemplateComponent {
  id: string;
  type: string;
  title: string;
  position: {
    section: 'header' | 'main' | 'sidebar' | 'footer';
    order: number;
    width: string;
  };
  config?: any;
  isVisible: boolean;
  isRequired: boolean;
}

interface TemplateLayout {
  headerHeight?: string;
  sidebarWidth?: string;
  maxWidth?: string;
  spacing?: string;
}

interface TemplateFeatures {
  [key: string]: boolean | string[];
}

// Template loader - loads master templates from saved configuration
export async function loadMasterTemplate(type: 'TENANT' | 'CLIENT'): Promise<TemplateConfig> {
  // In production, this would load from database
  // For now, load from saved JSON files
  const fs = await import('fs');
  const path = await import('path');
  
  try {
    const templatePath = path.join(process.cwd(), 'templates', `${type.toLowerCase()}-master.json`);
    const templateData = fs.readFileSync(templatePath, 'utf-8');
    return JSON.parse(templateData);
  } catch (error) {
    console.log('⚠️ Template file not found, using default template');
    return getDefaultTemplate(type);
  }
}

// Fallback templates if files not found
function getDefaultTemplate(type: 'TENANT' | 'CLIENT'): TemplateConfig {
  if (type === 'TENANT') {
    return {
      id: 'tenant-default',
      type: 'TENANT',
      components: [
        {
          id: 'tenant-header',
          type: 'header',
          title: 'Business Header',
          position: { section: 'header', order: 1, width: 'full' },
          isVisible: true,
          isRequired: true
        },
        {
          id: 'tenant-stats',
          type: 'stats',
          title: 'Business Stats',
          position: { section: 'main', order: 1, width: 'full' },
          isVisible: true,
          isRequired: false
        },
        {
          id: 'client-list',
          type: 'client-list',
          title: 'Client Management',
          position: { section: 'main', order: 2, width: 'full' },
          isVisible: true,
          isRequired: true
        }
      ],
      layout: {
        headerHeight: '120px',
        maxWidth: '1400px',
        spacing: '2rem'
      },
      features: {
        allowClientCreation: true,
        showStats: true
      }
    };
  } else {
    return {
      id: 'client-default',
      type: 'CLIENT',
      components: [
        {
          id: 'client-header',
          type: 'header',
          title: 'Wedding Header',
          position: { section: 'header', order: 1, width: 'full' },
          isVisible: true,
          isRequired: true
        },
        {
          id: 'wedding-overview',
          type: 'stats',
          title: 'Wedding Overview',
          position: { section: 'main', order: 1, width: 'full' },
          isVisible: true,
          isRequired: true
        }
      ],
      layout: {
        headerHeight: '100px',
        maxWidth: '1200px',
        spacing: '1.5rem'
      },
      features: {
        showWeddingStats: true
      }
    };
  }
}

// Template-driven component factory
export function createTemplateComponent(
  component: TemplateComponent,
  branding: any,
  userData: any,
  componentLibrary: any
) {
  const style = {
    order: component.position.order,
    width: component.position.width === 'full' ? '100%' : 
           component.position.width === 'half' ? '50%' :
           component.position.width === 'third' ? '33.33%' : '25%',
    display: component.isVisible ? 'block' : 'none'
  };

  // Apply branding to component
  const brandedProps = {
    ...component.config,
    branding: {
      primaryColor: branding?.primaryColor || '#274E13',
      secondaryColor: branding?.secondaryColor || '#D0CEB5',
      fontColor: branding?.fontColor || '#000000',
      companyName: branding?.companyName || 'The Missing Piece',
      logoUrl: branding?.logoUrl
    },
    userData,
    style
  };

  // Return appropriate component based on type
  switch (component.type) {
    case 'header':
      return componentLibrary.TenantHeader ? 
        React.createElement(componentLibrary.TenantHeader, brandedProps) : null;
    
    case 'stats':
      return componentLibrary.TenantStats ? 
        React.createElement(componentLibrary.TenantStats, brandedProps) : null;
    
    case 'client-list':
      return componentLibrary.ClientList ? 
        React.createElement(componentLibrary.ClientList, brandedProps) : null;
    
    case 'create-form':
      return componentLibrary.CreateClientFormModal ? 
        React.createElement(componentLibrary.CreateClientFormModal, brandedProps) : null;
    
    default:
      return null;
  }
}

// Main template renderer
export async function renderTemplateDashboard(
  templateType: 'TENANT' | 'CLIENT',
  user: any,
  tenant: any,
  additionalData?: any
) {
  // Load master template
  const template = await loadMasterTemplate(templateType);
  
  // Get user's branding
  const branding = tenant ? getTenantBranding(tenant) : null;
  
  // Prepare user data for components
  const userData = {
    user,
    tenant,
    ...additionalData
  };

  // Create layout structure
  const layout = {
    maxWidth: template.layout.maxWidth || '1200px',
    spacing: template.layout.spacing || '2rem',
    headerHeight: template.layout.headerHeight || '100px'
  };

  // Group components by section
  const componentsBySection = template.components.reduce((acc, component) => {
    if (!acc[component.position.section]) {
      acc[component.position.section] = [];
    }
    acc[component.position.section].push(component);
    return acc;
  }, {} as Record<string, TemplateComponent[]>);

  // Sort components within each section by order
  Object.values(componentsBySection).forEach(components => {
    components.sort((a, b) => a.position.order - b.position.order);
  });

  return {
    template,
    branding,
    layout,
    componentsBySection,
    features: template.features,
    renderComponent: (component: TemplateComponent, componentLibrary: any) =>
      createTemplateComponent(component, branding, userData, componentLibrary)
  };
}

// Template update functions
export async function updateMasterTemplate(
  type: 'TENANT' | 'CLIENT',
  updates: Partial<TemplateConfig>,
  updatedBy: string
) {
  const fs = await import('fs');
  const path = await import('path');
  
  // Load current template
  const current = await loadMasterTemplate(type);
  
  // Apply updates
  const updated = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
    updatedBy
  };

  // Save updated template
  const templatePath = path.join(process.cwd(), 'templates', `${type.toLowerCase()}-master.json`);
  fs.writeFileSync(templatePath, JSON.stringify(updated, null, 2));

  console.log(`✅ Updated ${type} template by ${updatedBy}`);
  return updated;
}

// Template validation
export function validateTemplate(template: TemplateConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.id || !template.type) {
    errors.push('Template must have id and type');
  }

  if (!template.components || template.components.length === 0) {
    errors.push('Template must have at least one component');
  }

  const requiredComponents = template.components.filter(c => c.isRequired);
  if (requiredComponents.length === 0) {
    errors.push('Template must have at least one required component');
  }

  // Check for duplicate component IDs
  const ids = template.components.map(c => c.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate component IDs: ${duplicateIds.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}