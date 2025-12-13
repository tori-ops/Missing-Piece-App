import { prisma } from '@/lib/prisma';

export default async function UserManagement() {
  // Get all tenants with their user and client counts
  const tenants = await prisma.tenant.findMany({
    include: {
      users: true,
      clientProfiles: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h2 style={{ color: '#274E13', marginTop: 0 }}>👥 User Management</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Manage all users and clients across all tenants</p>

      {tenants.length === 0 ? (
        <div style={{
          background: '#F9F8F3',
          border: '2px dashed #E0DED0',
          borderRadius: '8px',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#999', margin: 0 }}>No tenants found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #274E13' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Tenant Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Contact Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Total Users</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Total Clients</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  style={{
                    borderBottom: '1px solid #E0DED0',
                    background: 'white'
                  }}
                >
                  <td style={{ padding: '1rem', color: '#333' }}>
                    <strong>{tenant.businessName}</strong>
                  </td>
                  <td style={{ padding: '1rem', color: '#666' }}>
                    {tenant.email || '—'}
                  </td>
                  <td style={{ padding: '1rem', color: '#666' }}>
                    {tenant.users.length}
                  </td>
                  <td style={{ padding: '1rem', color: '#666' }}>
                    {tenant.clientProfiles.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
