// src/components/discover/pdf-preview.tsx
'use client';

/**
 * Render preview of the first PDF pages using pdfjs-dist.
 *
 * ⚠️ pdfjs-dist accesses DOMMatrix on import — a browser-only API.
 *    MUST NOT be imported at the top level because Next.js SSR will crash.
 *    Solution: dynamic import() inside useEffect (client-only).
 *
 * Flow:
 *   1. useEffect → dynamic import('pdfjs-dist')
 *   2. Set worker URL
 *   3. Load PDF from previewUrl (signed R2 URL, TTL 15 minutes)
 *   4. Render the first `maxPages` pages directly to <canvas>
 *   5. Show footer "X of Y pages"
 *
 * Dependency: pdfjs-dist
 *   npm install pdfjs-dist
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

const RENDER_SCALE = 1.5;

// ── Sub-component: render a single PDF page to canvas ──────────

function PdfPage({
  renderPage,
  pageNumber,
}: {
  renderPage: (canvas: HTMLCanvasElement, pageNumber: number) => Promise<void>;
  pageNumber: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderPage(canvasRef.current, pageNumber);
  }, [renderPage, pageNumber]);

  return (
    <div className="shadow-md rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

interface PdfPreviewProps {
  previewUrl: string;
  maxPages?: number;
  pageCount?: number | null;
  onRefresh?: () => void;
}

export function PdfPreview({
  previewUrl,
  maxPages = 3,
  pageCount,
  onRefresh,
}: PdfPreviewProps) {
  const t = useTranslations('discover.pdfPreview');
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store pdf document in ref (not state — avoids re-render loops)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Load pdfjs + document — dynamic import to avoid SSR crash
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setReady(false);

      try {
        // Dynamic import — client only, never on the server
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker — must be done before getDocument
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const doc = await pdfjsLib.getDocument(previewUrl).promise;

        if (!cancelled) {
          pdfDocRef.current = doc;
          setNumPages(doc.numPages);
          setReady(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(t('error'));
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [previewUrl, t]);

  // Render function passed to each PdfPage
  const renderPage = useCallback(
    async (canvas: HTMLCanvasElement, pageNumber: number) => {
      const doc = pdfDocRef.current;
      if (!doc) return;

      try {
        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // pdfjs v5: `canvas` is required in RenderParameters
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch {
        // Silent fail per page — other pages still render
      }
    },
    [],
  );

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t('loading')}</span>
        </div>
      </div>
    );
  }

  // ── Error — retry button re-fetches signed URL ──────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg gap-3">
        <p className="text-sm text-muted-foreground">{error}</p>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            {t('reload')}
          </Button>
        )}
      </div>
    );
  }

  if (!ready) return null;

  const pagesToRender = Math.min(numPages, maxPages);
  const pageNumbers = Array.from({ length: pagesToRender }, (_, i) => i + 1);

  // ── Rendered pages ──────────────────────────────────────────
  return (
    <div className="space-y-4">
      {pageNumbers.map((num) => (
        <PdfPage key={num} renderPage={renderPage} pageNumber={num} />
      ))}

      {/* Footer — "3 of 48 pages" */}
      {pageCount != null && pageCount > pagesToRender && (
        <div className="text-center py-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t('pageRange', { shown: pagesToRender, total: pageCount })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('buyHint')}
          </p>
        </div>
      )}
    </div>
  );
}