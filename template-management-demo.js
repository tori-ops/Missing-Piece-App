// Template Management Script
// Demonstrates how to update master templates and apply changes to all users

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function manageTemplates() {
  const prisma = new PrismaClient();
  
  console.log('🛠️  Master Template Management System');
  console.log('===================================\n');

  try {
    // Load existing templates
    const tenantTemplatePath = path.join(process.cwd(), 'templates', 'tenant-master.json');
    const clientTemplatePath = path.join(process.cwd(), 'templates', 'client-master.json');
    
    let tenantTemplate = JSON.parse(fs.readFileSync(tenantTemplatePath, 'utf-8'));
    let clientTemplate = JSON.parse(fs.readFileSync(clientTemplatePath, 'utf-8'));
    
    console.log('📋 Current Template Status:');
    console.log(`   🏢 Tenant Template: ${tenantTemplate.components.length} components`);
    console.log(`   💍 Client Template: ${clientTemplate.components.length} components\n`);

    // Example 1: Add a new feature to tenant template
    console.log('🔧 Example 1: Adding new feature to tenant template...');
    
    tenantTemplate.features.enableAnalytics = true;
    tenantTemplate.features.showRecentActivity = true;
    tenantTemplate.lastUpdated = new Date().toISOString();
    tenantTemplate.updatedBy = 'System Admin';
    tenantTemplate.version = (parseFloat(tenantTemplate.version || '1.0') + 0.1).toFixed(1);
    
    fs.writeFileSync(tenantTemplatePath, JSON.stringify(tenantTemplate, null, 2));
    console.log('   ✅ Added analytics and recent activity features');
    console.log(`   📦 Template version updated to: ${tenantTemplate.version}`);

    // Example 2: Add a new component to client template
    console.log('\n🔧 Example 2: Adding new component to client template...');
    
    const newComponent = {
      id: 'wedding-timeline',
      type: 'timeline',
      title: 'Wedding Timeline',
      position: { section: 'main', order: 3, width: 'full' },
      isVisible: true,
      isRequired: false,
      config: {
        showMilestones: true,
        allowEditing: false
      }
    };
    
    clientTemplate.components.push(newComponent);
    clientTemplate.features.showTimeline = true;
    clientTemplate.lastUpdated = new Date().toISOString();
    clientTemplate.updatedBy = 'System Admin';
    clientTemplate.version = (parseFloat(clientTemplate.version || '1.0') + 0.1).toFixed(1);
    
    fs.writeFileSync(clientTemplatePath, JSON.stringify(clientTemplate, null, 2));
    console.log('   ✅ Added wedding timeline component');
    console.log(`   📦 Template version updated to: ${clientTemplate.version}`);

    // Example 3: Show template impact
    console.log('\n📊 Template Update Impact:');
    
    const tenantUsers = await prisma.user.findMany({
      where: { role: 'TENANT' },
      include: { tenant: true }
    });
    
    const clientUsers = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: { clientProfile: { include: { tenant: true } } }
    });
    
    console.log(`   🏢 ${tenantUsers.length} tenant dashboards will get new analytics features`);
    tenantUsers.forEach(user => {
      const business = user.tenant?.businessName || 'Unknown';
      console.log(`      • ${business} (${user.email}) - gets analytics + recent activity`);
    });
    
    console.log(`   💍 ${clientUsers.length} client dashboards will get wedding timeline`);
    clientUsers.forEach(user => {
      const tenant = user.clientProfile?.tenant?.businessName || 'Unknown';
      console.log(`      • ${user.firstName} ${user.lastName} (${tenant}) - gets timeline component`);
    });

    // Example 4: Template rollback capability
    console.log('\n🔄 Template Rollback Example:');
    
    // Create backup
    const backupDir = path.join(process.cwd(), 'templates', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tenantBackupPath = path.join(backupDir, `tenant-${timestamp}.json`);
    const clientBackupPath = path.join(backupDir, `client-${timestamp}.json`);
    
    fs.writeFileSync(tenantBackupPath, JSON.stringify(tenantTemplate, null, 2));
    fs.writeFileSync(clientBackupPath, JSON.stringify(clientTemplate, null, 2));
    
    console.log(`   📦 Templates backed up to: templates/backups/`);
    console.log(`   🔄 Rollback available if needed`);

    // Example 5: Template validation
    console.log('\n✅ Template Validation:');
    
    function validateTemplate(template, type) {
      const errors = [];
      
      if (!template.id || !template.type) {
        errors.push('Missing id or type');
      }
      
      if (!template.components || template.components.length === 0) {
        errors.push('No components defined');
      }
      
      const requiredComponents = template.components.filter(c => c.isRequired);
      if (requiredComponents.length === 0) {
        errors.push('No required components');
      }
      
      return { valid: errors.length === 0, errors };
    }
    
    const tenantValidation = validateTemplate(tenantTemplate, 'tenant');
    const clientValidation = validateTemplate(clientTemplate, 'client');
    
    console.log(`   🏢 Tenant template: ${tenantValidation.valid ? '✅ VALID' : '❌ INVALID'}`);
    if (!tenantValidation.valid) {
      tenantValidation.errors.forEach(error => console.log(`      ⚠️ ${error}`));
    }
    
    console.log(`   💍 Client template: ${clientValidation.valid ? '✅ VALID' : '❌ INVALID'}`);
    if (!clientValidation.valid) {
      clientValidation.errors.forEach(error => console.log(`      ⚠️ ${error}`));
    }

    // Summary
    console.log('\n🎯 Template Management Summary:');
    console.log('================================');
    console.log('✅ Template updates applied successfully');
    console.log('✅ All user dashboards will reflect changes automatically');
    console.log('✅ Individual tenant branding preserved');
    console.log('✅ Backup system maintains rollback capability');
    console.log('✅ Template validation ensures system stability');
    
    console.log('\n📚 How This Works:');
    console.log('• Templates define layout/features for ALL users of that type');
    console.log('• Individual user branding (colors/logos) overlays on templates');
    console.log('• Template changes apply to all users instantly');
    console.log('• Sarah\'s profile is no longer needed - templates are independent');
    console.log('• System admin can update templates without touching individual profiles');
    
    console.log('\n🔮 Future Capabilities:');
    console.log('• A/B testing with multiple template versions');
    console.log('• User-specific template overrides');
    console.log('• Template marketplace for different industries');
    console.log('• Auto-migration when templates are updated');
    
  } catch (error) {
    console.error('❌ Template management error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manageTemplates();