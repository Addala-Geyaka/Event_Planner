import { BudgetItem } from '../types';

export function calculateBudgetTotals(items: BudgetItem[], totalBudget: number) {
  const totalAllocated = items.reduce((sum, item) => sum + Math.round(item.amount), 0);
  const remaining = totalBudget - totalAllocated;
  const isOverBudget = remaining < 0;

  return {
    totalAllocated,
    remaining,
    isOverBudget,
    percentageUsed: totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0,
  };
}

export function recalculatePercentages(items: BudgetItem[], totalBudget: number): BudgetItem[] {
  return items.map(item => ({
    ...item,
    percentage:
      totalBudget > 0 ? Math.round((item.amount / totalBudget) * 100 * 10) / 10 : 0,
  }));
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
  };
  const symbol = symbols[currency] ?? `${currency} `;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}
