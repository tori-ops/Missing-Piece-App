'use client';

import { useState } from 'react';
import ClientDetailModal from './ClientDetailModal';

interface ClientListProps {
  tenantId: string;
  clients: any[];
  primaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
}

export default function ClientList({ 
  tenantId,
  clients: initialClients, 
  primaryColor = '#274E13', 
  fontColor = '#000000', 
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif"
}: ClientListProps) {
  const [clients, setClients] = useState(initialClients);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OK' | 'BEHIND' | 'OVER'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const handleSaveSuccess = async () => {
    // Refetch clients from API after successful save
    try {
      const response = await fetch(`/api/tenant/clients?tenantId=${tenantId}`);
      const data = await response.json();
      if (data.clients) {
        setClients(data.clients);
        setSelectedClient(null); // Close the modal
      }
    } catch (err) {
      console.error('Failed to refetch clients:', err);
    }
  };

  // Placeholder status assignment (will be replaced with real logic later)
  const getClientStatus = (client: any) => {
    const statusOptions = ['OK', 'BEHIND', 'OVER'];
    const hash = client.id.charCodeAt(0) % 3;
    return statusOptions[hash];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return { bg: '#E8F5E9', text: '#2E7D32', badge: '🟢' };
      case 'BEHIND':
        return { bg: '#FFF3E0', text: '#E65100', badge: '🟡' };
      case 'OVER':
        return { bg: '#FFEBEE', text: '#C62828', badge: '🔴' };
      default:
        return { bg: '#F5F5F5', text: '#424242', badge: '○' };
    }
  };

  const daysUntilWedding = (weddingDate: string | Date) => {
    if (!weddingDate) return null;
    const wedding = new Date(weddingDate);
    const today = new Date();
    const diff = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff;
  };

  // Filter and sort clients
  let filteredClients = clients.filter(client => {
    if (filterStatus === 'ALL') return true;
    return getClientStatus(client) === filterStatus;
  });

  filteredClients.sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.weddingDate || 0).getTime();
      const dateB = new Date(b.weddingDate || 0).getTime();
      return dateA - dateB;
    } else {
      const nameA = `${a.couple1FirstName || ''} ${a.couple1LastName || ''}`;
      const nameB = `${b.couple1FirstName || ''} ${b.couple1LastName || ''}`;
      return nameA.localeCompare(nameB);
    }
  });

  if (clients.length === 0) {
    return (
      <div style={{
        background: `${primaryColor}15`,
        border: `1px dashed ${primaryColor}40`,
        borderRadius: '12px',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <p style={{ color: fontColor, margin: 0, opacity: 0.7, fontFamily: bodyFontFamily }}>No clients yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: bodyFontFamily }}>
      {/* Filters & Sorting */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ color: fontColor, fontSize: '0.9rem', fontWeight: '600', marginRight: '0.5rem' }}>Filter by:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${primaryColor}`,
              background: 'white',
              color: fontColor,
              fontFamily: bodyFontFamily,
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Clients</option>
            <option value="OK">🟢 OK</option>
            <option value="BEHIND">🟡 Behind Schedule</option>
            <option value="OVER">🔴 Over Budget</option>
          </select>
        </div>

        <div>
          <label style={{ color: fontColor, fontSize: '0.9rem', fontWeight: '600', marginRight: '0.5rem' }}>Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${primaryColor}`,
              background: 'white',
              color: fontColor,
              fontFamily: bodyFontFamily,
              cursor: 'pointer'
            }}
          >
            <option value="date">Wedding Date</option>
            <option value="name">Couple Name</option>
          </select>
        </div>
      </div>

      {/* Client Cards */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredClients.map((client) => {
          const status = getClientStatus(client);
          const statusColor = getStatusColor(status);
          const weddingDate = client.weddingDate ? new Date(client.weddingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
          const days = daysUntilWedding(client.weddingDate);
          const budget = client.budgetCents ? `$${(client.budgetCents / 100).toLocaleString()}` : 'Not set';

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              style={{
                background: 'white',
                border: `2px solid ${primaryColor}30`,
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as any).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                (e.currentTarget as any).style.borderColor = primaryColor;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as any).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                (e.currentTarget as any).style.borderColor = `${primaryColor}30`;
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Left - Couple Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: primaryColor,
                    fontFamily: headerFontFamily,
                    fontSize: '1.3rem',
                    fontWeight: '600'
                  }}>
                    {client.couple1FirstName} & {client.couple2FirstName || ''}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: fontColor, opacity: 0.8, fontSize: '0.95rem' }}>
                    💍 Wedding: <strong>{weddingDate}</strong>
                  </p>
                  {days !== null && (
                    <p style={{ margin: '0.25rem 0', color: fontColor, opacity: 0.8, fontSize: '0.95rem' }}>
                      📅 {days} days away
                    </p>
                  )}
                  <p style={{ margin: '0.25rem 0', color: fontColor, opacity: 0.8, fontSize: '0.95rem' }}>
                    💰 Budget: <strong>{budget}</strong>
                  </p>
                </div>

                {/* Right - Status & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: statusColor.bg,
                    color: statusColor.text,
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}>
                    {statusColor.badge} {status}
                  </span>
                  
                  {/* Account Status Badge */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: (client.status === 'ACTIVE' || client.users?.length > 0) ? '#E8F5E9' : '#FFEBEE',
                    color: (client.status === 'ACTIVE' || client.users?.length > 0) ? '#2E7D32' : '#C62828',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {(client.status === 'ACTIVE' || client.users?.length > 0) ? '✓ Active' : '⚠ Pending'}
                  </span>
                  
                  <span style={{
                    display: 'inline-block',
                    background: client.users?.length > 0 ? `${primaryColor}20` : '#FFE9E9',
                    color: client.users?.length > 0 ? primaryColor : '#C62828',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {client.users?.length > 0 ? '✓ Active' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          tenantId={tenantId}
          primaryColor={primaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          onClose={() => setSelectedClient(null)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
