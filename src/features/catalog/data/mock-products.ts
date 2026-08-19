import {
  Product,
  Category,
  Brand,
  Collection,
  ShoeSize,
  ShoeColor,
  ProductVariant,
  ProductMedia,
} from '../types';

// Canonical Sizes (US Standard)
export const SIZES: Record<string, ShoeSize> = {
  '7': { id: 'sz-70', system: 'US', value: '7', label: 'US 7.0', sortOrder: 1 },
  '7.5': { id: 'sz-75', system: 'US', value: '7.5', label: 'US 7.5', sortOrder: 2 },
  '8': { id: 'sz-80', system: 'US', value: '8', label: 'US 8.0', sortOrder: 3 },
  '8.5': { id: 'sz-85', system: 'US', value: '8.5', label: 'US 8.5', sortOrder: 4 },
  '9': { id: 'sz-90', system: 'US', value: '9', label: 'US 9.0', sortOrder: 5 },
  '9.5': { id: 'sz-95', system: 'US', value: '9.5', label: 'US 9.5', sortOrder: 6 },
  '10': { id: 'sz-100', system: 'US', value: '10', label: 'US 10.0', sortOrder: 7 },
  '10.5': { id: 'sz-105', system: 'US', value: '10.5', label: 'US 10.5', sortOrder: 8 },
  '11': { id: 'sz-110', system: 'US', value: '11', label: 'US 11.0', sortOrder: 9 },
  '11.5': { id: 'sz-115', system: 'US', value: '11.5', label: 'US 11.5', sortOrder: 10 },
  '12': { id: 'sz-120', system: 'US', value: '12', label: 'US 12.0', sortOrder: 11 },
  '13': { id: 'sz-130', system: 'US', value: '13', label: 'US 13.0', sortOrder: 12 },
};

// Canonical Colors
export const COLORS: Record<string, ShoeColor> = {
  obsidian: { id: 'col-obs', name: 'Obsidian Black', hex: '#121214' },
  chalk: { id: 'col-chk', name: 'Chalk White', hex: '#F0EFEA' },
  gold: { id: 'col-gld', name: 'Saffron Gold', hex: '#C9A96E' },
  slate: { id: 'col-slt', name: 'Gunmetal Slate', hex: '#475569' },
  mocha: { id: 'col-mch', name: 'Bespoke Espresso', hex: '#3E2723' },
  emerald: { id: 'col-emr', name: 'Racing Forest', hex: '#1B4332' },
  crimson: { id: 'col-crm', name: 'Rosso Corsa', hex: '#9B111E' },
};

// Categories
export const CATEGORIES: Category[] = [
  {
    id: 'cat-running',
    name: 'Performance Running',
    slug: 'performance-running',
    description: 'Carbon-plated marathon racing and ultra-responsive daily training silhouettes.',
    status: 'ACTIVE',
  },
  {
    id: 'cat-lifestyle',
    name: 'Luxury Lifestyle',
    slug: 'luxury-lifestyle',
    description: 'Handcrafted Italian leather casual sneakers engineered for all-day posture.',
    status: 'ACTIVE',
  },
  {
    id: 'cat-court',
    name: 'Court & Tennis',
    slug: 'court-tennis',
    description: 'Lateral stabilization and reinforced herringbone outsole architecture.',
    status: 'ACTIVE',
  },
  {
    id: 'cat-boots',
    name: 'Heritage Boots',
    slug: 'heritage-boots',
    description: 'Goodyear welted Tuscan calfskin boots built for generational longevity.',
    status: 'ACTIVE',
  },
];

// Brands
export const BRANDS: Brand[] = [
  {
    id: 'br-labs',
    name: 'VELOCE LABS',
    slug: 'veloce-labs',
    description: 'Biomechanical performance research lab dedicated to speed and propulsion.',
  },
  {
    id: 'br-bespoke',
    name: 'VELOCE BESPOKE',
    slug: 'veloce-bespoke',
    description: 'Artisanal atelier handcrafted footwear utilizing prime full-grain hides.',
  },
  {
    id: 'br-corsa',
    name: 'VELOCE CORSA',
    slug: 'veloce-corsa',
    description: 'Motorsport-inspired aerodynamic footwear tuned for precision pedal response.',
  },
];

