import React from 'react';

export default function App() {
  const assets = [
    { name: 'Cash & Bank', amount: 25000 },
    { name: 'Accounts Receivable', amount: 8500 },
    { name: 'Equipment', amount: 12000 },
  ];
  const liabilities = [
    { name: 'Accounts Payable', amount: 3500 },
    { name: 'Loans', amount: 15000 },
  ];
  
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const equity = totalAssets - totalLiabilities;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Balance Sheet</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Assets</div>
            <div className="text-3xl font-bold text-blue-400">${totalAssets.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Liabilities</div>
            <div className="text-3xl font-bold text-orange-400">${totalLiabilities.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Equity</div>
            <div className="text-3xl font-bold text-green-400">${equity.toLocaleString()}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Assets</h2>
            {assets.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-gray-300">{item.name}</span>
                <span className="font-bold text-blue-400">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Liabilities</h2>
            {liabilities.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-gray-300">{item.name}</span>
                <span className="font-bold text-orange-400">${item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Owner's Equity</span>
                <span className="text-xl font-bold text-green-400">${equity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
