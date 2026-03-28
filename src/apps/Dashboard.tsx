import React, { useState, useEffect } from 'react';

interface DashboardProps {
  onToolCall: (tool: string, args: any) => Promise<any>;
}

export function Dashboard({ onToolCall }: DashboardProps) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const bizData = await onToolCall('wave_list_businesses', {});
      setBusinesses(bizData);
      if (bizData.length > 0) {
        setSelectedBusiness(bizData[0]);
        await loadBusinessData(bizData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  }

  async function loadBusinessData(businessId: string) {
    try {
      const invoiceData = await onToolCall('wave_list_invoices', { 
        businessId, 
        pageSize: 100 
      });
      setInvoices(invoiceData.invoices || []);
      
      // Calculate stats
      const total = invoiceData.invoices?.length || 0;
      const paid = invoiceData.invoices?.filter((i: any) => i.status === 'PAID').length || 0;
      const overdue = invoiceData.invoices?.filter((i: any) => i.status === 'OVERDUE').length || 0;
      const revenue = invoiceData.invoices
        ?.filter((i: any) => i.status === 'PAID')
        .reduce((sum: number, i: any) => sum + parseFloat(i.total?.value || 0), 0) || 0;

      setStats({
        totalInvoices: total,
        paidInvoices: paid,
        overdueInvoices: overdue,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Failed to load business data:', error);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#1a1a1a', 
        color: '#e0e0e0',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '18px' }}>Loading Wave dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#1a1a1a', 
      color: '#e0e0e0',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            color: '#ffffff',
          }}>
            Wave Accounting Dashboard
          </h1>
          <p style={{ color: '#888', margin: 0 }}>
            Overview of your business financials
          </p>
        </div>

        {/* Business Selector */}
        {businesses.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Select Business
            </label>
            <select
              value={selectedBusiness?.id || ''}
              onChange={(e) => {
                const biz = businesses.find(b => b.id === e.target.value);
                setSelectedBusiness(biz);
                if (biz) loadBusinessData(biz.id);
              }}
              style={{
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#e0e0e0',
                fontSize: '14px',
                width: '100%',
                maxWidth: '400px',
              }}
            >
              {businesses.map(biz => (
                <option key={biz.id} value={biz.id}>
                  {biz.name} ({biz.currency.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedBusiness && (
          <>
            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}>
              <StatCard 
                title="Total Invoices" 
                value={stats.totalInvoices.toString()}
                color="#4a9eff"
              />
              <StatCard 
                title="Paid Invoices" 
                value={stats.paidInvoices.toString()}
                color="#22c55e"
              />
              <StatCard 
                title="Overdue" 
                value={stats.overdueInvoices.toString()}
                color="#ef4444"
              />
              <StatCard 
                title="Total Revenue" 
                value={`${selectedBusiness.currency.symbol}${stats.totalRevenue.toLocaleString()}`}
                color="#8b5cf6"
              />
            </div>

            {/* Recent Invoices */}
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '24px',
              border: '1px solid #404040',
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                margin: '0 0 20px 0',
                color: '#ffffff',
              }}>
                Recent Invoices
              </h2>
              
              {invoices.length === 0 ? (
                <p style={{ color: '#888', margin: 0 }}>No invoices found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #404040' }}>
                        <th style={tableHeaderStyle}>Invoice #</th>
                        <th style={tableHeaderStyle}>Customer</th>
                        <th style={tableHeaderStyle}>Date</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Amount</th>
                        <th style={tableHeaderStyle}>Amount Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.slice(0, 10).map(invoice => (
                        <tr key={invoice.id} style={{ borderBottom: '1px solid #333' }}>
                          <td style={tableCellStyle}>{invoice.invoiceNumber}</td>
                          <td style={tableCellStyle}>{invoice.customer.name}</td>
                          <td style={tableCellStyle}>
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td style={tableCellStyle}>
                            <StatusBadge status={invoice.status} />
                          </td>
                          <td style={tableCellStyle}>
                            {invoice.total.currency.code} {parseFloat(invoice.total.value).toFixed(2)}
                          </td>
                          <td style={tableCellStyle}>
                            {invoice.amountDue.currency.code} {parseFloat(invoice.amountDue.value).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #404040',
    }}>
      <div style={{ 
        fontSize: '14px', 
        color: '#888', 
        marginBottom: '8px',
        fontWeight: '500',
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: color,
      }}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: '#6b7280',
    SAVED: '#3b82f6',
    SENT: '#8b5cf6',
    VIEWED: '#06b6d4',
    PAID: '#22c55e',
    PARTIAL: '#f59e0b',
    OVERDUE: '#ef4444',
    UNPAID: '#f59e0b',
  };

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: `${colors[status] || '#6b7280'}20`,
      color: colors[status] || '#6b7280',
    }}>
      {status}
    </span>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  color: '#e0e0e0',
};
