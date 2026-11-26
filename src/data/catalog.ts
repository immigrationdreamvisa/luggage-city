export const IMAGES = {
  heroEditorial: '/src/assets/images/hero_luggage_editorial_1795670059063.jpg',
  carryOn: '/src/assets/images/cat_carryon_luggage_1795670058931.jpg',
  checkedLuggage: '/src/assets/images/cat_checked_luggage_1795670058111.jpg',
  luggageSets: '/src/assets/images/cat_luggage_sets_1795670058417.jpg',
  backpacks: '/src/assets/images/cat_backpacks_1795670059064.jpg',
  handbags: '/src/assets/images/cat_handbags_1795670061001.jpg',
  accessories: '/src/assets/images/cat_accessories_1795670058866.jpg',
  repairWorkshop: '/src/assets/images/banner_repair_workshop_1795670058866.jpg',
  careersHero: '/src/assets/images/careers_team_hero_1795670059977.jpg',
  careersRetail: '/src/assets/images/careers_culture_retail_1795670060468.jpg',
} as const;

export type ProductCategory =
  | 'Carry-On Luggage'
  | 'Checked Luggage'
  | 'Luggage Sets'
  | 'Backpacks'
  | 'Handbags'
  | 'Travel Accessories';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  parentGroup: 'luggage' | 'backpacks' | 'handbags' | 'accessories';
  priceCad: number;
  compareAtCad?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockNote: string;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isOnSale?: boolean;
  shortDescription: string;
  description: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  specs: {
    dimensions: string;
    weight: string;
    capacity: string;
    material: string;
    wheelsOrStrap: string;
    lock: string;
    warranty: string;
  };
}

export interface BrandInfo {
  name: string;
  slug: string;
  origin: string;
  specialty: string;
  warrantyHighlight: string;
  description: string;
  authorizedRepair: boolean;
}

export const BRANDS: BrandInfo[] = [
  {
    name: 'Briggs & Riley',
    slug: 'briggs-and-riley',
    origin: 'New York, USA',
    specialty: 'Ballistic Nylon Business & Lifetime Luggage',
    warrantyHighlight: 'Simple as That® Lifetime Guarantee',
    description:
      'Engineered with Outsider® handles and CX® expansion-compression systems. Backed by an unconditional lifetime functional repair guarantee serviced at Luggage City.',
    authorizedRepair: true,
  },
  {
    name: 'Samsonite',
    slug: 'samsonite',
    origin: 'Founded 1910',
    specialty: 'Polycarbonate Hardside & Softside Spinners',
    warrantyHighlight: '10-Year Limited Global Warranty',
    description:
      'Over a century of luggage innovation blending featherweight shells, precision double-spinner wheels, and dependable interior organization for global travel.',
    authorizedRepair: true,
  },
  {
    name: 'Verage',
    slug: 'verage',
    origin: 'Manchester, UK',
    specialty: 'Ultra-Lightweight Everyday & Family Luggage',
    warrantyHighlight: '3–5 Year Manufacturer Warranty',
    description:
      'Thoughtfully engineered lightweight spinners and nested travel sets designed for effortless maneuverability and strong everyday Canadian value.',
    authorizedRepair: true,
  },
  {
    name: 'American Tourister',
    slug: 'american-tourister',
    origin: 'Founded 1933',
    specialty: 'Durable Hardside & Leisure Travel Collections',
    warrantyHighlight: '10-Year Limited Warranty',
    description:
      'Impact-tested polypropylene and ABS travel pieces offering generous packing capacity, recessed TSA locks, and expressive modern finishes.',
    authorizedRepair: true,
  },
  {
    name: 'Pacsafe',
    slug: 'pacsafe',
    origin: 'Founded 1998',
    specialty: 'Anti-Theft Backpacks, Slings & Security Bags',
    warrantyHighlight: '5-Year Anti-Theft Gear Warranty',
    description:
      'Built with eXomesh® slashguards, Roobar™ locking zippers, Carrysafe® steel-wire straps, and RFIDsafe™ pockets for confident international exploration.',
    authorizedRepair: false,
  },
  {
    name: 'Travelpro',
    slug: 'travelpro',
    origin: 'Created by Pilots',
    specialty: 'Airline Crew-Grade Softside & Carry-On Gear',
    warrantyHighlight: 'Limited Lifetime Coverage',
    description:
      'Trusted by flight crews worldwide for self-aligning MagnaTrac® wheels, PowerScope extension handles, and water-repellent DuraGuard® coatings.',
    authorizedRepair: true,
  },
  {
    name: 'JanSport',
    slug: 'jansport',
    origin: 'Seattle, USA',
    specialty: 'Iconic Campus, Commuter & Daypack Backpacks',
    warrantyHighlight: 'Lifetime Warranty',
    description:
      'Enduring everyday packs crafted from recycled 600D polyester with ergonomic padded straps, laptop sleeves, and straightforward utility.',
    authorizedRepair: false,
  },
  {
    name: 'Secrid',
    slug: 'secrid',
    origin: 'Netherlands',
    specialty: 'Aluminum Cardprotectors & Leather RFID Wallets',
    warrantyHighlight: 'Up to 3-Year Registered Warranty',
    description:
      'Compact Dutch-crafted aluminum Cardprotectors wrapped in European leathers, protecting payment cards against bending, breaking, and unauthorized wireless skimming.',
    authorizedRepair: false,
  },
  {
    name: 'Heys',
    slug: 'heys',
    origin: 'Toronto, Canada',
    specialty: 'Canadian-Designed Lightweight Hardside Luggage',
    warrantyHighlight: '5-Year Prestige Class Warranty',
    description:
      'Designed in Toronto with 100% polycarbonate composite shells, colour-matched hardware, and smooth 360-degree dual spinner wheels.',
    authorizedRepair: false,
  },
];

