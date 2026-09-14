"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import {
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  Rocket, Package, ShoppingCart, KanbanSquare, Boxes, LineChart,
  Palette, Settings2, UserPlus, Ban, Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/shared/utils";
import type { Track, IconKey } from "@/lib/learn-data/tracks";
import type { WorkflowCase, WorkflowIconKey } from "@/lib/learn-data/workflow-cases";

// ============================================================================
// TRACK DETAIL VIEW — komponen shared untuk 4 sub-page /learn/[slug]
// File: src/components/marketing/learn/track-detail-view.tsx
//
// [UPGRADE — Sep 2026]
// - Breadcrumb pakai shadcn (bukan <nav> manual)
// - Carousel modul konsisten dengan hub /learn
// - Card shadow bento (module card + workflow card)
// - Container max-w-6xl (sejajar navbar pill)
// - Judul section text-center
// - Body text text-justify (rata kanan-kiri)
//
// [RSC SERIALIZATION FIX]
// track.icon + wc.icon = string (IconKey / WorkflowIconKey).
// Resolve via ICON_MAP di sini (Client Component) — aman.
// ============================================================================

const ICON_MAP: Record<IconKey | WorkflowIconKey, React.ElementType> = {
  rocket: Rocket,
  package: Package,
  "shopping-cart": ShoppingCart,
  "kanban-square": KanbanSquare,
  boxes: Boxes,
  "line-chart": LineChart,
  palette: Palette,
  settings2: Settings2,
  "user-plus": UserPlus,
  ban: Ban,
  undo2: Undo2,
  "alert-triangle": AlertTriangle,
};

function resolveIcon(key: IconKey | WorkflowIconKey): React.ElementType {
  return ICON_MAP[key];
}

// ── Shadow signature — sama dengan homepage ────────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

// ════════════════════════════════════════════════════════════════════════════
// MODULE CARD
// ════════════════════════════════════════════════════════════════════════════

