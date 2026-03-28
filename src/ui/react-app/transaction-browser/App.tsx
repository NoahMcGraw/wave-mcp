import React from 'react';

export default function App() {
  const transactions = [
    { id: '1', date: '2024-02-15', description: 'Client Payment - Acme Corp', type: 'INCOME', amount: 1500, account: 'Bank Account' },
    { id: '2', date: '2024-02-14', description: 'Office Rent', type: 'EXPENSE', amount: -2500, account: 'Bank Account' },
    { id: '3', date: '2024-02-13', description: 'Software Subscription', type: 'EXPENSE', amount: -99, account: 'Credit Card' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Transaction Browser</h1>
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex gap-4">
            <input type="date" className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
            <input type="date" className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
            <select className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
              <option>All Types</option>
              <option>INCOME</option>
              <option>EXPENSE</option>
            </select>
            <input placeholder="Search..." className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Account</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 text-gray-400">{txn.date}</td>
                  <td className="px-6 py-4">{txn.description}</td>
                  <td className="px-6 py-4 text-gray-400">{txn.account}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${txn.type === 'INCOME' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${txn.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Math.abs(txn.amount).toFixed(2)}
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
