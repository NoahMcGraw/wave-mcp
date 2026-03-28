import React, { useState } from 'react';

export default function App() {
  const [items, setItems] = useState([{ description: '', quantity: 1, price: '' }]);

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: '' }]);
  const total = items.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price || '0')), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Create Estimate</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Customer</label>
            <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
              <option>Select Customer</option>
              <option>Acme Corp</option>
              <option>TechStart Inc</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Estimate Date</label>
              <input type="date" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Expiry Date</label>
              <input type="date" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Line Items</h3>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-3">
                <input placeholder="Description" className="col-span-6 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2" />
                <input type="number" placeholder="Qty" className="col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2" />
                <input type="number" placeholder="Price" className="col-span-3 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2" />
                <button className="col-span-1 text-red-400 hover:text-red-300">×</button>
              </div>
            ))}
            <button onClick={addItem} className="text-blue-400 hover:text-blue-300 text-sm">+ Add Line Item</button>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total</span>
              <span className="text-3xl font-bold text-blue-400">${total.toFixed(2)}</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold">
              Create Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
