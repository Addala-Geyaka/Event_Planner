import { useState } from 'react';
import { BudgetItem } from '../types';
import { formatCurrency, calculateBudgetTotals, recalculatePercentages } from '../utils/budgetUtils';
import { Edit2, Check, X, AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  items: BudgetItem[];
  totalBudget: number;
  currency: string;
  onUpdate: (items: BudgetItem[]) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Venue: { bg: 'bg-[#CDE7FF]/60', text: 'text-[#205072]' },
  'Food & Catering': { bg: 'bg-[#B4F8C8]/60', text: 'text-[#1E6148]' },
  Catering: { bg: 'bg-[#B4F8C8]/60', text: 'text-[#1E6148]' },
  Decorations: { bg: 'bg-[#FFD6E7]/60', text: 'text-[#872D52]' },
  'Photography & Videography': { bg: 'bg-[#FFE5A3]/60', text: 'text-[#6E4F12]' },
  Photography: { bg: 'bg-[#FFE5A3]/60', text: 'text-[#6E4F12]' },
  'Clothing & Styling': { bg: 'bg-[#C8B6FF]/60', text: 'text-[#483777]' },
  Clothing: { bg: 'bg-[#C8B6FF]/60', text: 'text-[#483777]' },
  Entertainment: { bg: 'bg-[#FFC6FF]/60', text: 'text-[#7B3175]' },
  'Cake & Gifts': { bg: 'bg-[#FFB5B5]/60', text: 'text-[#822C2C]' },
  Cake: { bg: 'bg-[#FFB5B5]/60', text: 'text-[#822C2C]' },
  Miscellaneous: { bg: 'bg-[#E2DEEE]/60', text: 'text-[#4E4663]' },
  'Emergency Contingency': { bg: 'bg-[#A0E7E5]/60', text: 'text-[#1A5F5D]' },
  Contingency: { bg: 'bg-[#A0E7E5]/60', text: 'text-[#1A5F5D]' },
};

function getCategoryBadge(category: string) {
  const style = CATEGORY_COLORS[category] ?? { bg: 'bg-[#B8C0FF]/60', text: 'text-[#3B4377]' };
  return `${style.bg} ${style.text}`;
}

export default function BudgetTab({ items, totalBudget, currency, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const totals = calculateBudgetTotals(items, totalBudget);

  function startEdit(item: BudgetItem) {
    setEditingId(item.id);
    setEditValue(String(item.amount));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  function saveEdit(id: string) {
    const newAmount = Math.max(0, Math.round(parseFloat(editValue) || 0));
    const updated = items.map(item => (item.id === id ? { ...item, amount: newAmount } : item));
    onUpdate(recalculatePercentages(updated, totalBudget));
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      {/* 3 Metrics Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="glass-card p-5 text-center border-t-2 border-t-[#C8B6FF]">
          <p className="text-xs font-bold text-[#6D5E94] uppercase tracking-wider mb-1">
            Total Budget
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#27203A]">
            {formatCurrency(totalBudget, currency)}
          </p>
        </div>

        {/* Total Allocated */}
        <div className="glass-card p-5 text-center border-t-2 border-t-[#B4F8C8]">
          <p className="text-xs font-bold text-[#2A7256] uppercase tracking-wider mb-1">
            Allocated Amount
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1B5740]">
            {formatCurrency(totals.totalAllocated, currency)}
          </p>
        </div>

        {/* Remaining / Over Budget */}
        <div
          className={`glass-card p-5 text-center border-t-2 ${
            totals.isOverBudget ? 'border-t-[#FF94B8] bg-[#FFF0F5]/70' : 'border-t-[#CDE7FF]'
          }`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider mb-1 ${
              totals.isOverBudget ? 'text-[#A0284A]' : 'text-[#2D5C80]'
            }`}
          >
            {totals.isOverBudget ? 'Budget Exceeded' : 'Remaining Funds'}
          </p>
          <p
            className={`text-2xl sm:text-3xl font-extrabold ${
              totals.isOverBudget ? 'text-[#911F3F]' : 'text-[#1D4A6E]'
            }`}
          >
            {totals.isOverBudget
              ? `-${formatCurrency(Math.abs(totals.remaining), currency)}`
              : formatCurrency(totals.remaining, currency)}
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7">
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-[#544C6B] mb-2.5">
          <span>Allocation Utilization</span>
          <span className="font-bold text-[#27203A]">
            {Math.round(totals.percentageUsed)}% allocated
          </span>
        </div>
        <div
          className="h-3 bg-white/70 rounded-full overflow-hidden border border-white p-0.5"
          role="progressbar"
          aria-label="Budget allocation"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, Math.round(totals.percentageUsed))}
          aria-valuetext={`${Math.round(totals.percentageUsed)} percent allocated`}
        >
          <div
            aria-hidden="true"
            className={`h-full rounded-full transition-all duration-500 ${
              totals.isOverBudget
                ? 'bg-gradient-to-r from-[#FF94B8] to-[#E63946]'
                : 'bg-gradient-to-r from-[#B8C0FF] via-[#C8B6FF] to-[#FFD6E7]'
            }`}
            style={{ width: `${Math.min(100, totals.percentageUsed)}%` }}
          />
        </div>

        {totals.isOverBudget && (
          <div className="mt-4 p-4 rounded-2xl bg-[#FFD6E7]/70 border border-[#FF94B8]/60 text-[#8C2244] text-xs sm:text-sm flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Your allocations exceed the total budget by{' '}
              <strong>{formatCurrency(Math.abs(totals.remaining), currency)}</strong>. Click the edit
              icon on any item to adjust amounts.
            </span>
          </div>
        )}
      </div>

      {/* Budget Breakdown Items List */}
      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-white ${getCategoryBadge(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
                <span className="text-xs font-bold text-[#6B6382]">
                  {item.percentage}% of budget
                </span>
              </div>
              {item.notes && (
                <p className="text-xs text-[#6F6785] mt-1 leading-relaxed">{item.notes}</p>
              )}
            </div>

            {/* Price & Edit Control */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              {editingId === item.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    aria-label={`Budget amount for ${item.category}`}
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-28 glass-input rounded-xl px-3 py-1.5 text-sm font-bold"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(item.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(item.id)}
                    aria-label={`Save amount for ${item.category}`}
                    className="p-1.5 rounded-lg bg-[#B4F8C8] text-[#1B5740] hover:bg-[#8FF2B2] transition-colors cursor-pointer"
                    title="Save amount"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    aria-label={`Cancel editing ${item.category}`}
                    className="p-1.5 rounded-lg bg-white/70 text-[#6F6785] hover:bg-white transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#27203A]">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit amount for ${item.category}`}
                    className="p-1.5 rounded-lg bg-white/60 text-[#6B6382] hover:text-[#4A3B73] hover:bg-white transition-all cursor-pointer border border-white/80"
                    title="Edit amount"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#7A7292] text-center flex items-center justify-center gap-1 pt-2">
        <TrendingUp className="w-3.5 h-3.5 text-[#A28ED8]" />
        <span>
          Amounts are estimated allocations. Click the pencil icon to modify any category in real time.
        </span>
      </p>
    </div>
  );
}