// Collections
export const COLLECTIONS: Collection[] = [
  {
    id: 'col-new',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'The latest drops combining aerodynamic geometry and heritage craftsmanship.',
  },
  {
    id: 'col-signature',
    name: 'Signature Series',
    slug: 'signature-series',
    description: 'Flagship footwear representing the pinnacle of Veloce engineering.',
  },
  {
    id: 'col-carbon',
    name: 'Carbon Propulsion',
    slug: 'carbon-propulsion',
    description: 'Rigid curved carbon fiber plates tuned for maximal energy return.',
  },
  {
    id: 'col-monochrome',
    name: 'Monochrome Luxe',
    slug: 'monochrome-luxe',
    description: 'Minimalist deep obsidian and pure chalk silhouettes with brushed gold hardware.',
  },
];

// Helper to generate variants for realistic shoe configurations
function generateVariants(
  productId: string,
  prefix: string,
  colors: ShoeColor[],
  sizes: ShoeSize[],
  priceMinor: number,
  compareAtPriceMinor?: number,
  excludedCombinations?: Array<{ colorId: string; sizeId: string }>
): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const excludedSet = new Set(
    (excludedCombinations || []).map((c) => `${c.colorId}-${c.sizeId}`)
  );

  for (const color of colors) {
    for (const size of sizes) {
      const key = `${color.id}-${size.id}`;
      if (excludedSet.has(key)) continue;

      const sizeStr = size.value.replace('.', '');
      const colorShort = color.name.substring(0, 3).toUpperCase();
      const sku = `VEL-${prefix}-${colorShort}-${sizeStr.padStart(3, '0')}`;

      variants.push({
        id: `var-${productId}-${color.id}-${size.id}`,
        productId,
        sku,
        size,
        color,
        priceMinor,
        compareAtPriceMinor,
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });
    }
  }

  return variants;
}

