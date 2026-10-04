import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Copy,
  Utensils,
  ArrowRight,
  ListFilter,
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function ShoppingList() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shopping-list');
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleToggle = async (itemId) => {
    try {
      setItems((prev) =>
        prev.map((it) => (it._id === itemId ? { ...it, isChecked: !it.isChecked } : it))
      );
      await api.patch(`/shopping-list/items/${itemId}/toggle`);
    } catch (err) {
      showToast(err.message, 'error');
      fetchList(); // Revert
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setItems((prev) => prev.filter((it) => it._id !== itemId));
      const res = await api.delete(`/shopping-list/items/${itemId}`);
      if (res.success) {
        showToast('Item removed', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
      fetchList();
    }
  };

  const handleClearCompleted = async () => {
    try {
      const res = await api.delete('/shopping-list/completed');
      if (res.success) {
        setItems(res.items || []);
        showToast('Completed items cleared', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMergeDuplicates = async () => {
    try {
      const res = await api.post('/shopping-list/merge');
      if (res.success) {
        setItems(res.items || []);
        showToast(res.message || 'Duplicate items merged', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all items from your shopping list?')) return;
    try {
      const res = await api.delete('/shopping-list/clear');
      if (res.success) {
        setItems([]);
        showToast('Shopping list cleared', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddCustomItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      setAddingItem(true);
      const res = await api.post('/shopping-list/add', {
        items: [
          {
            name: newItemName.trim(),
            quantity: newItemQty.trim(),
            unit: newItemUnit.trim(),
            recipeTitle: 'Custom Groceries',
          },
        ],
      });

      if (res.success) {
        setItems(res.items || []);
        setNewItemName('');
        setNewItemQty('');
        setNewItemUnit('');
        showToast('Item added to grocery list', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAddingItem(false);
    }
  };

  const copyListToClipboard = () => {
    if (items.length === 0) return;
    const text = items
      .map(
        (it) =>
          `[${it.isChecked ? 'x' : ' '}] ${it.quantity ? `${it.quantity} ` : ''}${
            it.unit ? `${it.unit} ` : ''
          }${it.name} (${it.recipeTitle || 'Grocery'})`
      )
      .join('\n');

    navigator.clipboard.writeText(`🛒 RecipeHaven Grocery List:\n\n${text}`);
    showToast('Shopping list copied to clipboard!', 'success');
  };

  // Group items by recipe source
  const groupedItems = items.reduce((acc, item) => {
    const key = item.recipeTitle || 'Other Groceries';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const completedCount = items.filter((it) => it.isChecked).length;
  const remainingCount = items.length - completedCount;

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-8 h-8 text-emerald-600" />
            Interactive Shopping List
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Check off groceries as you shop. Ingredients added from recipes appear here automatically.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleMergeDuplicates}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
              title="Combine repeated ingredients by quantity"
            >
              <ListFilter className="w-3.5 h-3.5 text-amber-600" />
              <span>Merge Duplicates</span>
            </button>
            <button
              type="button"
              onClick={copyListToClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy List</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Custom Item Box */}
      <form
        onSubmit={handleAddCustomItem}
        className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs mb-8 flex flex-col sm:flex-row items-center gap-2.5"
      >
        <input
          type="text"
          required
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add custom grocery item (e.g., Organic Milk, Olive Oil)..."
          className="flex-3 w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            placeholder="Qty"
            className="w-20 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-center focus:outline-none"
          />
          <input
            type="text"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            placeholder="Unit"
            className="w-24 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-center focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingItem}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Progress Counter & Clear Completed button */}
      {items.length > 0 && (
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3 text-xs font-semibold text-stone-600">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {remainingCount} To Buy
            </span>
            <span>•</span>
            <span className="text-stone-400">{completedCount} Checked Off</span>
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={handleClearCompleted}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              Clear Completed ({completedCount})
            </button>
          )}
        </div>
      )}

      {/* Grouped Checklist */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([recipeTitle, groupList]) => (
            <div
              key={recipeTitle}
              className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  {recipeTitle}
                </span>
                <span className="text-xs text-stone-400 font-semibold">
                  {groupList.length} items
                </span>
              </div>

              <ul className="divide-y divide-stone-100">
                {groupList.map((item) => (
                  <li
                    key={item._id}
                    className="py-2.5 flex items-center justify-between gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(item._id)}
                      className="flex items-center gap-3 text-left cursor-pointer flex-1"
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          item.isChecked
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-stone-300 group-hover:border-emerald-500 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span
                        className={`text-sm font-medium transition-colors ${
                          item.isChecked
                            ? 'line-through text-stone-400'
                            : 'text-stone-900 font-semibold'
                        }`}
                      >
                        {item.quantity && (
                          <span className="font-bold text-amber-800 mr-1.5">
                            {item.quantity} {item.unit}
                          </span>
                        )}
                        {item.name}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item._id)}
                      className="p-1.5 text-stone-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
          <ShoppingBag className="w-16 h-16 text-stone-200 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800">Your shopping list is empty</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            Browse any recipe and click "Add All to Shopping List" or type custom groceries above.
          </p>
          <Link
            to="/recipes"
            className="mt-5 inline-block px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
          >
            Explore Recipes
          </Link>
        </div>
      )}
    </div>
  );
}
