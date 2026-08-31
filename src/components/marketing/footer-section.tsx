import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Produk: [
    { label: "Fitur", href: "#about" },
    { label: "Cara Kerjanya", href: "#timeline" },
    { label: "Harga", href: "#pricing" },
    { label: "Tanya Jawab", href: "#faq" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "#about" },
    { label: "Hubungi Kami", href: "#contact" },
  ],
  Dukungan: [
    { label: "Pusat Bantuan", href: "/legal/faq" },
    { label: "Hubungi Kami", href: "#contact" },
  ],
} as const;

const legalLinks = [
  { label: "Tentang Kami", href: "/legal/about" },
  { label: "Syarat Layanan", href: "/legal/terms" },
  { label: "Privasi", href: "/legal/privacy" },
  { label: "Cookies", href: "/legal/cookies" },
];

export function FooterSection() {
  return (
    <footer className="w-full bg-background px-6 pt-10 pb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--primary)" />
              <path
                d="M8 9C8 8.44772 8.44772 8 9 8H18C18.5523 8 19 8.44772 19 9C19 9.55228 18.5523 10 18 10H10V13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H10V19C10 19.5523 9.55228 20 9 20C8.44772 20 8 19.5523 8 19V9Z"
                fill="var(--primary-foreground)"
              />
            </svg>
            <span className="text-sm font-semibold text-foreground">Fibidy</span>
          </Link>
          <p className="text-xs text-muted-foreground max-w-xs">
            Platform Toko Online untuk UMKM Indonesia.
          </p>
        </div>

        <Separator className="mb-8" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 pb-10">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-sm font-semibold text-foreground mb-4">{category}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href as string}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold text-foreground mb-4">Legal</p>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Fibidy. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
