import { useState } from 'react';
import { VendorItem } from '../types';
import { CheckCircle2, Circle, Plus, X, ShoppingBag } from 'lucide-react';

interface Props {
  items: VendorItem[];
  onUpdate: (items: VendorItem[]) => void;
}

export default function VendorTab({ items, onUpdate }: Props) {
  const [newItem, setNewItem] = useState('');

  function toggle(id: string) {
    onUpdate(items.map(i => (i.id === id ? { ...i, completed: !i.completed } : i)));
  }

  function remove(id: string) {
    onUpdate(items.filter(i => i.id !== id));
  }

  function addItem() {
    const name = newItem.trim();
    if (!name) return;
    const item: VendorItem = {
      id: `custom-${Date.now()}`,
      name,
      category: 'Custom',
      notes: '',
      completed: false,
      isCustom: true,
    };
    onUpdate([...items, item]);
    setNewItem('');
  }

  const done = items.filter(i => i.completed).length;

  return (
    <div className="space-y-6">
      {/* Top Status Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-[#544C6B]">
          {done} of {items.length} services secured
        </span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C8B6FF]/35 text-[#483777] border border-white">
          {items.length - done} pending
        </span>
      </div>

      {/* Add Custom Vendor Input */}
      <div className="glass-panel rounded-2xl p-2.5 flex items-center gap-2">
        <input
          aria-label="Add a custom vendor or service"
          type="text"
          placeholder="Add custom vendor or service (e.g. Photo Booth, Drone Pilot)..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium"
        />
        <button
          type="button"
          onClick={addItem}
          className="pastel-btn-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Vendor Checklist Rows */}
      <div className="space-y-2.5">
        {items.map(item => (
          <div
            key={item.id}
            className={`glass-card p-4 flex items-center gap-3.5 transition-all ${
              item.completed ? 'opacity-65 bg-white/50' : 'bg-white/75'
            }`}
          >
            {/* Check Toggle */}
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={item.completed}
              aria-label={`${item.completed ? 'Mark incomplete' : 'Mark complete'}: ${item.name}`}
              className="shrink-0 transition-transform active:scale-95 cursor-pointer"
              title={item.completed ? 'Mark incomplete' : 'Mark completed'}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#2A825B]" />
              ) : (
                <Circle className="w-5 h-5 text-[#9E95B3] hover:text-[#7A6B9E]" />
              )}
            </button>

            {/* Vendor Details */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-bold truncate ${
                  item.completed ? 'line-through text-[#827A96]' : 'text-[#27203A]'
                }`}
              >
                {item.name}
              </p>
              {item.notes && (
                <p className="text-xs text-[#6F6785] mt-0.5 truncate">{item.notes}</p>
              )}
              {item.isCustom && (
                <span className="text-2xs font-bold px-2 py-0.2 rounded-full bg-[#FFD6E7]/50 text-[#8C284E] inline-block mt-0.5">
                  Custom Added
                </span>
              )}
            </div>

            {/* Category Badge & Remove */}
            <div className="flex items-center gap-2 shrink-0">
              {item.category && !item.isCustom && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#CDE7FF]/50 text-[#214D6D] border border-white hidden sm:inline">
                  {item.category}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="p-1.5 rounded-lg text-[#9E95B3] hover:text-[#B22D4E] hover:bg-[#FFD6E7]/40 transition-colors cursor-pointer"
                title="Remove vendor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#7A7292]">
          <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#6B5A96]" />
          <p className="text-sm font-medium">No vendors listed yet. Add one above.</p>
        </div>
      )}
    </div>
  );
}
