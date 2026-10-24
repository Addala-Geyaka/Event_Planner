import { TimelineTask } from '../types';
import { formatDate } from '../utils/dateUtils';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  tasks: TimelineTask[];
  onToggleComplete: (id: string) => void;
}

export default function TimelineTab({ tasks, onToggleComplete }: Props) {
  // Sort: earliest chronological tasks first (tasks furthest from event first)
  const sorted = [...tasks].sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent);

  function getStatusBadge(task: TimelineTask) {
    if (task.completed)
      return { badge: 'bg-[#B4F8C8]/60 text-[#1B5740] border-[#B4F8C8]', label: 'Completed' };
    switch (task.status) {
      case 'overdue':
        return { badge: 'bg-[#FFD6E7]/60 text-[#8C284E] border-[#FF94B8]', label: 'Overdue' };
      case 'due':
        return { badge: 'bg-[#FFE5A3]/60 text-[#6E4F12] border-[#FFD166]', label: 'Due Soon' };
      default:
        return { badge: 'bg-[#CDE7FF]/60 text-[#214D6D] border-[#CDE7FF]', label: 'Upcoming' };
    }
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Preparation Progress Glass Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7">
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-[#544C6B] mb-2.5">
          <span>Schedule Readiness</span>
          <span className="font-bold text-[#27203A]">
            {completed} of {total} tasks accomplished
          </span>
        </div>
        <div
          className="h-3 bg-white/70 rounded-full overflow-hidden border border-white p-0.5"
          role="progressbar"
          aria-label="Schedule readiness"
          aria-valuemin={0}
          aria-valuemax={Math.max(total, 1)}
          aria-valuenow={completed}
          aria-valuetext={`${completed} of ${total} tasks completed`}
        >
          <div
            aria-hidden="true"
            className="h-full bg-gradient-to-r from-[#B8C0FF] via-[#C8B6FF] to-[#FFD6E7] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#7A7292]">
          <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#6B5A96]" />
          <p className="text-sm font-medium">No timeline tasks found.</p>
        </div>
      )}

      {/* Vertical Connected Glass Timeline */}
      <div className="relative pl-3 sm:pl-4">
        {/* Soft pastel connecting line */}
        <div className="absolute left-[22px] sm:left-[26px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#C8B6FF] via-[#B8C0FF] to-[#FFD6E7]" />

        <div className="space-y-4">
          {sorted.map(task => {
            const style = getStatusBadge(task);
            return (
              <div key={task.id} className="relative flex items-start gap-3 sm:gap-4 group">
                {/* Circle Checkmark Interactive Button */}
                <button
                  type="button"
                  onClick={() => onToggleComplete(task.id)}
                  aria-pressed={task.completed}
                  aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.task}`}
                  className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs border ${
                    task.completed
                      ? 'bg-[#B4F8C8] text-[#1B5740] border-[#91E9AA] scale-105'
                      : 'bg-white/80 border-[#C8B6FF]/70 text-[#716987] hover:border-[#B8C0FF] hover:bg-white hover:scale-105'
                  }`}
                  title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#1B5740]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#9C94B0]" />
                  )}
                </button>

                {/* Task Details Card */}
                <div
                  className={`flex-1 glass-card p-4 sm:p-5 transition-all ${
                    task.completed ? 'opacity-70 bg-white/50' : 'bg-white/75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          task.completed
                            ? 'line-through text-[#827A96]'
                            : 'text-[#27203A]'
                        }`}
                      >
                        {task.task}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5F5774] mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <span
                        className={`text-2xs sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}
                      >
                        {style.label}
                      </span>
                      <span className="text-xs text-[#716987] font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#9E94B8]" />
                        <span>{formatDate(task.targetDate)}</span>
                      </span>
                    </div>
                  </div>

                  {!task.completed && task.status === 'overdue' && (
                    <div className="mt-2.5 pt-2 border-t border-[#FF94B8]/30 flex items-center gap-1.5 text-xs text-[#A0284A] font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>This milestone has passed its scheduled date.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
