export function getTimelineStatus(
  targetDate: string
): 'upcoming' | 'due' | 'overdue' | 'completed' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 3) return 'upcoming';
  if (diffDays >= 0) return 'due';
  return 'overdue';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getDaysUntilEvent(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  return Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
