#!/bin/bash
# collect.sh – Collect file per modul atau semua sekaligus
# Jalankan dari: /d/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/railway/client

COLLECTIONS_DIR="collections"
mkdir -p "$COLLECTIONS_DIR"

# ── Definisi Modul ─────────────────────────────────────────────────────────────
declare -A MODULE_PATHS
declare -A MODULE_LABELS

MODULE_LABELS[1]="Auth              (login, register, forgot-password)"
MODULE_LABELS[2]="Kasir             (kasir, keranjang, laporan, papan, riwayat, stok)"
MODULE_LABELS[3]="Products          (products, new, edit)"
MODULE_LABELS[4]="Settings          (settings)"
MODULE_LABELS[5]="Setup Store       (setup-store, seller wizard)"
MODULE_LABELS[6]="Studio            (landing builder)"
MODULE_LABELS[7]="Store Front       (store/[slug])"
MODULE_LABELS[8]="Legal             (legal pages)"
MODULE_LABELS[9]="Marketing         (landing page)"
MODULE_LABELS[10]="Messages i18n    (en + id JSON)"
MODULE_LABELS[11]="Shared/Global    (hooks, stores, lib, types, components/ui)"
MODULE_LABELS[12]="Skeleton Files   (17 file pengguna skeleton – FINAL)"
MODULE_LABELS[0]="SEMUA MODUL      (collect semuanya)"

MODULE_PATHS[1]="
  src/app/\[locale\]/\(auth\)
  src/components/auth
  src/components/layout/auth
  src/hooks/auth
"
MODULE_PATHS[2]="
  src/app/\[locale\]/\(dashboard\)/dashboard/kasir
  src/components/dashboard/kasir
  src/hooks/dashboard/use-kasir.ts
  src/hooks/dashboard/use-kasir-lock.ts
  src/stores/kasir-cart-store.ts
  src/lib/shared/kasir-promo.ts
  src/types/kasir.ts
  src/lib/api/kasir.ts
"
MODULE_PATHS[3]="
  src/app/\[locale\]/\(dashboard\)/dashboard/products
  src/components/dashboard/product
  src/hooks/dashboard/use-products.ts
  src/lib/api/products.ts
  src/types/product.ts
"
MODULE_PATHS[4]="
  src/app/\[locale\]/\(dashboard\)/dashboard/settings
  src/components/dashboard/settings
"
MODULE_PATHS[5]="
  src/app/\[locale\]/\(dashboard\)/dashboard/setup-store
  src/components/dashboard/setup-store
"
MODULE_PATHS[6]="
  src/app/\[locale\]/\(dashboard\)/dashboard/studio
  src/components/dashboard/studio
  src/hooks/dashboard/use-builder-store.ts
  src/hooks/dashboard/use-landing-config.ts
  src/types/landing.ts
"
MODULE_PATHS[7]="
  src/app/\[locale\]/store
  src/components/store
  src/components/layout/store
  src/lib/public
"
MODULE_PATHS[8]="
  src/app/\[locale\]/\(legal\)
"
MODULE_PATHS[9]="
  src/app/\[locale\]/\(marketing\)
  src/components/marketing
"
MODULE_PATHS[10]="
  messages
"
MODULE_PATHS[11]="
  src/hooks/shared
  src/stores/auth-store.ts
  src/stores/upgrade-modal-store.ts
  src/components/ui
  src/components/shared
  src/components/layout/dashboard
  src/lib/shared
  src/lib/api
  src/lib/constants
  src/lib/providers
  src/types/api.ts
  src/types/auth.ts
  src/types/tenant.ts
  src/types/cloudinary.ts
  src/i18n
  src/proxy.ts
"

# ── Modul 12: Skeleton Files – 17 file FINAL ──────────────────────────────────
# 13 file consumer (app/) + 4 file skeleton component (components/)
MODULE_PATHS[12]="
  src/app/\[locale\]/\(auth\)/forgot-password/page.tsx
  src/app/\[locale\]/\(auth\)/login/page.tsx
  src/app/\[locale\]/\(auth\)/register/page.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/kasir/client.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/kasir/laporan/client.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/kasir/papan/client.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/kasir/riwayat/client.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/kasir/stok/client.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/products/client.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/products/\[id\]/edit/page.tsx
  src/app/\[locale\]/\(dashboard\)/dashboard/settings/client.tsx
  src/app/\[locale\]/store/\[slug\]/products/page.tsx
  src/app/\[locale\]/store/\[slug\]/products/\[id\]/page.tsx
  src/components/ui/skeleton.tsx
  src/components/dashboard/kasir/katalog-card.tsx
  src/components/dashboard/kasir/kasir-state.tsx
  src/components/dashboard/product/product-grid.tsx
  src/components/layout/store/store-skeleton.tsx
"

# ── Fungsi collect ─────────────────────────────────────────────────────────────
collect_paths() {
  local output="$1"
  local paths="$2"

  for path in $paths; do
    local real_path="${path//\\/}"
    if [[ -f "$real_path" ]]; then
      echo "  📄  $real_path"
      {
        echo ""
        echo "################################################################################"
        echo "## FILE: $real_path"
        echo "################################################################################"
        cat "$real_path"
        echo ""
      } >> "$output"
    elif [[ -d "$real_path" ]]; then
      echo "  📂  $real_path/"
      find "$real_path" -type f | sort | while read -r file; do
        echo "      📄  $file"
        {
          echo ""
          echo "################################################################################"
          echo "## FILE: $file"
          echo "################################################################################"
          cat "$file"
          echo ""
        } >> "$output"
      done
    else
      echo "  ⚠️   Skip (tidak ditemukan): $real_path"
    fi
  done
}

write_header() {
  local output="$1"
  local label="$2"
  {
    echo "=========================================="
    echo " COLLECTION – $label"
    echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=========================================="
    echo ""
  } >> "$output"
}

run_collect() {
  local key="$1"
  local label="${MODULE_LABELS[$key]}"
  local slug
  slug=$(echo "$label" | awk '{print tolower($1)}' | tr -cd 'a-z0-9')
  local output="$COLLECTIONS_DIR/collection-${slug}.txt"

  > "$output"
  write_header "$output" "$label"

  echo ""
  echo "=== Mengumpulkan: $label ==="

  if [[ "$key" == "0" ]]; then
    for k in $(seq 1 12); do
      collect_paths "$output" "${MODULE_PATHS[$k]}"
    done
  else
    collect_paths "$output" "${MODULE_PATHS[$key]}"
  fi

  echo ""
  echo "✅  Selesai!"
  echo "    Output      : $output"
  echo "    Total baris : $(wc -l < "$output")"
  echo "    Ukuran file : $(du -sh "$output" | cut -f1)"
}

# ── Menu ───────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              FIBIDY – FILE COLLECTOR                    ║"
echo "╠══════════════════════════════════════════════════════════╣"
for k in 1 2 3 4 5 6 7 8 9 10 11 12; do
  printf "║  [%2s] %s\n" "$k" "${MODULE_LABELS[$k]}"
done
echo "║                                                          ║"
printf "║  [%2s] %s\n" " 0" "${MODULE_LABELS[0]}"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
read -rp "Pilih modul [0-12]: " CHOICE

if [[ ! "$CHOICE" =~ ^([0-9]|1[0-2])$ ]]; then
  echo "❌  Pilihan tidak valid. Masukkan angka 0–12."
  exit 1
fi

run_collect "$CHOICE"