function ModuleCard({ mod }: { mod: Track["modules"][number] }) {
  const Icon = resolveIcon(mod.icon);
  return (
    <div
      className={`h-full rounded-xl border border-border bg-background p-6 md:p-8 flex flex-col ${CARD_SHADOW}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-5 flex-shrink-0">
        <Icon className="w-5 h-5 text-ink" strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold text-ink mb-2">{mod.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-justify">
        {mod.summary}
      </p>

      <div className="space-y-2.5 mb-5 flex-1">
        {mod.steps.map((step, stepIdx) => (
          <div key={step.label} className="flex gap-2.5 text-sm">
            <CheckCircle2
              className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5"
              strokeWidth={1.75}
            />
            <div className="text-justify">
              <span className="font-medium text-ink">
                {stepIdx + 1}. {step.label}
              </span>
              <span className="text-muted-foreground"> — {step.description}</span>
            </div>
          </div>
        ))}
      </div>

      {mod.note && (
        <div className="flex gap-2 rounded-md bg-muted/50 border border-border px-3 py-2.5 mb-4">
          <AlertTriangle
            className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5"
            strokeWidth={1.75}
          />
          <p className="text-xs text-muted-foreground leading-relaxed text-justify">
            {mod.note}
          </p>
        </div>
      )}

      <Link
        href={mod.path}
        className="text-xs font-medium text-link hover:underline inline-flex items-center gap-1 mt-auto"
      >
        Buka {mod.title.toLowerCase()}
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODULE CAROUSEL — konsisten dengan hub /learn
// ════════════════════════════════════════════════════════════════════════════

function ModuleCarousel({ modules }: { modules: Track["modules"] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div>
      <Carousel
        setApi={setApi}
        opts={{ loop: false, align: "start" }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {modules.map((mod) => (
            <CarouselItem
              key={mod.title}
              className="pl-4 sm:basis-1/2 lg:basis-1/2"
            >
              <ModuleCard mod={mod} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {modules.length > 1 && (
          <div className="flex items-center gap-3 mt-6">
            <CarouselPrevious className="static translate-y-0 rounded-full" />
            <CarouselNext className="static translate-y-0 rounded-full" />
            <div className="flex gap-1.5 ml-2">
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Ke modul ${i + 1}`}
                  aria-current={current === i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    current === i
                      ? "w-6 bg-foreground"
                      : "w-1.5 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </Carousel>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WORKFLOW CARD
// ════════════════════════════════════════════════════════════════════════════

function WorkflowCard({ wc }: { wc: WorkflowCase }) {
  const WcIcon = resolveIcon(wc.icon);
  return (
    <div
      className={`rounded-xl border border-border bg-background p-6 ${CARD_SHADOW}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted flex-shrink-0">
            <WcIcon className="w-4 h-4 text-ink" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">{wc.title}</h3>
            <p className="text-xs text-muted-foreground">{wc.relatedTo}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs rounded-full flex-shrink-0",
            wc.kind === "happy"
              ? "text-muted-foreground"
              : "text-muted-foreground border-amber-500/30 bg-amber-500/5"
          )}
        >
          {wc.kind === "happy" ? "Alur normal" : "Butuh penanganan"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-justify">
        {wc.goal}
      </p>

      <ol className="space-y-1.5 mb-5">
        {wc.steps.map((step, idx) => (
          <li
            key={step}
            className="text-sm text-muted-foreground flex gap-2 text-justify"
          >
            <span className="text-ink font-medium flex-shrink-0">{idx + 1}.</span>
            {step}
          </li>
        ))}
      </ol>

      <div className="overflow-x-auto rounded-md border border-border mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left font-medium text-muted-foreground py-2 px-3">
                Kondisi
              </th>
              <th className="text-left font-medium text-muted-foreground py-2 px-3">
                Aksi Sistem
              </th>
              <th className="text-left font-medium text-muted-foreground py-2 px-3">
                Yang Perlu Dilakukan
              </th>
            </tr>
          </thead>
          <tbody>
            {wc.outcomes.map((row, idx) => (
              <tr
                key={row.condition}
                className={
                  idx !== wc.outcomes.length - 1 ? "border-b border-border" : ""
                }
              >
                <td className="py-2 px-3 font-medium text-ink">{row.condition}</td>
                <td className="py-2 px-3 text-muted-foreground">
                  {row.systemAction}
                </td>
                <td className="py-2 px-3 text-muted-foreground">{row.userAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {wc.followUp && (
        <div className="space-y-2 pt-1">
          {wc.followUp.map((fu) => (
            <p
              key={fu.question}
              className="text-xs text-muted-foreground leading-relaxed text-justify"
            >
              <span className="font-medium text-ink">{fu.question}</span>{" "}
              {fu.answer}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export function TrackDetailView({
  track,
  workflowCases,
}: {
  track: Track;
  workflowCases: WorkflowCase[];
}) {
  const TrackIcon = resolveIcon(track.icon);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          BREADCRUMB — shadcn Breadcrumb
      ══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pt-8 px-6">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/learn" className="flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Panduan
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{track.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HERO TRACK
      ══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pt-6 pb-10 md:pb-12 px-6">
        <div className="max-w-6xl mx-auto text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted flex-shrink-0">
              <TrackIcon className="w-4.5 h-4.5 text-ink" strokeWidth={1.75} />
            </div>
            <Badge
              variant="outline"
              className="text-xs font-medium text-muted-foreground rounded-full"
            >
              {track.stepCount} modul
            </Badge>
          </div>
          <h1 className="text-display-md md:text-display-lg text-ink mb-3 max-w-3xl">
            {track.name}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl text-justify">
            {track.description}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CAROUSEL MODUL — judul di tengah
      ══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pb-16 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold text-ink mb-6 text-center max-w-3xl mx-auto">
            Modul di Track Ini
          </h2>
          <ModuleCarousel modules={track.modules} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WORKFLOW CASES — judul di tengah
      ══════════════════════════════════════════════════════════════ */}
      {workflowCases.length > 0 && (
        <section className="w-full bg-background pb-16 md:pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <h2 className="text-lg md:text-xl font-semibold text-ink mb-1.5">
                Contoh Kasus
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                Alur nyata dari pengalaman pengguna Fibidy sehari-hari terkait
                modul di track ini.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {workflowCases.map((wc) => (
                <WorkflowCard key={wc.title} wc={wc} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          NAV BAWAH — kembali ke hub
      ══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pb-20 md:pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-ink/70 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke semua panduan
          </Link>
        </div>
      </section>
    </>
  );
}