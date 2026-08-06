import { cn } from '@/lib/shared/utils';

// ==========================================
// DASHBOARD SHELL
// Content wrapper with consistent padding
//
// [UI/UX — Aug 2026] Both wrapper divs are now `flex flex-col` +
// `flex-1` on the inner one. Without this, the inner `container` div
// only ever sized itself to its own content (a plain block div has no
// reason to stretch just because ITS parent got a tall flex-stretched
// height) — so a page's own `h-full` wrapper had nothing definite to
// resolve 100% against, and on short pages (Language, Password — a
// couple of fields) that meant the sticky wizard bar never reached the
// bottom of the viewport; it just sat right after the short content,
// wherever that happened to end. `flex-1` here gives `container` a real,
// definite height (viewport height, via SidebarProvider's min-h-svh),
// so `h-full` + `flex-1` + the sticky bar as last child inside a page
// now correctly bottoms out at the actual viewport edge regardless of
// how little content that page has.
// ==========================================

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn('flex flex-1 flex-col', className)}>
      <div className="container flex-1 p-4 md:p-6 lg:p-8">
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