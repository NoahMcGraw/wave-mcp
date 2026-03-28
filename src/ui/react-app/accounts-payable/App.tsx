import React from 'react';

export default function App() {
  const bills = [
    { id: '1', vendor: 'Office Supplies Co', amount: '450.00', dueDate: '2024-02-20', status: 'UNPAID' },
    { id: '2', vendor: 'Cloud Hosting Inc', amount: '1200.00', dueDate: '2024-02-25', status: 'UNPAID' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Accounts Payable</h1>
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Total Outstanding</div>
              <div className="text-3xl font-bold text-red-400">$1,650</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Due This Week</div>
              <div className="text-2xl font-bold text-orange-400">$450</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Bills</div>
              <div className="text-2xl font-bold">{bills.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left">Vendor</th>
                <th className="px-6 py-3 text-left">Due Date</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-semibold">{bill.vendor}</td>
                  <td className="px-6 py-4 text-gray-400">{bill.dueDate}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">{bill.status}</span></td>
                  <td className="px-6 py-4 text-right font-bold">${parseFloat(bill.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
