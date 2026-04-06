// ==========================================
// CATEGORY TYPES
// ==========================================

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  group: string;
}

interface CategoryGroup {
  key: string;
  label: string;
}

// ==========================================
// 7 CATEGORY GROUPS
// ==========================================

const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  FOOD_DRINK: { key: 'FOOD_DRINK', label: 'Food & Drink' },
  HEALTH_BEAUTY: { key: 'HEALTH_BEAUTY', label: 'Health & Beauty' },
  RETAIL: { key: 'RETAIL', label: 'Retail' },
  HOME_SERVICES: { key: 'HOME_SERVICES', label: 'Home Services' },
  AUTOMOTIVE: { key: 'AUTOMOTIVE', label: 'Automotive' },
  LIFESTYLE_ENTERTAINMENT: { key: 'LIFESTYLE_ENTERTAINMENT', label: 'Lifestyle & Entertainment' },
  PROFESSIONAL_SERVICES: { key: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
};

// ==========================================
// CATEGORIES
// ==========================================

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {

  // ── FOOD & DRINK ──────────────────────────────────────────────
  RESTAURANT: { key: 'RESTAURANT', label: 'Restaurant', description: 'Dine-in restaurant or food hall', group: 'FOOD_DRINK' },
  CAFE: { key: 'CAFE', label: 'Cafe & Coffee Shop', description: 'Coffee shop, cafe, or tea house', group: 'FOOD_DRINK' },
  BAKERY: { key: 'BAKERY', label: 'Bakery', description: 'Bread, pastries, and baked goods', group: 'FOOD_DRINK' },
  FOOD_DELIVERY: { key: 'FOOD_DELIVERY', label: 'Food Delivery', description: 'Online food ordering and delivery', group: 'FOOD_DRINK' },
  CATERING: { key: 'CATERING', label: 'Catering', description: 'Event catering and meal packages', group: 'FOOD_DRINK' },
  STREET_FOOD: { key: 'STREET_FOOD', label: 'Street Food & Snacks', description: 'Street food stall, food cart, or snack shop', group: 'FOOD_DRINK' },

  // ── HEALTH & BEAUTY ───────────────────────────────────────────
  HAIR_SALON: { key: 'HAIR_SALON', label: 'Hair Salon', description: 'Hair styling, coloring, and treatment', group: 'HEALTH_BEAUTY' },
  BARBERSHOP: { key: 'BARBERSHOP', label: 'Barbershop', description: "Men's haircut and grooming", group: 'HEALTH_BEAUTY' },
  NAIL_SALON: { key: 'NAIL_SALON', label: 'Nail Salon', description: 'Nail art, manicure, and pedicure', group: 'HEALTH_BEAUTY' },
  SPA_MASSAGE: { key: 'SPA_MASSAGE', label: 'Spa & Massage', description: 'Spa treatments, massage, and relaxation', group: 'HEALTH_BEAUTY' },
  SKINCARE_CLINIC: { key: 'SKINCARE_CLINIC', label: 'Skincare Clinic', description: 'Facial treatments, skincare, and aesthetics', group: 'HEALTH_BEAUTY' },
  PHARMACY: { key: 'PHARMACY', label: 'Pharmacy', description: 'Medicine, vitamins, and health products', group: 'HEALTH_BEAUTY' },
  GYM_FITNESS: { key: 'GYM_FITNESS', label: 'Gym & Fitness', description: 'Gym, fitness center, or yoga studio', group: 'HEALTH_BEAUTY' },

  // ── RETAIL ────────────────────────────────────────────────────
  FASHION_APPAREL: { key: 'FASHION_APPAREL', label: 'Fashion & Apparel', description: 'Clothing, accessories, and fashion items', group: 'RETAIL' },
  FOOTWEAR: { key: 'FOOTWEAR', label: 'Footwear', description: 'Shoes, sandals, and boots', group: 'RETAIL' },
  ELECTRONICS_GADGETS: { key: 'ELECTRONICS_GADGETS', label: 'Electronics & Gadgets', description: 'Phones, gadgets, and accessories', group: 'RETAIL' },
  GROCERY_CONVENIENCE: { key: 'GROCERY_CONVENIENCE', label: 'Grocery & Convenience', description: 'Grocery store, minimarket, or convenience shop', group: 'RETAIL' },
  BEAUTY_COSMETICS: { key: 'BEAUTY_COSMETICS', label: 'Beauty & Cosmetics', description: 'Makeup, skincare products, and cosmetics', group: 'RETAIL' },
  HOME_LIVING: { key: 'HOME_LIVING', label: 'Home & Living', description: 'Furniture, home decor, and household items', group: 'RETAIL' },

  // ── HOME SERVICES ─────────────────────────────────────────────
  CLEANING_SERVICE: { key: 'CLEANING_SERVICE', label: 'Cleaning Service', description: 'Home and office cleaning', group: 'HOME_SERVICES' },
  PLUMBING: { key: 'PLUMBING', label: 'Plumbing', description: 'Pipe repair, installation, and water systems', group: 'HOME_SERVICES' },
  ELECTRICAL: { key: 'ELECTRICAL', label: 'Electrical', description: 'Electrical installation and repair', group: 'HOME_SERVICES' },
  AC_APPLIANCE_REPAIR: { key: 'AC_APPLIANCE_REPAIR', label: 'AC & Appliance Repair', description: 'AC servicing and home appliance repair', group: 'HOME_SERVICES' },
  LANDSCAPING: { key: 'LANDSCAPING', label: 'Landscaping & Gardening', description: 'Garden design, lawn care, and plants', group: 'HOME_SERVICES' },
  MOVING_SERVICE: { key: 'MOVING_SERVICE', label: 'Moving Service', description: 'Furniture moving and relocation', group: 'HOME_SERVICES' },
  INTERIOR_DESIGN: { key: 'INTERIOR_DESIGN', label: 'Interior Design', description: 'Interior design and renovation consulting', group: 'HOME_SERVICES' },

  // ── AUTOMOTIVE ────────────────────────────────────────────────
  CAR_REPAIR: { key: 'CAR_REPAIR', label: 'Car Repair', description: 'Car service, repair, and maintenance', group: 'AUTOMOTIVE' },
  MOTORCYCLE_REPAIR: { key: 'MOTORCYCLE_REPAIR', label: 'Motorcycle Repair', description: 'Motorcycle service and repair', group: 'AUTOMOTIVE' },
  CAR_WASH: { key: 'CAR_WASH', label: 'Car Wash & Detailing', description: 'Car wash, detailing, and coating', group: 'AUTOMOTIVE' },
  AUTO_PARTS: { key: 'AUTO_PARTS', label: 'Auto Parts & Accessories', description: 'Car and motorcycle parts, accessories', group: 'AUTOMOTIVE' },

  // ── LIFESTYLE & ENTERTAINMENT ─────────────────────────────────
  TRAVEL_AGENCY: { key: 'TRAVEL_AGENCY', label: 'Travel Agency', description: 'Tour packages and travel booking', group: 'LIFESTYLE_ENTERTAINMENT' },
  HOTEL_LODGING: { key: 'HOTEL_LODGING', label: 'Hotel & Lodging', description: 'Hotel, guesthouse, and accommodation', group: 'LIFESTYLE_ENTERTAINMENT' },
  PHOTOGRAPHY: { key: 'PHOTOGRAPHY', label: 'Photography & Videography', description: 'Photo and video for events, products, portraits', group: 'LIFESTYLE_ENTERTAINMENT' },
  EVENT_VENUE: { key: 'EVENT_VENUE', label: 'Event Venue', description: 'Venue rental for weddings and events', group: 'LIFESTYLE_ENTERTAINMENT' },
  TUTORING_EDUCATION: { key: 'TUTORING_EDUCATION', label: 'Tutoring & Education', description: 'Private tutoring, courses, and classes', group: 'LIFESTYLE_ENTERTAINMENT' },

  // ── PROFESSIONAL SERVICES ─────────────────────────────────────
  LAUNDRY: { key: 'LAUNDRY', label: 'Laundry', description: 'Laundry, dry cleaning, and ironing', group: 'PROFESSIONAL_SERVICES' },
  TAILOR: { key: 'TAILOR', label: 'Tailor & Alterations', description: 'Custom clothing and garment alterations', group: 'PROFESSIONAL_SERVICES' },
  PET_SHOP: { key: 'PET_SHOP', label: 'Pet Shop', description: 'Pet food, supplies, and accessories', group: 'PROFESSIONAL_SERVICES' },
  PET_GROOMING: { key: 'PET_GROOMING', label: 'Pet Grooming', description: 'Pet bathing, grooming, and care', group: 'PROFESSIONAL_SERVICES' },
  PRINT_SHOP: { key: 'PRINT_SHOP', label: 'Print Shop', description: 'Printing, copying, and design services', group: 'PROFESSIONAL_SERVICES' },
  RENTAL_PROPERTY: { key: 'RENTAL_PROPERTY', label: 'Rental Property', description: 'Room, house, or property rental', group: 'PROFESSIONAL_SERVICES' },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getCategoryConfig(category: string): CategoryConfig | null {
  return CATEGORY_CONFIG[category] || null;
}

export function getCategoryList(): CategoryConfig[] {
  return Object.values(CATEGORY_CONFIG);
}

export function getCategoriesByGroup(groupKey: string): CategoryConfig[] {
  return Object.values(CATEGORY_CONFIG).filter((cat) => cat.group === groupKey);
}

export function getCategoryGroupList(): CategoryGroup[] {
  return Object.values(CATEGORY_GROUPS);
}