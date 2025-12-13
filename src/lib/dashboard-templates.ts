// Dashboard Template System for The Missing Piece
// Stores layout configurations that persist independently of user profiles

export interface DashboardComponent {
  id: string;
  type: 'stats' | 'client-list' | 'create-form' | 'header' | 'custom';
  title: string;
  position: {
    section: 'header' | 'main' | 'sidebar' | 'footer';
    order: number;
    width?: 'full' | 'half' | 'third' | 'quarter';
  };
  config?: Record<string, any>;
  isVisible: boolean;
  isRequired: boolean; // Cannot be removed from template
}

export interface DashboardTemplate {
  id: string;
  name: string;
  type: 'TENANT' | 'CLIENT';
  version: string;
  lastUpdated: Date;
  updatedBy: string; // User who made the changes
  components: DashboardComponent[];
  layout: {
    headerHeight?: string;
    sidebarWidth?: string;
    maxWidth?: string;
    spacing?: string;
  };
  features: {
    allowClientCreation: boolean;
    showStats: boolean;
    showUpcomingWeddings: boolean;
    enableNotifications: boolean;
    customSections: string[];
  };
}

// Master Templates - these persist even if source profiles are deleted
export const MASTER_TEMPLATES: Record<string, DashboardTemplate> = {
  TENANT_MASTER: {
    id: 'tenant-master',
    name: 'Tenant Dashboard Template',
    type: 'TENANT',
    version: '1.0.0',
    lastUpdated: new Date(),
    updatedBy: 'system',
    components: [
      {
        id: 'tenant-header',
        type: 'header',
        title: 'Tenant Header',
        position: { section: 'header', order: 1, width: 'full' },
        isVisible: true,
        isRequired: true
      },
      {
        id: 'tenant-stats',
        type: 'stats',
        title: 'Business Statistics',
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
      },
      {
        id: 'create-client-form',
        type: 'create-form',
        title: 'Add New Client',
        position: { section: 'main', order: 3, width: 'full' },
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
      showStats: true,
      showUpcomingWeddings: true,
      enableNotifications: true,
      customSections: ['business-metrics', 'recent-activity']
    }
  },
  
  CLIENT_MASTER: {
    id: 'client-master',
    name: 'Client Dashboard Template',
    type: 'CLIENT',
    version: '1.0.0',
    lastUpdated: new Date(),
    updatedBy: 'system',
    components: [
      {
        id: 'client-header',
        type: 'header',
        title: 'Wedding Planning Header',
        position: { section: 'header', order: 1, width: 'full' },
        isVisible: true,
        isRequired: true
      },
      {
        id: 'wedding-countdown',
        type: 'stats',
        title: 'Wedding Countdown',
        position: { section: 'main', order: 1, width: 'half' },
        isVisible: true,
        isRequired: false
      },
      {
        id: 'planning-checklist',
        type: 'custom',
        title: 'Planning Checklist',
        position: { section: 'main', order: 2, width: 'full' },
        config: { showProgress: true, allowEditing: true },
        isVisible: true,
        isRequired: true
      },
      {
        id: 'vendor-contacts',
        type: 'custom',
        title: 'Vendor Contacts',
        position: { section: 'sidebar', order: 1, width: 'full' },
        isVisible: true,
        isRequired: false
      }
    ],
    layout: {
      headerHeight: '100px',
      sidebarWidth: '300px',
      maxWidth: '1200px',
      spacing: '1.5rem'
    },
    features: {
      allowClientCreation: false,
      showStats: true,
      showUpcomingWeddings: false,
      enableNotifications: true,
      customSections: ['wedding-timeline', 'budget-tracker', 'inspiration-board']
    }
  }
};

// Template Management Functions
export class DashboardTemplateManager {
  
  static async getMasterTemplate(type: 'TENANT' | 'CLIENT'): Promise<DashboardTemplate> {
    const templateKey = `${type}_MASTER`;
    return MASTER_TEMPLATES[templateKey];
  }
  
  static async updateMasterTemplate(
    type: 'TENANT' | 'CLIENT', 
    updates: Partial<DashboardTemplate>,
    updatedBy: string
  ): Promise<DashboardTemplate> {
    const templateKey = `${type}_MASTER`;
    const currentTemplate = MASTER_TEMPLATES[templateKey];
    
    const updatedTemplate: DashboardTemplate = {
      ...currentTemplate,
      ...updates,
      version: this.incrementVersion(currentTemplate.version),
      lastUpdated: new Date(),
      updatedBy
    };
    
    // In production, this would save to database
    MASTER_TEMPLATES[templateKey] = updatedTemplate;
    
    console.log(`✅ Updated ${type} master template to v${updatedTemplate.version} by ${updatedBy}`);
    return updatedTemplate;
  }
  
  static async syncFromUserProfile(profileEmail: string, type: 'TENANT' | 'CLIENT') {
    // This would read sarah@eliteweddings.local dashboard configuration
    // and update the master template based on her current setup
    console.log(`🔄 Syncing ${type} template from profile: ${profileEmail}`);
    
    // Implementation would:
    // 1. Read current dashboard layout/features from user's actual dashboard
    // 2. Extract component configuration, layout settings, enabled features
    // 3. Update master template with these settings
    // 4. Apply changes to all other users of that type
    
    return this.getMasterTemplate(type);
  }
  
  static async applyTemplateToUser(userEmail: string, template: DashboardTemplate) {
    // Apply template configuration to a specific user's dashboard
    console.log(`🎨 Applying ${template.name} to user: ${userEmail}`);
    
    // Implementation would:
    // 1. Take user's branding (colors, fonts, logo)
    // 2. Apply template structure (components, layout, features)
    // 3. Render personalized dashboard with template + branding
  }
  
  private static incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
}

// Template Component Renderer
export function renderTemplateComponent(
  _component: DashboardComponent,
  _branding: any,
  _userData: any
): React.ComponentType {
  // This function would return the appropriate React component
  // based on the template configuration and user's branding
  
  // Component would be rendered with:
  // - Template-defined structure and functionality
  // - User-specific branding (colors, fonts, logos)
  // - User-specific data (clients, stats, etc.)
  
  return (() => null) as React.ComponentType; // Placeholder - would return actual component
}

// Template Hook for React Components
export function useTemplate(templateType: 'TENANT' | 'CLIENT') {
  // React hook that provides current template configuration
  // and functions to update templates
  
  return {
    template: MASTER_TEMPLATES[`${templateType}_MASTER`],
    updateTemplate: (updates: Partial<DashboardTemplate>) => 
      DashboardTemplateManager.updateMasterTemplate(templateType, updates, 'user'),
    syncFromProfile: (email: string) => 
      DashboardTemplateManager.syncFromUserProfile(email, templateType)
  };
}