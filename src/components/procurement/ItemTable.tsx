import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Trash2, Plus } from 'lucide-react';
import { RequestItem } from '../../lib/db';

interface ItemTableProps {
  items: RequestItem[];
  onChange: (items: RequestItem[]) => void;
}

export const ItemTable: React.FC<ItemTableProps> = ({ items, onChange }) => {
  const [newItem, setNewItem] = useState({ itemName: '', quantity: '', approxAmount: '' });

  const addItem = () => {
    if (newItem.itemName && newItem.quantity && newItem.approxAmount) {
      const item: RequestItem = {
        id: Date.now().toString(),
        itemName: newItem.itemName,
        quantity: parseInt(newItem.quantity),
        approxAmount: parseFloat(newItem.approxAmount),
      };
      onChange([...items, item]);
      setNewItem({ itemName: '', quantity: '', approxAmount: '' });
    }
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.approxAmount, 0);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Item Name</th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Quantity</th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Approx. Amount (₹)</th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-gray-200 dark:border-slate-700"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{item.itemName}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{item.quantity}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">₹{item.approxAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            <tr className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
              <td className="px-6 py-4">
                <Input
                  placeholder="Item name"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className="rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
              </td>
              <td className="px-6 py-4">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
              </td>
              <td className="px-6 py-4">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newItem.approxAmount}
                  onChange={(e) => setNewItem({ ...newItem, approxAmount: e.target.value })}
                  className="rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
              </td>
              <td className="px-6 py-4">
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-all duration-200"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-end"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-8 py-4 rounded-2xl border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
          <p className="text-blue-900 dark:text-blue-100 mt-1">₹{totalAmount.toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
};
