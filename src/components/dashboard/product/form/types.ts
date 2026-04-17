// ─── Product Form Wizard — v3 Unified (3 Steps) ──────────────────────────

interface WizardStep {
  id: number;
  title: string;
  desc: string;
}

export const PRODUCT_STEPS: WizardStep[] = [
  { id: 0, title: 'Details', desc: 'Name, description & pricing' },
  { id: 1, title: 'File', desc: 'Upload digital file' },
  { id: 2, title: 'Cover', desc: 'Cover images (optional)' },
] as const;