export const FEATURED_CATEGORIES: Array<{
  title: ProductCategory;
  route: string;
  subtitle: string;
  image: string;
}> = [
  {
    title: 'Carry-On Luggage',
    route: '/luggage?category=Carry-On+Luggage',
    subtitle: 'Cabin-approved spinners built for Canadian & international airlines',
    image: IMAGES.carryOn,
  },
  {
    title: 'Checked Luggage',
    route: '/luggage?category=Checked+Luggage',
    subtitle: 'Expandable medium & large suitcases for extended journeys',
    image: IMAGES.checkedLuggage,
  },
  {
    title: 'Luggage Sets',
    route: '/luggage?category=Luggage+Sets',
    subtitle: 'Coordinated 2-piece and 3-piece collections at set savings',
    image: IMAGES.luggageSets,
  },
  {
    title: 'Backpacks',
    route: '/backpacks',
    subtitle: 'Anti-theft travel packs, business laptop bags & everyday classics',
    image: IMAGES.backpacks,
  },
  {
    title: 'Handbags',
    route: '/handbags',
    subtitle: 'Structured travel totes, crossbodies & RFID everyday silhouettes',
    image: IMAGES.handbags,
  },
  {
    title: 'Travel Accessories',
    route: '/travel-accessories',
    subtitle: 'Secrid wallets, TSA locks, packing cubes & passport organizers',
    image: IMAGES.accessories,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'br-baseline-22',
    slug: 'briggs-riley-baseline-essential-22-carry-on-spinner',
    sku: 'BR-U122CXSP-4',
    name: 'Baseline Essential 22" Carry-On Spinner',
    brand: 'Briggs & Riley',
    category: 'Carry-On Luggage',
    parentGroup: 'luggage',
    priceCad: 935,
    rating: 4.9,
    reviewCount: 142,
    inStock: true,
    stockNote: 'In stock — Ready to ship from Woodbridge, ON',
    isBestSeller: true,
    isTrending: true,
    shortDescription:
      'Patented CX® one-touch expansion and Outsider® handle for flat, wrinkle-free packing.',
    description:
      'The benchmark carry-on for frequent flyers. Constructed from proprietary ballistic nylon that resists wear, moisture, dirt, and abrasion, the Baseline Essential 22" expands up to 25% for additional capacity and compresses cleanly back to airline carry-on dimensions.',
    images: [IMAGES.checkedLuggage, IMAGES.carryOn, IMAGES.heroEditorial],
    colors: [
      { name: 'Midnight Navy', hex: '#14233C' },
      { name: 'Obsidian Black', hex: '#1A1C20' },
      { name: 'Olive Slate', hex: '#4B5247' },
    ],
    sizes: ['22" Carry-On'],
    specs: {
      dimensions: '55.9 x 35.6 x 22.9 cm (22" x 14" x 9")',
      weight: '4.5 kg (9.9 lbs)',
      capacity: '40.4 L – 51 L (CX® Expanded)',
      material: 'Proprietary Ballistic Nylon',
      wheelsOrStrap: 'Shock-absorbing 360° dual spinner wheels',
      lock: 'Integrated TSA-friendly combination lock',
      warranty: 'Simple as That® Lifetime Guarantee (Serviced at Luggage City)',
    },
  },
  {
    id: 'sam-freeform-21',
    slug: 'samsonite-freeform-21-hardside-carry-on-spinner',
    sku: 'SAM-78255-NVY',
    name: 'Freeform 21" Hardside Carry-On Spinner',
    brand: 'Samsonite',
    category: 'Carry-On Luggage',
    parentGroup: 'luggage',
    priceCad: 259,
    compareAtCad: 310,
    rating: 4.8,
    reviewCount: 218,
    inStock: true,
    stockNote: 'In stock — Ships within 24 hours',
    isBestSeller: true,
    isTrending: true,
    isOnSale: true,
    shortDescription:
      'Ultra-light polypropylene shell with recessed TSA lock and smooth double spinner wheels.',
    description:
      'Engineered to bring more strength with less weight, the Samsonite Freeform 21" pairs a resilient scratch-resistant shell with maximized packing volume, cross ribbons, a zippered divider, and an integrated multi-stage aluminum pull handle.',
    images: [IMAGES.carryOn, IMAGES.luggageSets, IMAGES.heroEditorial],
    colors: [
      { name: 'Midnight Navy', hex: '#1B2D4B' },
      { name: 'Champagne Pearl', hex: '#D8CDBB' },
      { name: 'Graphite Black', hex: '#23262B' },
    ],
    sizes: ['21" Carry-On'],
    specs: {
      dimensions: '54.0 x 38.7 x 24.9 cm (21.25" x 15.25" x 9.8")',
      weight: '2.9 kg (6.5 lbs)',
      capacity: '45 L (Expandable)',
      material: '100% Polypropylene Hardside',
      wheelsOrStrap: 'Dual 360° silent-glide spinner wheels',
      lock: 'Recessed 3-dial TSA combination lock',
      warranty: '10-Year Limited Global Warranty',
    },
  },
  {
    id: 'br-baseline-med',
    slug: 'briggs-riley-baseline-medium-expandable-spinner',
    sku: 'BR-U125CXSP-4',
    name: 'Baseline Medium 25" Expandable Spinner',
    brand: 'Briggs & Riley',
    category: 'Checked Luggage',
    parentGroup: 'luggage',
    priceCad: 1125,
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    stockNote: 'In stock — Ships free across Canada',
    isBestSeller: true,
    shortDescription:
      'Built-in tri-fold garment folder and CX® compression system for week-long business or leisure itineraries.',
    description:
      'Designed for 5-to-10-day journeys, the Baseline Medium Expandable Spinner combines a flat interior packing surface with reinforced corner guards, self-repairing YKK® RC zippers, and a smart speed-thru pocket for quick checkpoint access.',
    images: [IMAGES.checkedLuggage, IMAGES.heroEditorial, IMAGES.carryOn],
    colors: [
      { name: 'Charcoal Black', hex: '#26282C' },
      { name: 'Deep Navy', hex: '#13223A' },
    ],
    sizes: ['25" Medium Checked'],
    specs: {
      dimensions: '63.5 x 45.7 x 27.9 cm (25" x 18" x 11")',
      weight: '5.5 kg (12.1 lbs)',
      capacity: '71 L – 88 L (CX® Expanded)',
      material: 'Ballistic Nylon with Leather Touchpoints',
      wheelsOrStrap: 'High-grade steel-bearing spinner wheels',
      lock: 'Integrated TSA combination lock',
      warranty: 'Simple as That® Lifetime Guarantee',
    },
  },
  {
    id: 'sam-freeform-set-2pc',
    slug: 'samsonite-freeform-2-piece-hardside-luggage-set',
    sku: 'SAM-78255-SET2',
    name: 'Freeform 2-Piece Hardside Luggage Set (21" + 28")',
    brand: 'Samsonite',
    category: 'Luggage Sets',
    parentGroup: 'luggage',
    priceCad: 549,
    compareAtCad: 680,
    rating: 4.8,
    reviewCount: 164,
    inStock: true,
    stockNote: 'In stock — Popular travel set',
    isBestSeller: true,
    isTrending: true,
    isOnSale: true,
    shortDescription:
      'Matched 21" carry-on and 28" large checked spinner that nest seamlessly for home storage.',
    description:
      'Elevate every itinerary from weekend departures to international holidays with the Freeform 2-Piece Set. Both cases feature recessed TSA locks, integrated ID tags, expandable gussets, and effortlessly balanced dual wheels.',
    images: [IMAGES.luggageSets, IMAGES.carryOn, IMAGES.heroEditorial],
    colors: [
      { name: 'Champagne / Navy Stripe', hex: '#D3C5AE' },
      { name: 'Midnight Navy', hex: '#162844' },
      { name: 'Warm White', hex: '#ECE7DF' },
    ],
    sizes: ['2-Piece Set (21" + 28")'],
    specs: {
      dimensions: 'Carry-On: 54 cm / Large: 71 cm',
      weight: '2.9 kg + 4.3 kg',
      capacity: '45 L + 102 L Combined',
      material: '100% Polypropylene Composite',
      wheelsOrStrap: '360° oversized double spinner wheels',
      lock: 'Recessed TSA locks on both pieces',
      warranty: '10-Year Limited Global Warranty',
    },
  },
  {
    id: 'ver-rome-3pc',
    slug: 'verage-rome-3-piece-hardside-luggage-set',
    sku: 'VER-GM18092-3PC',
    name: 'Rome 3-Piece Expandable Hardside Set',
    brand: 'Verage',
    category: 'Luggage Sets',
    parentGroup: 'luggage',
    priceCad: 469,
    compareAtCad: 599,
    rating: 4.7,
    reviewCount: 74,
    inStock: true,
    stockNote: 'In stock — Save $130 CAD',
    isTrending: true,
    isOnSale: true,
    shortDescription:
      'Complete family-ready 20", 24", and 28" hardside trio with reinforced corner protectors.',
    description:
      'Verage delivers refined architectural styling and lightweight durability across three nested suitcases. Equipped with anti-burst double coil zippers, quiet Hinomoto-style dual casters, and fully lined zip compartments.',
    images: [IMAGES.luggageSets, IMAGES.carryOn, IMAGES.checkedLuggage],
    colors: [
      { name: 'Champagne Sand', hex: '#D4C4A8' },
      { name: 'Navy Slate', hex: '#1C2E4A' },
    ],
    sizes: ['3-Piece Set (20" + 24" + 28")'],
    specs: {
      dimensions: '20" Carry-On, 24" Medium, 28" Large',
      weight: '2.7 kg / 3.5 kg / 4.2 kg',
      capacity: '38 L / 68 L / 104 L',
      material: 'Polycarbonate / ABS Impact Shell',
      wheelsOrStrap: 'Multi-directional silent dual spinners',
      lock: 'Built-in TSA 3-dial lock on all pieces',
      warranty: '5-Year Authorized Repair Warranty',
    },
  },
  {
    id: 'tp-maxlite5-21',
    slug: 'travelpro-maxlite-5-21-expandable-carry-on',
    sku: 'TP-4011721',
    name: 'Maxlite 5 21" Expandable Carry-On Spinner',
    brand: 'Travelpro',
    category: 'Carry-On Luggage',
    parentGroup: 'luggage',
    priceCad: 269,
    compareAtCad: 319,
    rating: 4.8,
    reviewCount: 193,
    inStock: true,
    stockNote: 'In stock — Featherweight 5.4 lbs',
    isBestSeller: true,
    isOnSale: true,
    shortDescription:
      'Airline-crew favourite weighing just 2.4 kg with water-repellent polyester fabric.',
    description:
      'Built for effortless overhead-bin lifting, the Travelpro Maxlite 5 combines ultra-light construction with high-tensile polyester, DuraGuard® stain resistance, PowerScope Lite handle stability, and a tapered 2-inch expansion gusset.',
    images: [IMAGES.checkedLuggage, IMAGES.carryOn],
    colors: [
      { name: 'Imperial Navy', hex: '#1A2D4A' },
      { name: 'Black', hex: '#1C1E22' },
      { name: 'Slate Green', hex: '#4D5C54' },
    ],
    sizes: ['21" Carry-On'],
    specs: {
      dimensions: '53.3 x 36.8 x 22.9 cm (21" x 14.5" x 9")',
      weight: '2.4 kg (5.4 lbs)',
      capacity: '46 L (Expandable)',
      material: 'Polyester with DuraGuard® Coating',
      wheelsOrStrap: '4-wheel 360° high-density spinners',
      lock: 'Lockable ergonomic high-tensile zipper pulls',
      warranty: 'Travelpro Limited Lifetime Coverage',
    },
  },
  {
    id: 'sam-outline-28',
    slug: 'samsonite-outline-pro-28-large-spinner',
    sku: 'SAM-137269-NVY',
    name: 'Outline Pro 28" Large Hardside Spinner',
    brand: 'Samsonite',
    category: 'Checked Luggage',
    parentGroup: 'luggage',
    priceCad: 349,
    compareAtCad: 420,
    rating: 4.7,
    reviewCount: 97,
    inStock: true,
    stockNote: 'In stock — Ready to ship',
    isOnSale: true,
    shortDescription:
      'Recessed KompressPak™ interior divider and rugged polypropylene construction for long-haul trips.',
    description:
      'Crafted for international stays and multi-week travel, the Samsonite Outline Pro 28" maximizes internal packing volume while offering smooth dual-tube aluminum handling and a wet-pocket interior lining made from recycled PET bottles.',
    images: [IMAGES.carryOn, IMAGES.checkedLuggage, IMAGES.heroEditorial],
    colors: [
      { name: 'Midnight Blue', hex: '#132542' },
      { name: 'Obsidian', hex: '#1E2126' },
      { name: 'Warm Sand', hex: '#CBBBA4' },
    ],
    sizes: ['28" Large Checked'],
    specs: {
      dimensions: '76.2 x 51.8 x 32.5 cm (30" x 20.4" x 12.8")',
      weight: '4.6 kg (10.1 lbs)',
      capacity: '112 L (Expandable)',
      material: '100% Polypropylene Shell + Recyclex® Lining',
      wheelsOrStrap: 'Custom-tooled dual 360° spinner wheels',
      lock: 'Integrated TSA combination lock',
      warranty: '10-Year Limited Warranty',
    },
  },
  {
    id: 'at-airconic-28',
    slug: 'american-tourister-airconic-28-large-spinner',
    sku: 'AT-128188-CHR',
    name: 'Airconic 28" Ultra-Light Hardside Spinner',
    brand: 'American Tourister',
    category: 'Checked Luggage',
    parentGroup: 'luggage',
    priceCad: 219,
    compareAtCad: 265,
    rating: 4.6,
    reviewCount: 84,
    inStock: true,
    stockNote: 'In stock — Save $46 CAD',
    isOnSale: true,
    shortDescription:
      'One of the lightest large hardside suitcases in its class at just 3.2 kg.',
    description:
      'Designed around an architectural ribbed shell for rigidity without bulk, the Airconic 28" protects belongings with water-repellent coated zippers, recessed TSA security, and effortless dual wheels.',
    images: [IMAGES.carryOn, IMAGES.luggageSets],
    colors: [
      { name: 'Midnight Navy', hex: '#172947' },
      { name: 'Onyx Black', hex: '#1B1D21' },
      { name: 'Warm Ivory', hex: '#EAE3D8' },
    ],
    sizes: ['28" Large Checked'],
    specs: {
      dimensions: '77.0 x 49.0 x 31.0 cm',
      weight: '3.2 kg (7.0 lbs)',
      capacity: '101 L',
      material: '100% Resistant Polypropylene',
      wheelsOrStrap: 'Double 360° easy-glide wheels',
      lock: 'Recessed 3-digit TSA lock',
      warranty: '10-Year Limited Global Warranty',
    },
  },
  {
    id: 'heys-neo-26',
    slug: 'heys-neo-26-hardside-checked-spinner',
    sku: 'HEYS-30042-26',
    name: 'Neo 26" Polycarbonate Checked Spinner',
    brand: 'Heys',
    category: 'Checked Luggage',
    parentGroup: 'luggage',
    priceCad: 239,
    compareAtCad: 289,
    rating: 4.7,
    reviewCount: 61,
    inStock: true,
    stockNote: 'In stock — Canadian designed',
    isOnSale: true,
    shortDescription:
      'Toronto-designed 100% polycarbonate composite shell with colour-matched trim.',
    description:
      'Balancing refined minimalist form with everyday resilience, the Heys Neo 26" offers zippered expansion for 20% extra packing volume, gel-cushioned carry handles, and a fully lined buckled interior.',
    images: [IMAGES.luggageSets, IMAGES.carryOn],
    colors: [
      { name: 'Champagne', hex: '#D5C6AF' },
      { name: 'Navy', hex: '#152540' },
    ],
    sizes: ['26" Medium-Large Checked'],
    specs: {
      dimensions: '66.0 x 45.0 x 28.0 cm (26" x 17.7" x 11")',
      weight: '4.1 kg (9.0 lbs)',
      capacity: '82 L (Expandable)',
      material: '100% Polycarbonate Composite',
      wheelsOrStrap: '360° dual spinner wheels',
      lock: 'Flush-mounted TSA combination lock',
      warranty: '5-Year Prestige Class Warranty',
    },
  },
  {
    id: 'ver-tokyo-20',
    slug: 'verage-tokyo-20-expandable-carry-on',
    sku: 'VER-GM2001-20',
    name: 'Tokyo 20" Softside Carry-On Spinner',
    brand: 'Verage',
    category: 'Carry-On Luggage',
    parentGroup: 'luggage',
    priceCad: 179,
    compareAtCad: 229,
    rating: 4.6,
    reviewCount: 53,
    inStock: true,
    stockNote: 'In stock — Great everyday value',
    isOnSale: true,
    shortDescription:
      'Compact international cabin spinner with front quick-access laptop compartment.',
    description:
      'Ideal for regional flights and quick overnight business travel, the Verage Tokyo 20" features a dedicated padded 15.6" front tech pocket, durable ripstop fabric, and whisper-quiet dual wheels.',
    images: [IMAGES.checkedLuggage, IMAGES.carryOn],
    colors: [
      { name: 'Charcoal', hex: '#2F3338' },
      { name: 'Midnight Navy', hex: '#182A46' },
    ],
    sizes: ['20" International Carry-On'],
    specs: {
      dimensions: '54.5 x 36.0 x 22.5 cm',
      weight: '2.6 kg (5.7 lbs)',
      capacity: '40 L (Expandable)',
      material: 'High-Density Water-Resistant Nylon',
      wheelsOrStrap: '360° smooth dual casters',
      lock: 'Integrated TSA cable lock',
      warranty: '3-Year Manufacturer Warranty',
    },
  },
  {
    id: 'pac-venturesafe-45',
    slug: 'pacsafe-venturesafe-exp45-anti-theft-travel-pack',
    sku: 'PAC-60661-NVY',
    name: 'Venturesafe EXP45 Anti-Theft Carry-On Backpack',
    brand: 'Pacsafe',
    category: 'Backpacks',
    parentGroup: 'backpacks',
    priceCad: 349,
    rating: 4.9,
    reviewCount: 112,
    inStock: true,
    stockNote: 'In stock — Anti-theft certified',
    isBestSeller: true,
    isTrending: true,
    shortDescription:
      'Carry-on sized 45L travel pack fortified with eXomesh® slashguard and stainless-steel locking cable.',
    description:
      'Open like a suitcase, carry like an ergonomic expedition pack. The Pacsafe Venturesafe EXP45 incorporates puncture-resistant ToughZip technology, Roobar™ deluxe locking anchor, hideaway shoulder straps, and a padded 16" laptop sleeve.',
    images: [IMAGES.backpacks, IMAGES.accessories],
    colors: [
      { name: 'Obsidian Navy', hex: '#16243B' },
      { name: 'Black', hex: '#1A1C20' },
    ],
    sizes: ['45L Carry-On Pack'],
    specs: {
      dimensions: '55.0 x 35.0 x 22.0 cm',
      weight: '1.8 kg (3.97 lbs)',
      capacity: '45 L',
      material: 'Recycled 420D Nylon + eXomesh® Steel Mesh',
      wheelsOrStrap: 'Stowable padded harness & hip belt',
      lock: 'Roobar™ Deluxe locking system + PopNLock clip',
      warranty: '5-Year Pacsafe Warranty',
    },
  },
  {
    id: 'jan-superbreak-plus',
    slug: 'jansport-superbreak-plus-26l-backpack',
    sku: 'JAN-JS0A4QUE-NVY',
    name: 'SuperBreak Plus 26L Laptop Backpack',
    brand: 'JanSport',
    category: 'Backpacks',
    parentGroup: 'backpacks',
    priceCad: 68,
    rating: 4.8,
    reviewCount: 245,
    inStock: true,
    stockNote: 'In stock — Everyday essential',
    isBestSeller: true,
    shortDescription:
      'Classic silhouette upgraded with a padded 15" laptop sleeve and integrated side bottle pocket.',
    description:
      'Crafted in part from recycled 600D polyester, the JanSport SuperBreak Plus keeps daily commutes and campus schedules organized with a spacious main compartment, front utility pocket, and straight-cut padded straps.',
    images: [IMAGES.backpacks],
    colors: [
      { name: 'Deep Navy', hex: '#192942' },
      { name: 'Black', hex: '#1F2024' },
      { name: 'Sandstone', hex: '#C7B8A1' },
    ],
    sizes: ['26L One Size'],
    specs: {
      dimensions: '42.0 x 32.0 x 14.0 cm',
      weight: '0.38 kg (13.4 oz)',
      capacity: '26 L',
      material: '100% Recycled 600D Polyester',
      wheelsOrStrap: 'Padded straight-cut shoulder straps',
      lock: 'N/A (Heavy-duty corded zippers)',
      warranty: 'JanSport Lifetime Warranty',
    },
  },
  {
    id: 'jan-big-student',
    slug: 'jansport-big-student-34l-backpack',
    sku: 'JAN-JS0A47JK-NVY',
    name: 'Big Student 34L Dual-Compartment Backpack',
    brand: 'JanSport',
    category: 'Backpacks',
    parentGroup: 'backpacks',
    priceCad: 85,
    rating: 4.8,
    reviewCount: 181,
    inStock: true,
    stockNote: 'In stock — Ready to ship',
    shortDescription:
      'Two generous main compartments, dedicated padded 15" laptop sleeve, and ergonomic S-curve straps.',
    description:
      'Engineered for heavier study days and overnight trips, the Big Student 34L delivers ample capacity without sacrificing comfort thanks to a fully padded back panel and multiple zippered front organizer pockets.',
    images: [IMAGES.backpacks],
    colors: [
      { name: 'Navy', hex: '#162742' },
      { name: 'Graphite', hex: '#34383E' },
    ],
    sizes: ['34L Large'],
    specs: {
      dimensions: '43.0 x 33.0 x 25.0 cm',
      weight: '0.65 kg (1.4 lbs)',
      capacity: '34 L',
      material: 'Recycled 600D Polyester',
      wheelsOrStrap: 'Ergonomic S-curve shoulder straps',
      lock: 'N/A',
      warranty: 'JanSport Lifetime Warranty',
    },
  },
  {
    id: 'br-rhapsody-tote',
    slug: 'briggs-riley-rhapsody-essential-tote-handbag',
    sku: 'BR-PT125-NVY',
    name: 'Rhapsody Essential Travel Tote Handbag',
    brand: 'Briggs & Riley',
    category: 'Handbags',
    parentGroup: 'handbags',
    priceCad: 369,
    rating: 4.9,
    reviewCount: 78,
    inStock: true,
    stockNote: 'In stock — Ships free across Canada',
    isTrending: true,
    isBestSeller: true,
    shortDescription:
      'Micro-weave nylon travel tote with leather trim, 15" laptop compartment, and trolley pass-through.',
    description:
      'Seamlessly bridging boardroom and boarding gate, the Rhapsody Essential Tote slips cleanly over your carry-on handle while shielding RFID-sensitive essentials and offering refined gold-tone hardware.',
    images: [IMAGES.handbags, IMAGES.accessories],
    colors: [
      { name: 'Navy / Cognac Leather', hex: '#162844' },
      { name: 'Black / Gold', hex: '#1D1E22' },
    ],
    sizes: ['15" Laptop Tote'],
    specs: {
      dimensions: '31.8 x 43.2 x 16.5 cm',
      weight: '0.95 kg (2.1 lbs)',
      capacity: '18.5 L',
      material: 'Lightweight Micro-Weave Nylon + Full-Grain Leather Trim',
      wheelsOrStrap: 'Leather handles + removable crossbody strap + trolley sleeve',
      lock: 'RFID-shielded interior security pocket',
      warranty: 'Simple as That® Lifetime Guarantee',
    },
  },
  {
    id: 'pac-citysafe-cx',
    slug: 'pacsafe-citysafe-cx-anti-theft-crossbody-handbag',
    sku: 'PAC-20415-NVY',
    name: 'Citysafe CX Anti-Theft Convertible Crossbody',
    brand: 'Pacsafe',
    category: 'Handbags',
    parentGroup: 'handbags',
    priceCad: 189,
    compareAtCad: 215,
    rating: 4.8,
    reviewCount: 94,
    inStock: true,
    stockNote: 'In stock — Save $26 CAD',
    isOnSale: true,
    shortDescription:
      'Refined city handbag featuring slash-resistant straps, TurnNLock security hook, and RFID blocking.',
    description:
      'Move confidently through European plazas and downtown commutes with the Pacsafe Citysafe CX. Converts gracefully from shoulder bag to crossbody while fitting an 11" tablet, passport, and daily essentials.',
    images: [IMAGES.handbags],
    colors: [
      { name: 'Midnight Navy', hex: '#182A46' },
      { name: 'Black', hex: '#1D1F23' },
      { name: 'Warm Sand', hex: '#C6B7A0' },
    ],
    sizes: ['8L Crossbody'],
    specs: {
      dimensions: '28.0 x 26.0 x 8.0 cm',
      weight: '0.35 kg (0.77 lbs)',
      capacity: '8 L',
      material: '100D Nylon High-Density Twill + Steel Wire Mesh',
      wheelsOrStrap: 'Carrysafe® slashguard detachable strap',
      lock: 'TurnNLock security hook + Zip clip + RFIDsafe™',
      warranty: '5-Year Pacsafe Warranty',
    },
  },
  {
    id: 'pac-go-crossbody',
    slug: 'pacsafe-go-anti-theft-crossbody-bag',
    sku: 'PAC-35130-NVY',
    name: 'GO Anti-Theft Everyday Crossbody Bag',
    brand: 'Pacsafe',
    category: 'Handbags',
    parentGroup: 'handbags',
    priceCad: 129,
    rating: 4.7,
    reviewCount: 66,
    inStock: true,
    stockNote: 'In stock — Recycled PET fabric',
    shortDescription:
      'Lightweight everyday travel crossbody crafted from recycled bottles with lockable zippers.',
    description:
      'Compact enough for sightseeing yet roomy enough for a compact camera, sunglasses, and travel documents, the Pacsafe GO keeps valuables close and protected against opportunistic pickpockets.',
    images: [IMAGES.handbags, IMAGES.accessories],
    colors: [
      { name: 'Navy', hex: '#1B2D4B' },
      { name: 'Sand', hex: '#D3C4AE' },
    ],
    sizes: ['2.5L Compact'],
    specs: {
      dimensions: '16.0 x 24.0 x 9.0 cm',
      weight: '0.28 kg (0.62 lbs)',
      capacity: '2.5 L',
      material: 'Recycled Polyester (600D)',
      wheelsOrStrap: 'Cut-resistant Dyneema® webbing strap',
      lock: 'Dock Lock zipper security + RFIDsafe™ pocket',
      warranty: '5-Year Pacsafe Warranty',
    },
  },
  {
    id: 'sec-miniwallet-orig',
    slug: 'secrid-miniwallet-original-rfid-cardprotector',
    sku: 'SEC-MO-NVY',
    name: 'Miniwallet Original RFID Leather Cardprotector',
    brand: 'Secrid',
    category: 'Travel Accessories',
    parentGroup: 'accessories',
    priceCad: 115,
    rating: 4.9,
    reviewCount: 312,
    inStock: true,
    stockNote: 'In stock — Handcrafted in the Netherlands',
    isBestSeller: true,
    isTrending: true,
    shortDescription:
      'Iconic Dutch aluminum Cardprotector wrapped in corrected-grain European leather with one-click card fan.',
    description:
      'Small on the outside, surprisingly capacious inside. A single thumb motion fans out 4–6 embossed or flat cards from the solid aluminum core while the leather wrap holds additional cards, Canadian banknotes, and receipts.',
    images: [IMAGES.accessories],
    colors: [
      { name: 'Navy / Gunmetal', hex: '#162844' },
      { name: 'Black / Titanium', hex: '#1D1F24' },
      { name: 'Cognac / Silver', hex: '#9A633C' },
    ],
    sizes: ['One Size (65 x 102 x 21 mm)'],
    specs: {
      dimensions: '10.2 x 6.5 x 2.1 cm',
      weight: '0.072 kg (72 g)',
      capacity: 'Up to 10 cards + banknotes + receipts',
      material: 'Anodized Aluminum + European Full-Grain Leather',
      wheelsOrStrap: 'Snap-button leather closure',
      lock: 'Full RFID & NFC wireless shielding',
      warranty: '2-Year (+1 Year Registered) Secrid Warranty',
    },
  },
  {
    id: 'tp-essentials-kit',
    slug: 'travelpro-essentials-packing-cube-tsa-lock-kit',
    sku: 'TP-ACC-KIT01',
    name: 'Essentials Compression Packing Cube & TSA Lock Kit',
    brand: 'Travelpro',
    category: 'Travel Accessories',
    parentGroup: 'accessories',
    priceCad: 74,
    compareAtCad: 89,
    rating: 4.8,
    reviewCount: 109,
    inStock: true,
    stockNote: 'In stock — Ships free across Canada',
    isOnSale: true,
    shortDescription:
      '4-piece compression packing cube set paired with a Travel Sentry® 3-dial TSA lock and leather passport sleeve.',
    description:
      'Streamline every suitcase interior. Ripstop mesh compression cubes separate garments cleanly while reducing volume by up to 30%, accompanied by a zinc-alloy TSA lock for worry-free international connections.',
    images: [IMAGES.accessories],
    colors: [
      { name: 'Warm Sand / Navy', hex: '#CBBBA4' },
      { name: 'Obsidian Black', hex: '#23262B' },
    ],
    sizes: ['Complete 5-Piece Travel Kit'],
    specs: {
      dimensions: 'Assorted cubes (S, M, L) + TSA Lock + Passport Cover',
      weight: '0.42 kg total',
      capacity: 'Fits 20"–30" suitcases',
      material: 'Water-Resistant Ripstop Nylon + Zinc Alloy Lock',
      wheelsOrStrap: 'Top grab handles on every cube',
      lock: 'Travel Sentry® Approved 3-Dial TSA Lock',
      warranty: '2-Year Accessory Warranty',
    },
  },
];

