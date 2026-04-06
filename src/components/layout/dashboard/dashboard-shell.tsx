import { cn } from '@/lib/shared/utils';

// ==========================================
// DASHBOARD SHELL
// Content wrapper with consistent padding
// ==========================================

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn('flex-1', className)}>
      <div className="container p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

// ==========================================
// PAGE HEADER
// Title + description + actions
// ==========================================

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}