import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm text-text-muted max-w-2xl">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
