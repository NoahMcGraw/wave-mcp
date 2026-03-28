import React, { useState, useEffect } from 'react';

interface InvoiceManagerProps {
  onToolCall: (tool: string, args: any) => Promise<any>;
}

export function InvoiceManager({ onToolCall }: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await onToolCall('wave_list_invoices', { pageSize: 100 });
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
    setLoading(false);
  }

  const filteredInvoices = filter === 'ALL' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const statusCounts = {
    ALL: invoices.length,
    DRAFT: invoices.filter(i => i.status === 'DRAFT').length,
    SENT: invoices.filter(i => i.status === 'SENT').length,
    PAID: invoices.filter(i => i.status === 'PAID').length,
    OVERDUE: invoices.filter(i => i.status === 'OVERDUE').length,
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#1a1a1a', 
      color: '#e0e0e0',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
          Invoices
        </h1>

        {/* Filter Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          borderBottom: '1px solid #404040',
        }}>
          {(['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: filter === status ? '2px solid #4a9eff' : '2px solid transparent',
                color: filter === status ? '#4a9eff' : '#888',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>

        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          padding: '24px',
          border: '1px solid #404040',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : filteredInvoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No {filter.toLowerCase()} invoices found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #404040' }}>
                    <th style={headerStyle}>Invoice #</th>
                    <th style={headerStyle}>Customer</th>
                    <th style={headerStyle}>Date</th>
                    <th style={headerStyle}>Due Date</th>
                    <th style={headerStyle}>Status</th>
                    <th style={headerStyle}>Total</th>
                    <th style={headerStyle}>Amount Due</th>
                    <th style={headerStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(invoice => (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={cellStyle}>{invoice.invoiceNumber}</td>
                      <td style={cellStyle}>{invoice.customer.name}</td>
                      <td style={cellStyle}>
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td style={cellStyle}>
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={cellStyle}>
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td style={cellStyle}>
                        {invoice.total.currency.code} {parseFloat(invoice.total.value).toFixed(2)}
                      </td>
                      <td style={cellStyle}>
                        {invoice.amountDue.currency.code} {parseFloat(invoice.amountDue.value).toFixed(2)}
                      </td>
                      <td style={cellStyle}>
                        {invoice.viewUrl && (
                          <a 
                            href={invoice.viewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#4a9eff', textDecoration: 'none' }}
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

const headerStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#888',
  textTransform: 'uppercase',
};

const cellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  color: '#e0e0e0',
};
