'use client';

import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { FeatureItem } from '@/types/tenant';

// ==========================================
// TENANT ABOUT
// FIX: features: any[] → FeatureItem[]
// ==========================================

export function TenantAbout({ features = [] }: { features: FeatureItem[] }) {
  const validFeatures = features.filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.icon)
  );

  if (validFeatures.length === 0) return null;

  return (
    <section id="about" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-8 md:px-16 lg:px-20">
        <div className="relative">
          <Carousel
            opts={{
              align: 'center',
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {validFeatures.map((feature, index) => (
                <CarouselItem
                  key={index}
                  className="pl-3 md:pl-4 basis-[280px] md:basis-[320px]"
                >
                  <div className="flex flex-col gap-3">
                    {feature.icon && (
                      <div className="overflow-hidden rounded-xl border border-border">
                        <AspectRatio ratio={3 / 4}>
                          <Image
                            src={feature.icon}
                            alt={feature.title ?? ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 280px, 320px"
                          />
                        </AspectRatio>
                      </div>
                    )}
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {feature.title}
                    </p>
                    {feature.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Desktop — arrow di luar kiri & kanan */}
            {validFeatures.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:flex -left-10 lg:-left-12" />
                <CarouselNext className="hidden md:flex -right-10 lg:-right-12" />
              </>
            )}

            {/* Mobile — arrow di bawah tengah */}
            {validFeatures.length > 1 && (
              <div className="flex md:hidden justify-center gap-3 mt-6">
                <CarouselPrevious className="static translate-y-0 translate-x-0" />
                <CarouselNext className="static translate-y-0 translate-x-0" />
              </div>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}