import { ReactNode } from "react";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function ActionCard({ icon, title, description, actions }: ActionCardProps) {
  return (
    <div className="action-card">
      <div className="action-card__info">
        <span className="action-card__icon">{icon}</span>
        <div>
          <h3 className="action-card__title">{title}</h3>
          {description && <p className="action-card__description">{description}</p>}
        </div>
      </div>
      {actions && <div className="action-card__actions">{actions}</div>}
    </div>
  );
}