// 14 Curated Realistic Products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-apex-carbon',
    name: 'Veloce Apex Carbon 01',
    slug: 'veloce-apex-carbon-01',
    brand: BRANDS[0], // VELOCE LABS
    category: CATEGORIES[0], // Performance Running
    collections: [COLLECTIONS[0], COLLECTIONS[1], COLLECTIONS[2]],
    gender: 'UNISEX',
    shortDescription: 'Sub-2 hour marathon racer engineered with a 3D spoon-curved carbon chassis.',
    description:
      'The Apex Carbon 01 is the culmination of 48 months of biomechanical wind-tunnel testing. Featuring dual-density Pebax super-foam and an autoclaved full-length carbon fiber propulsion plate, every stride delivers up to 88% mechanical energy return. The ultra-breathable Matrix weave upper locks the midfoot while allowing natural forefoot splay across 42 kilometers.',
    material: 'Matrix Poly-Weave & Pebax Midsole with Autoclaved Carbon Plate',
    status: 'ACTIVE',
    badge: 'NEW',
    tags: ['marathon', 'carbon plate', 'racing', 'featherweight'],
    basePriceMinor: 28500, // $285.00
    baseCompareAtPriceMinor: 32000, // $320.00
    currency: 'USD',
    media: [
      {
        id: 'med-apex-1',
        productId: 'prod-apex-carbon',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Apex Carbon 01 primary side profile in Rosso Corsa and Obsidian',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-apex-2',
        productId: 'prod-apex-carbon',
        url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Apex Carbon 01 angle view highlighting carbon heel geometry',
        sortOrder: 2,
        role: 'SECONDARY',
      },
      {
        id: 'med-apex-3',
        productId: 'prod-apex-carbon',
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Apex Carbon 01 lifestyle runner dynamic action shot',
        sortOrder: 3,
        role: 'LIFESTYLE',
      },
      {
        id: 'med-apex-4',
        productId: 'prod-apex-carbon',
        url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Apex Carbon 01 sole traction pattern and exposed carbon plate',
        sortOrder: 4,
        role: 'SOLE',
      },
    ],
    variants: generateVariants(
      'prod-apex-carbon',
      'APX',
      [COLORS.crimson, COLORS.obsidian, COLORS.chalk],
      [
        SIZES['7.5'],
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['12'],
      ],
      28500,
      32000,
      [{ colorId: COLORS.crimson.id, sizeId: SIZES['12'].id }] // Example invalid combo for testing
    ),
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-02-01T12:00:00Z',
    seoTitle: 'Veloce Apex Carbon 01 — Elite Marathon Racing Shoe',
    seoDescription:
      'Engineered with dual-density Pebax superfoam and full-length carbon plate for maximal propulsion.',
  },

  {
    id: 'prod-aurora-monolith',
    name: 'Veloce Aurora Monolith',
    slug: 'veloce-aurora-monolith',
    brand: BRANDS[1], // VELOCE BESPOKE
    category: CATEGORIES[1], // Luxury Lifestyle
    collections: [COLLECTIONS[0], COLLECTIONS[1], COLLECTIONS[3]],
    gender: 'UNISEX',
    shortDescription: 'Full-grain Tuscan calfskin luxury sneaker with stitched cupsole construction.',
    description:
      'Handcrafted in Tuscany, the Aurora Monolith strips away excess ornamentation to focus on sculptural purity. Constructed with 1.8mm hand-selected calfskin leather, vegetable-tanned leather lining, and a natural Margom rubber cupsole, each pair molds intimately to your foot morphology over time.',
    material: 'Tuscan Full-Grain Calfskin & Natural Margom Rubber Sole',
    status: 'ACTIVE',
    badge: 'BEST SELLER',
    tags: ['lifestyle', 'handmade', 'tuscan leather', 'minimalist'],
    basePriceMinor: 34000, // $340.00
    currency: 'USD',
    media: [
      {
        id: 'med-aur-1',
        productId: 'prod-aurora-monolith',
        url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Aurora Monolith low profile side in Chalk White',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-aur-2',
        productId: 'prod-aurora-monolith',
        url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Aurora Monolith top leather grain and wax laces',
        sortOrder: 2,
        role: 'DETAIL',
      },
      {
        id: 'med-aur-3',
        productId: 'prod-aurora-monolith',
        url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Aurora Monolith styled with tailored trousers',
        sortOrder: 3,
        role: 'LIFESTYLE',
      },
    ],
    variants: generateVariants(
      'prod-aurora-monolith',
      'AUR',
      [COLORS.chalk, COLORS.obsidian, COLORS.mocha],
      [
        SIZES['7'],
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['12'],
        SIZES['13'],
      ],
      34000
    ),
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-05T14:30:00Z',
    seoTitle: 'Veloce Aurora Monolith — Handcrafted Tuscan Leather Sneaker',
    seoDescription:
      'Minimalist luxury sneakers built from full-grain Italian calfskin with Margom rubber soles.',
  },

  {
    id: 'prod-strata-court',
    name: 'Veloce Strata Court Pro',
    slug: 'veloce-strata-court-pro',
    brand: BRANDS[0], // VELOCE LABS
    category: CATEGORIES[2], // Court & Tennis
    collections: [COLLECTIONS[0]],
    gender: 'MEN',
    shortDescription: 'Reinforced lateral court shoe with multi-directional herringbone grip.',
    description:
      'The Strata Court Pro delivers unyielding lateral containment during explosive hardcourt transitions. Equipped with an external TPU torsional cage, reinforced toe drag guard, and responsive EVA foam, it withstands championship-level torque.',
    material: 'Ballistic Mesh, TPU Stabilizer Cage & High-Abrasion Rubber',
    status: 'ACTIVE',
    badge: 'NEW',
    tags: ['court', 'tennis', 'lateral support', 'durable'],
    basePriceMinor: 21000, // $210.00
    baseCompareAtPriceMinor: 24000, // $240.00
    currency: 'USD',
    media: [
      {
        id: 'med-str-1',
        productId: 'prod-strata-court',
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Strata Court Pro side view with TPU cage structure',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-str-2',
        productId: 'prod-strata-court',
        url: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Strata Court Pro herringbone sole detail',
        sortOrder: 2,
        role: 'SOLE',
      },
    ],
    variants: generateVariants(
      'prod-strata-court',
      'STR',
      [COLORS.slate, COLORS.chalk, COLORS.emerald],
      [
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['11.5'],
      ],
      21000,
      24000
    ),
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },

  {
    id: 'prod-vanguard-chelsea',
    name: 'Veloce Vanguard Chelsea Boot',
    slug: 'veloce-vanguard-chelsea-boot',
    brand: BRANDS[1], // VELOCE BESPOKE
    category: CATEGORIES[3], // Heritage Boots
    collections: [COLLECTIONS[1], COLLECTIONS[3]],
    gender: 'MEN',
    shortDescription: 'Goodyear welted Chelsea boot in waxed French pull-up leather with Dainite sole.',
    description:
      'The Vanguard Chelsea bridges rugged durability with bespoke British tailoring. Featuring storm-welt construction, double-elastic side gussets, pull tabs with gold foil branding, and studded British Dainite rubber outsoles for inclement weather traction.',
    material: 'French Waxed Pull-Up Leather & Goodyear Welted Dainite Sole',
    status: 'ACTIVE',
    badge: 'LIMITED',
    tags: ['boots', 'goodyear welt', 'chelsea', 'weatherproof'],
    basePriceMinor: 42000, // $420.00
    currency: 'USD',
    media: [
      {
        id: 'med-van-1',
        productId: 'prod-vanguard-chelsea',
        url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Vanguard Chelsea Boot in Espresso Pull-up leather',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-van-2',
        productId: 'prod-vanguard-chelsea',
        url: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Vanguard Chelsea Boot detail stitching and elastic gusset',
        sortOrder: 2,
        role: 'DETAIL',
      },
    ],
    variants: generateVariants(
      'prod-vanguard-chelsea',
      'VAN',
      [COLORS.mocha, COLORS.obsidian],
      [
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['12'],
      ],
      42000
    ),
    createdAt: '2026-01-05T12:00:00Z',
    updatedAt: '2026-02-12T16:00:00Z',
  },

  {
    id: 'prod-phantom-corsa',
    name: 'Veloce Phantom Corsa GT',
    slug: 'veloce-phantom-corsa-gt',
    brand: BRANDS[2], // VELOCE CORSA
    category: CATEGORIES[1], // Luxury Lifestyle
    collections: [COLLECTIONS[0], COLLECTIONS[1]],
    gender: 'UNISEX',
    shortDescription: 'Aerodynamic driving shoe featuring carbon heel wrap and wrapped heel pedal cup.',
    description:
      'Born from endurance grand touring paddock data. The Phantom Corsa GT hugs the heel with a wrapped curved cup, while the ultra-thin nitrile outsole ensures millimeter-precise throttle and brake pedal modulation.',
    material: 'Perforated Nappa Leather, Kevlar Stitching & Nitrile Driver Sole',
    status: 'ACTIVE',
    badge: 'LIMITED',
    tags: ['motorsport', 'driving shoe', 'nappa leather', 'lightweight'],
    basePriceMinor: 29500, // $295.00
    currency: 'USD',
    media: [
      {
        id: 'med-pht-1',
        productId: 'prod-phantom-corsa',
        url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Phantom Corsa GT streamlined silhouette',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-pht-2',
        productId: 'prod-phantom-corsa',
        url: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Phantom Corsa GT heel cup detail',
        sortOrder: 2,
        role: 'DETAIL',
      },
    ],
    variants: generateVariants(
      'prod-phantom-corsa',
      'PHT',
      [COLORS.obsidian, COLORS.crimson],
      [
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
      ],
      29500
    ),
    createdAt: '2026-01-18T14:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },

  {
    id: 'prod-horizon-knit',
    name: 'Veloce Horizon Knit Trainer',
    slug: 'veloce-horizon-knit-trainer',
    brand: BRANDS[0], // VELOCE LABS
    category: CATEGORIES[0], // Performance Running
    collections: [COLLECTIONS[0]],
    gender: 'WOMEN',
    shortDescription: 'Seamless zoned engineered knit trainer with nitrogen-infused foam midsole.',
    description:
      'Seamless support engineered specifically around female biomechanical foot dynamics. The Horizon Knit upper eliminates hot spots, whilst our nitrogen-infused supercritical foam absorbs impact seamlessly on daily tempo runs.',
    material: 'Zoned Fly-Knit & Nitrogen-Infused Foam Midsole',
    status: 'ACTIVE',
    tags: ['cushioning', 'knit', 'tempo running', 'women'],
    basePriceMinor: 19500, // $195.00
    currency: 'USD',
    media: [
      {
        id: 'med-hrz-1',
        productId: 'prod-horizon-knit',
        url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Horizon Knit Trainer floating perspective in Gunmetal Slate',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-hrz-2',
        productId: 'prod-horizon-knit',
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Horizon Knit Trainer upper mesh close-up',
        sortOrder: 2,
        role: 'DETAIL',
      },
    ],
    variants: generateVariants(
      'prod-horizon-knit',
      'HRZ',
      [COLORS.chalk, COLORS.slate, COLORS.emerald],
      [
        SIZES['7'],
        SIZES['7.5'],
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
      ],
      19500
    ),
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },

  {
    id: 'prod-aero-glide',
    name: 'Veloce Aero Glide Pro',
    slug: 'veloce-aero-glide-pro',
    brand: BRANDS[0], // VELOCE LABS
    category: CATEGORIES[0], // Performance Running
    collections: [COLLECTIONS[1], COLLECTIONS[2]],
    gender: 'MEN',
    shortDescription: 'Maximal cushion high-mileage road shoe with rocker geometry.',
    description:
      'Engineered for 30+ km Sunday long runs. Features a 38mm heel stack of ultra-lightweight foam combined with a rocker transition zone to reduce calf muscle fatigue by 14%.',
    material: 'Engineered Monomesh & Max Stack Superfoam',
    status: 'ACTIVE',
    badge: 'SALE',
    tags: ['max cushion', 'rocker sole', 'marathon training', 'road'],
    basePriceMinor: 22000, // $220.00
    baseCompareAtPriceMinor: 26000, // $260.00
    currency: 'USD',
    media: [
      {
        id: 'med-aero-1',
        productId: 'prod-aero-glide',
        url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Aero Glide Pro side profile with high stack foam',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-aero-2',
        productId: 'prod-aero-glide',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Aero Glide Pro secondary image',
        sortOrder: 2,
        role: 'SECONDARY',
      },
    ],
    variants: generateVariants(
      'prod-aero-glide',
      'GLD',
      [COLORS.obsidian, COLORS.slate, COLORS.chalk],
      [
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['12'],
      ],
      22000,
      26000
    ),
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-02-16T12:00:00Z',
  },

  {
    id: 'prod-sovereign-oxford',
    name: 'Veloce Sovereign Cap-Toe Derby',
    slug: 'veloce-sovereign-cap-toe-derby',
    brand: BRANDS[1], // VELOCE BESPOKE
    category: CATEGORIES[3], // Heritage Boots
    collections: [COLLECTIONS[1], COLLECTIONS[3]],
    gender: 'MEN',
    shortDescription: 'Formal hand-burnished box calf leather Derby with oak bark tanned leather soles.',
    description:
      'The Sovereign represents the peak of formal shoe making. Hand-lasted in Northamptonshire over 8 weeks, featuring bevelled waists, brass eyelets, and channelled oak bark soles with metal toe taps.',
    material: 'Hand-Burnished Box Calf & Oak Bark Tanned Sole',
    status: 'ACTIVE',
    badge: 'LIMITED',
    tags: ['formal', 'derby', 'handcrafted', 'oxford'],
    basePriceMinor: 48000, // $480.00
    currency: 'USD',
    media: [
      {
        id: 'med-sov-1',
        productId: 'prod-sovereign-oxford',
        url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Sovereign Cap-Toe Derby in hand burnished Obsidian',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-sov-2',
        productId: 'prod-sovereign-oxford',
        url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Sovereign Cap-Toe Derby side stitching detail',
        sortOrder: 2,
        role: 'DETAIL',
      },
    ],
    variants: generateVariants(
      'prod-sovereign-oxford',
      'SOV',
      [COLORS.obsidian, COLORS.mocha],
      [
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['12'],
      ],
      48000
    ),
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },

  {
    id: 'prod-zenith-trail',
    name: 'Veloce Zenith Carbon Trail',
    slug: 'veloce-zenith-carbon-trail',
    brand: BRANDS[0], // VELOCE LABS
    category: CATEGORIES[0], // Performance Running
    collections: [COLLECTIONS[0], COLLECTIONS[2]],
    gender: 'UNISEX',
    shortDescription: 'All-terrain ultra trail shoe with split-toe carbon rockplate and Vibram Megagrip.',
    description:
      'Conquer technical ridge lines with confidence. The split-toe articulated carbon plate delivers torsional adaptation over boulder fields while 5mm Vibram Megagrip traction lugs bite into wet clay and loose scree.',
    material: 'Ripstop Cordura, Articulated Carbon Plate & Vibram Megagrip',
    status: 'ACTIVE',
    badge: 'NEW',
    tags: ['trail', 'vibram', 'ultra running', 'all-weather'],
    basePriceMinor: 26000, // $260.00
    currency: 'USD',
    media: [
      {
        id: 'med-zen-1',
        productId: 'prod-zenith-trail',
        url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Zenith Carbon Trail shoe rugged side angle in Forest Emerald',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-zen-2',
        productId: 'prod-zenith-trail',
        url: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Zenith Carbon Trail Vibram lug pattern',
        sortOrder: 2,
        role: 'SOLE',
      },
    ],
    variants: generateVariants(
      'prod-zenith-trail',
      'ZEN',
      [COLORS.emerald, COLORS.slate, COLORS.obsidian],
      [
        SIZES['7.5'],
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['12'],
      ],
      26000
    ),
    createdAt: '2026-01-28T15:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
  },

  {
    id: 'prod-eclipse-mule',
    name: 'Veloce Eclipse Slip Mule',
    slug: 'veloce-eclipse-slip-mule',
    brand: BRANDS[1], // VELOCE BESPOKE
    category: CATEGORIES[1], // Luxury Lifestyle
    collections: [COLLECTIONS[3]],
    gender: 'UNISEX',
    shortDescription: 'Molded cork and butter-soft suede slip-on mule with gold buckle buckle detail.',
    description:
      'Effortless architectural relaxation. Molded ergonomic cork footbed lined with plush shearling, wrapped in weatherproof suede with brushed solid brass hardware.',
    material: 'Tuscan Suede, Natural Cork Footbed & Solid Brass Buckle',
    status: 'ACTIVE',
    tags: ['mule', 'suede', 'slip on', 'lounge'],
    basePriceMinor: 21500, // $215.00
    currency: 'USD',
    media: [
      {
        id: 'med-ecl-1',
        productId: 'prod-eclipse-mule',
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Eclipse Slip Mule in warm Suede',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-ecl-2',
        productId: 'prod-eclipse-mule',
        url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Eclipse Slip Mule top detail',
        sortOrder: 2,
        role: 'DETAIL',
      },
    ],
    variants: generateVariants(
      'prod-eclipse-mule',
      'ECL',
      [COLORS.mocha, COLORS.chalk, COLORS.obsidian],
      [
        SIZES['7'],
        SIZES['8'],
        SIZES['9'],
        SIZES['10'],
        SIZES['11'],
        SIZES['12'],
      ],
      21500
    ),
    createdAt: '2026-02-02T13:00:00Z',
    updatedAt: '2026-02-18T11:00:00Z',
  },

  {
    id: 'prod-matrix-high',
    name: 'Veloce Matrix High Altitude',
    slug: 'veloce-matrix-high-altitude',
    brand: BRANDS[0], // VELOCE LABS
    category: CATEGORIES[2], // Court & Tennis
    collections: [COLLECTIONS[1]],
    gender: 'MEN',
    shortDescription: 'High-top court sneaker featuring an inflatable ankle airlock chamber.',
    description:
      'Elevated vertical leap and lock-down. The Matrix High features a micro-valved internal air bladder around the malleolus collar for bespoke ankle stability during high-impact rim play.',
    material: 'Composite Synthetic Leather & Pneumatic Airlock Collar',
    status: 'ACTIVE',
    badge: 'BEST SELLER',
    tags: ['high-top', 'basketball', 'airlock', 'court'],
    basePriceMinor: 27500, // $275.00
    baseCompareAtPriceMinor: 31000, // $310.00
    currency: 'USD',
    media: [
      {
        id: 'med-mat-1',
        productId: 'prod-matrix-high',
        url: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Matrix High Altitude profile in Obsidian and Gold accents',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-mat-2',
        productId: 'prod-matrix-high',
        url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Matrix High Altitude angle view',
        sortOrder: 2,
        role: 'SECONDARY',
      },
    ],
    variants: generateVariants(
      'prod-matrix-high',
      'MAT',
      [COLORS.obsidian, COLORS.chalk],
      [
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
        SIZES['11.5'],
        SIZES['12'],
        SIZES['13'],
      ],
      27500,
      31000
    ),
    createdAt: '2026-02-05T12:00:00Z',
    updatedAt: '2026-02-19T08:00:00Z',
  },

  {
    id: 'prod-corsa-sprint',
    name: 'Veloce Corsa Sprint Track',
    slug: 'veloce-corsa-sprint-track',
    brand: BRANDS[2], // VELOCE CORSA
    category: CATEGORIES[0], // Performance Running
    collections: [COLLECTIONS[2]],
    gender: 'UNISEX',
    shortDescription: 'Ultra-minimalist 100m–400m sprint spike with 6-pin titanium plate.',
    description:
      'Clocking in at only 122 grams. Built with a full-length high-modulus carbon baseplate embedded with 6 replaceable titanium spikes for maximum explosive power transfer off the starting blocks.',
    material: 'Aerotex Synthetic Filament & 6-Pin Titanium Spikes Plate',
    status: 'ACTIVE',
    badge: 'LIMITED',
    tags: ['sprint', 'track and field', 'spikes', 'ultra light'],
    basePriceMinor: 24000, // $240.00
    currency: 'USD',
    media: [
      {
        id: 'med-cr-1',
        productId: 'prod-corsa-sprint',
        url: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Corsa Sprint Track spikes in Rosso Corsa',
        sortOrder: 1,
        role: 'PRIMARY',
      },
      {
        id: 'med-cr-2',
        productId: 'prod-corsa-sprint',
        url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=85',
        altText: 'Veloce Corsa Sprint Track top aerodynamic filament',
        sortOrder: 2,
        role: 'SECONDARY',
      },
    ],
    variants: generateVariants(
      'prod-corsa-sprint',
      'SPR',
      [COLORS.crimson, COLORS.obsidian],
      [
        SIZES['7.5'],
        SIZES['8'],
        SIZES['8.5'],
        SIZES['9'],
        SIZES['9.5'],
        SIZES['10'],
        SIZES['10.5'],
        SIZES['11'],
      ],
      24000
    ),
    createdAt: '2026-02-08T11:00:00Z',
    updatedAt: '2026-02-19T09:00:00Z',
  },
];
