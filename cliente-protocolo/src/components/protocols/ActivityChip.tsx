import { cn } from '../../utils/cn';

interface ActivityChipProps {
  activity: { title: string; description?: string; duration?: string };
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function ActivityChip({ activity, selected = false, onSelect, className }: ActivityChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn('activity-row', selected && 'activity-row--selected', className)}
    >
      <span className="activity-row__icon" aria-hidden="true">✦</span>
      <span className="activity-row__copy">
        <span className="activity-row__title">{activity.title}</span>
        {activity.description && <span className="activity-row__description">{activity.description}</span>}
        {activity.duration && <span className="activity-row__duration">{activity.duration}</span>}
      </span>
      <span className="activity-row__arrow" aria-hidden="true">›</span>
    </button>
  );
}
