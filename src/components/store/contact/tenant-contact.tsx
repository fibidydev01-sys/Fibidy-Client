'use client';

import { useState } from 'react';
import { ArrowRight, Phone, MapPin, MessageCircle, Mail, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { PublicTenant } from '@/types/tenant';

// ==========================================
// TENANT CONTACT
// FIX: tenant: any → tenant: PublicTenant
// ==========================================

interface TenantContactFormData {
  name: string;
  email: string;
  message: string;
}

export function TenantContact({ tenant }: { tenant: PublicTenant }) {
  const [formData, setFormData] = useState<TenantContactFormData>({
    name: '',
    email: '',
    message: '',
  });

  const whatsappLink = tenant.whatsapp
    ? `https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent(`Halo ${tenant.name}, saya tertarik dengan produk Anda.`)}`
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenant.whatsapp) {
      const message = `Halo ${tenant.name}!\n\nNama: ${formData.name}\nEmail: ${formData.email}\nPesan: ${formData.message}`;
      window.open(`https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const showMap = tenant.contactShowMap && !!tenant.contactMapUrl;
  const showForm = tenant.contactShowForm;

  return (
    <section id="contact" className="container px-4 py-20 md:py-28">

      <div className="mb-10 md:mb-14 space-y-3">
        <div className="w-8 h-px bg-foreground" />
        <h2 className="text-[36px] sm:text-[42px] lg:text-[52px] font-black leading-[1.0] tracking-tight text-foreground">
          Contact Us
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">

        {/* KIRI — Info kontak */}
        <div className="divide-y divide-border">

          {tenant.whatsapp && whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-4 hover:text-green-600 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
                <div>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">WhatsApp</p>
                  <p className="text-sm font-medium text-foreground">+{tenant.whatsapp}</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all duration-200" />
            </a>
          )}

          {tenant.phone && (
            <a
              href={`tel:${tenant.phone}`}
              className="group flex items-center justify-between py-4 hover:text-foreground/70 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">Telepon</p>
                  <p className="text-sm font-medium text-foreground">{tenant.phone}</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>
          )}

          {tenant.email && (
            <a
              href={`mailto:${tenant.email}`}
              className="group flex items-center justify-between py-4 hover:text-foreground/70 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm font-medium text-foreground">{tenant.email}</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>
          )}

          {tenant.address && (
            <div className="flex items-start gap-3 py-4">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">Alamat</p>
                <p className="text-sm font-medium text-foreground">{tenant.address}</p>
              </div>
            </div>
          )}

          {/* Form (jika showForm aktif) */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-5 pt-6">
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Kirim Pesan</p>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">Nama</Label>
                <Input
                  id="name"
                  placeholder="Nama Anda"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-medium">Pesan</Label>
                <Textarea
                  id="message"
                  placeholder="Tulis pesan Anda..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Kirim via WhatsApp
              </Button>
            </form>
          )}
        </div>

        {/* KANAN — Maps */}
        {showMap && (
          <div className="rounded-xl overflow-hidden border border-border">
            <iframe
              src={tenant.contactMapUrl}
              width="100%"
              height="400"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
            {(tenant.address || tenant.phone) && (
              <div className="flex flex-col gap-2 px-5 py-4 border-t border-border text-sm text-muted-foreground">
                {tenant.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{tenant.address}</span>
                  </div>
                )}
                {tenant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{tenant.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}