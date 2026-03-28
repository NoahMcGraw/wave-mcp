import React from 'react';

export default function App() {
  const income = [
    { category: 'Product Sales', amount: 15000 },
    { category: 'Service Revenue', amount: 8500 },
    { category: 'Consulting', amount: 4200 },
  ];
  const expenses = [
    { category: 'Salaries', amount: 12000 },
    { category: 'Rent', amount: 2500 },
    { category: 'Software', amount: 800 },
  ];
  
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Profit & Loss Statement</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Income</div>
            <div className="text-3xl font-bold text-green-400">${totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Expenses</div>
            <div className="text-3xl font-bold text-red-400">${totalExpenses.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Net Profit</div>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${netProfit.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Income</h2>
            {income.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-gray-300">{item.category}</span>
                <span className="font-bold text-green-400">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Expenses</h2>
            {expenses.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-gray-300">{item.category}</span>
                <span className="font-bold text-red-400">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
