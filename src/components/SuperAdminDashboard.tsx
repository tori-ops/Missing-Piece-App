import React, { useEffect, useState } from 'react';

interface TenantSummary {
  id: string;
  businessName: string;
  clientCount: number;
  subscriptionTier: string;
  status: string;
  nextPaymentDue: string | null;
  revenueYTD: number;
  revenueTotal: number;
}

interface SquareSummary {
  totalRevenue: number;
  ytdRevenue: number;
  nextPaymentDue: string | null;
  paymentCount: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [square, setSquare] = useState<SquareSummary | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch tenants summary (replace with real API route)
      const tenantsRes = await fetch('/api/superadmin/tenants-summary');
      const tenantsData = await tenantsRes.json();
      setTenants(tenantsData);
      // Fetch Square summary
      const squareRes = await fetch('/api/superadmin/square-summary');
      const squareData = await squareRes.json();
      setSquare(squareData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTenants = tenants.filter(t =>
    t.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', background: '#F5F3EB', minHeight: '100vh' }}>
      <h1 style={{ color: '#274E13', marginBottom: '1.5rem' }}>SuperAdmin Dashboard</h1>
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem', width: '300px' }}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', minWidth: '250px' }}>
              <h3 style={{ color: '#274E13' }}>Total Revenue (YTD)</h3>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                ${square?.ytdRevenue.toLocaleString()}
              </div>
              <h4 style={{ color: '#274E13', marginTop: '1rem' }}>All-Time Revenue</h4>
              <div style={{ fontSize: '1.2rem' }}>
                ${square?.totalRevenue.toLocaleString()}
              </div>
              <div style={{ marginTop: '1rem', color: '#888' }}>
                Payments: {square?.paymentCount}
              </div>
              <div style={{ marginTop: '1rem', color: '#888' }}>
                Next Payment Due: {square?.nextPaymentDue || 'N/A'}
              </div>
            </div>
          </div>
          <table style={{ width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px #0001' }}>
            <thead style={{ background: '#D0CEB5' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Business Name</th>
                <th>Clients</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>Revenue (YTD)</th>
                <th>Revenue (Total)</th>
                <th>Next Payment Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map(tenant => (
                <tr key={tenant.id}>
                  <td style={{ padding: '1rem' }}>{tenant.businessName}</td>
                  <td style={{ textAlign: 'center' }}>{tenant.clientCount}</td>
                  <td style={{ textAlign: 'center' }}>{tenant.subscriptionTier}</td>
                  <td style={{ textAlign: 'center' }}>{tenant.status}</td>
                  <td style={{ textAlign: 'center' }}>${tenant.revenueYTD.toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>${tenant.revenueTotal.toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>{tenant.nextPaymentDue || 'N/A'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button style={{ marginRight: '0.5rem' }}>Reset Password</button>
                    <button>Lock Account</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
