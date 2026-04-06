// ─── Product Form Wizard — Shared Types ───────────────────────────────────

interface WizardStep {
  id: number;
  title: string;
  desc: string;
}

export const PRODUCT_STEPS: WizardStep[] = [
  { id: 0, title: 'Details', desc: 'Name, description & pricing' },
  { id: 1, title: 'Media', desc: 'Photos' },
] as const;