export const TESTIMONIALS = [
  {
    name: 'Catherine Tremblay',
    role: 'Management Consultant',
    city: 'Toronto, ON',
    quote:
      'After my Briggs & Riley wheel assembly took a hard hit on a Montreal–London flight, the Woodbridge repair technicians had it restored cleanly in three days under lifetime coverage. Nowhere else in Canada matches that expertise.',
    product: 'Briggs & Riley Baseline 22" Carry-On',
  },
  {
    name: 'David Kowalski',
    role: 'Senior Architect',
    city: 'Vancouver, BC',
    quote:
      'Ordered the Samsonite Freeform 2-Piece Set online on Tuesday morning and it arrived in Vancouver ahead of schedule with free Canadian shipping. The shell quality and packaging exceeded every expectation.',
    product: 'Samsonite Freeform 2-Piece Set',
  },
  {
    name: 'Priya Subramanian',
    role: 'Director of Operations',
    city: 'Ottawa, ON',
    quote:
      'The Promenade showroom team walked me through Air Canada carry-on sizing, demonstrated Pacsafe anti-theft locks, and helped me pair a Secrid wallet with my travel tote in ten minutes.',
    product: 'Pacsafe Venturesafe EXP45 & Secrid Miniwallet',
  },
];

export function formatCad(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
