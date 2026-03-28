import React, { useState, useEffect } from 'react';

interface CustomerManagerProps {
  onToolCall: (tool: string, args: any) => Promise<any>;
}

export function CustomerManager({ onToolCall }: CustomerManagerProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await onToolCall('wave_list_customers', { pageSize: 100 });
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onToolCall('wave_create_customer', formData);
      setFormData({ name: '', email: '', phone: '', mobile: '', website: '' });
      setShowForm(false);
      await loadCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Failed to create customer');
    }
  }

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#1a1a1a', 
      color: '#e0e0e0',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>
              Customers
            </h1>
            <p style={{ color: '#888', margin: 0 }}>
              Manage your customer database
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4a9eff',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ New Customer'}
          </button>
        </div>

        {showForm && (
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #404040',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Create New Customer
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <InputField
                  label="Customer Name"
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  required
                />
                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(v) => setFormData({ ...formData, email: v })}
                />
                <InputField
                  label="Phone"
                  value={formData.phone}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                />
                <InputField
                  label="Mobile"
                  value={formData.mobile}
                  onChange={(v) => setFormData({ ...formData, mobile: v })}
                />
                <InputField
                  label="Website"
                  value={formData.website}
                  onChange={(v) => setFormData({ ...formData, website: v })}
                />
              </div>
              <button
                type="submit"
                style={{
                  marginTop: '20px',
                  padding: '10px 24px',
                  backgroundColor: '#22c55e',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Create Customer
              </button>
            </form>
          </div>
        )}

        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          padding: '24px',
          border: '1px solid #404040',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No customers found. Create your first customer!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #404040' }}>
                    <th style={headerStyle}>Name</th>
                    <th style={headerStyle}>Email</th>
                    <th style={headerStyle}>Phone</th>
                    <th style={headerStyle}>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={cellStyle}>{customer.name}</td>
                      <td style={cellStyle}>{customer.email || '-'}</td>
                      <td style={cellStyle}>{customer.phone || customer.mobile || '-'}</td>
                      <td style={cellStyle}>{customer.currency?.code || '-'}</td>
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

function InputField({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  required = false,
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '6px', 
        fontSize: '14px',
        fontWeight: '500',
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #404040',
          borderRadius: '6px',
          color: '#e0e0e0',
          fontSize: '14px',
        }}
      />
    </div>
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
