import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Minus } from "lucide-react";

type CellType =
  | { type: "check" }
  | { type: "dash" }
  | { type: "text"; value: string; highlight?: boolean };

const pricingFeatures: { label: string; free: CellType; starter: CellType }[] = [
  { label: "Produk di toko online", free: { type: "text", value: "20 produk" }, starter: { type: "text", value: "50 produk", highlight: true } },
  { label: "Foto per produk", free: { type: "text", value: "2 foto" }, starter: { type: "text", value: "3 foto", highlight: true } },
  { label: "Pilihan tampilan halaman", free: { type: "text", value: "3 pilihan" }, starter: { type: "text", value: "12 pilihan", highlight: true } },
  { label: "Kasir untuk catat penjualan", free: { type: "dash" }, starter: { type: "check" } },
  { label: "Data otomatis terisi", free: { type: "check" }, starter: { type: "check" } },
  { label: "Ganti tampilan bebas", free: { type: "check" }, starter: { type: "check" } },
];

function Cell({ cell }: { cell: CellType }) {
  if (cell.type === "check") return <Check className="w-4 h-4 text-foreground mx-auto" />;
  if (cell.type === "dash") return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  return (
    <span className={`text-sm block text-center ${cell.highlight ? "text-primary" : "text-muted-foreground"}`}>
      {cell.value}
    </span>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="w-full bg-background py-16 md:py-section px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <Badge variant="outline" className="mb-4 text-xs font-medium text-muted-foreground rounded-full">
            # Harga
          </Badge>
          <h2 className="text-display-md sm:text-display-lg md:text-display-xl text-ink mb-4">
            Harga Terjangkau
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Toko online bisa langsung dipakai gratis.
          </p>
          <p className="text-sm text-ink mt-1">
            Toko online lengkap mulai Rp 35.000 per bulan bayar sekali per periode lewat QRIS, langsung aktif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border rounded-2xl overflow-hidden mb-10">
          <Card className="rounded-none border-0 border-b md:border-b-0 md:border-r border-border shadow-none">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Free</p>
                <p className="text-xs text-muted-foreground">Toko online terbatas.</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">Rp 0</p>
                <p className="text-xs text-muted-foreground mt-1">Gratis selamanya</p>
              </div>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-none border-0 shadow-none">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Starter</p>
                <p className="text-xs text-muted-foreground">Toko online lengkap Kasir buat catat penjualan.</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">35rb</p>
                <p className="text-xs text-ink mt-1">per bulan</p>
              </div>
              <Button className="w-full rounded-full" asChild>
                <Link href="/register">Mulai Starter</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="w-full">
          <div className="min-w-[360px]">
            <div className="grid grid-cols-3 pb-3">
              <div />
              <div className="text-center text-sm font-semibold text-muted-foreground">Free</div>
              <div className="text-center text-sm font-semibold text-foreground">Starter</div>
            </div>
            {pricingFeatures.map((f, i) => (
              <div key={i} className="grid grid-cols-3 py-4 border-t border-border items-center">
                <span className="text-sm text-foreground">{f.label}</span>
                <div><Cell cell={f.free} /></div>
                <div><Cell cell={f.starter} /></div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Butuh lebih dari itu? Paket{" "}
          <span className="text-foreground font-medium">Business</span> Rp 149.000 per bulan:
          produk tanpa batas, dan semua pilihan varian tampilan.
        </p>
      </div>
    </section>
  );
}
