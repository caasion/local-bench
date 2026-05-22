import { ReactNode } from "react";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function ActionCard({ icon, title, description, actions }: ActionCardProps) {
  return (
    <div className="bg-white/10 border border-[var(--border)] rounded-[var(--radius-sm)] px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex text-[var(--text-primary)]">{icon}</span>
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
          {description && (
            <p className="text-[0.8rem] text-[var(--text-secondary)] font-normal">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
