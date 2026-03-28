import React from 'react';

export default function App() {
  const recurring = [
    { id: '1', customer: 'Acme Corp', frequency: 'MONTHLY', amount: '1200.00', nextDate: '2024-03-01', status: 'ACTIVE' },
    { id: '2', customer: 'Beta Ltd', frequency: 'QUARTERLY', amount: '3500.00', nextDate: '2024-04-01', status: 'ACTIVE' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Recurring Invoices</h1>
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Active Recurring</div>
              <div className="text-3xl font-bold text-green-400">{recurring.filter(r => r.status === 'ACTIVE').length}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Monthly Revenue</div>
              <div className="text-2xl font-bold text-blue-400">$1,200</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Next Invoice</div>
              <div className="text-lg font-bold">2024-03-01</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Frequency</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Next Invoice</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recurring.map((r) => (
                <tr key={r.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-semibold">{r.customer}</td>
                  <td className="px-6 py-4 text-gray-400">{r.frequency}</td>
                  <td className="px-6 py-4 font-bold">${parseFloat(r.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-400">{r.nextDate}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">{r.status}</span></td>
                  <td className="px-6 py-4">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                    <button className="text-orange-400 hover:text-orange-300">Pause</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
