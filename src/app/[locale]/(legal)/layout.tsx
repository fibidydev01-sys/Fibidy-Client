import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Fibidy',
    default: 'Fibidy',
  },
};

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}