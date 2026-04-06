// ==========================================
// JSON-LD WRAPPER COMPONENTS
// ==========================================

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Single JSON-LD script tag
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}

interface MultiJsonLdProps {
  data: Record<string, unknown>[];
}

/**
 * Multiple JSON-LD script tags
 */
export function MultiJsonLd({ data }: MultiJsonLdProps) {
  return (
    <>
      {data.map((item, index) => (
        <JsonLd key={index} data={item} />
      ))}
    </>
  );
}