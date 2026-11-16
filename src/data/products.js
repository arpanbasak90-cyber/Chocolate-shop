/**
 * ZORA SHOP — Master Product Catalog & Seed Data
 * "Sweetness in Every Bite!"
 * Total 9 Handcrafted Boutique Homemade Chocolate Varieties
 */

export const FALLBACK_CHOCOLATE_IMAGE = '/chocolate-placeholder.svg';

export const INITIAL_PRODUCTS = [
  {
    id: "1",
    name: "Plain Chocolate",
    slug: "plain-chocolate",
    category: "Classics",
    piecePrice: 8,
    boxPrice: 400,
    approxPiecesPer250g: "25-30 pcs",
    tag: "All-Time Classic",
    badge: "Popular",
    rating: 4.9,
    reviewsCount: 142,
    shortDescription: "Classic homemade chocolate squares",
    fullDescription: "Classic homemade chocolate squares. Handcrafted with silky smooth cocoa, slow-tempered to achieve a velvety melt-in-mouth texture.",
    ingredients: [
      "Pure Cocoa Mass",
      "Cocoa Butter",
      "Milk Solids",
      "Demerara Cane Sugar",
      "Natural Vanilla Extract"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "45 Days at cool room temperature (18-22°C)",
    isAvailable: true,
    isBestseller: true,
    image: "/images/chocolates/plain-chocolate.jpg",
    prepTime: "Freshly Prepared in 4-6 Hours"
  },
  {
    id: "2",
    name: "Almond Bite",
    slug: "almond-bite",
    category: "Nutty Delights",
    piecePrice: 12,
    boxPrice: 600,
    approxPiecesPer250g: "20-24 pcs",
    tag: "Crowd Favorite",
    badge: "Bestseller",
    rating: 5.0,
    reviewsCount: 218,
    shortDescription: "Chocolate topped with almonds",
    fullDescription: "Chocolate topped with almonds. Crisp, golden-roasted California whole almonds folded into luscious homemade chocolate.",
    ingredients: [
      "Roasted California Almonds",
      "Cocoa Solids",
      "Cocoa Butter",
      "Raw Cane Sugar",
      "Milk Solids",
      "Cardamom Pinch"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "60 Days in an airtight container",
    isAvailable: true,
    isBestseller: true,
    image: "/images/chocolates/almond-bite.jpg",
    prepTime: "Freshly Prepared in 4-6 Hours"
  },
  {
    id: "3",
    name: "Dry Fruits Chocolate",
    slug: "dry-fruits-chocolate",
    category: "Nutty Delights",
    piecePrice: 12,
    boxPrice: 600,
    approxPiecesPer250g: "20-24 pcs",
    tag: "Royal Feast",
    badge: "Chef Pick",
    rating: 4.85,
    reviewsCount: 184,
    shortDescription: "Chocolate with mixed dry fruit pieces",
    fullDescription: "Chocolate with mixed dry fruit pieces. Hand-picked crunchy cashews, roasted almonds, and sweet raisins enrobed in smooth artisanal chocolate.",
    ingredients: [
      "Roasted Cashew Kernels",
      "Almonds",
      "Golden Raisins",
      "Cocoa Mass",
      "Cocoa Butter",
      "Milk Solids"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "60 Days",
    isAvailable: true,
    isBestseller: true,
    image: "/images/chocolates/dry-fruits-chocolate.jpg",
    prepTime: "Freshly Prepared"
  },
  {
    id: "4",
    name: "Oreo Chocolate",
    slug: "oreo-chocolate",
    category: "Kids & Crunchy",
    piecePrice: 12,
    boxPrice: 600,
    approxPiecesPer250g: "22-26 pcs",
    tag: "Cookies & Cream",
    badge: "Trending",
    rating: 4.92,
    reviewsCount: 195,
    shortDescription: "Chocolate with Oreo cookie crumbs and pieces",
    fullDescription: "Chocolate with Oreo cookie crumbs and pieces. Double-stuffed Oreo crumbs folded directly into buttery chocolate for a delightful crunch.",
    ingredients: [
      "Oreo Biscuit Crumbles",
      "White Cocoa Butter blend",
      "Milk Solids",
      "Vanilla Bean Paste",
      "Cocoa powder"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "30 Days",
    isAvailable: true,
    isBestseller: true,
    image: "/images/chocolates/oreo-chocolate.jpg",
    prepTime: "Freshly Prepared"
  },
  {
    id: "5",
    name: "Rasmalai Chocolate",
    slug: "rasmalai-chocolate",
    category: "Indian Fusion",
    piecePrice: 15,
    boxPrice: 750,
    approxPiecesPer250g: "18-22 pcs",
    tag: "Luxury Fusion",
    badge: "Signature",
    rating: 5.0,
    reviewsCount: 312,
    shortDescription: "Light cream-coloured chocolate with pistachio and saffron-style garnish",
    fullDescription: "Light cream-coloured chocolate with pistachio and saffron-style garnish. An exquisite fusion treat infused with Kashmiri saffron threads and toasted pistachios.",
    ingredients: [
      "White Cocoa Butter",
      "Kashmiri Kesar (Saffron)",
      "Iranian Green Pistachios",
      "Cardamom",
      "Milk Mawa Crumb",
      "Sugar"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "30 Days refrigerated",
    isAvailable: true,
    isBestseller: true,
    image: "/images/chocolates/rasmalai-chocolate.jpg",
    prepTime: "Signature Slow-Tempered"
  },
  {
    id: "6",
    name: "Tutti Frutti Chocolate",
    slug: "tutti-frutti-chocolate",
    category: "Fruity & Jellies",
    piecePrice: 12,
    boxPrice: 600,
    approxPiecesPer250g: "22-26 pcs",
    tag: "Sweet Nostalgia",
    badge: "Kid Favorite",
    rating: 4.8,
    reviewsCount: 110,
    shortDescription: "Chocolate with colourful tutti frutti bits",
    fullDescription: "Chocolate with colourful tutti frutti bits. Chewy, rainbow-hued candied fruit morsels scattered throughout silky milk chocolate.",
    ingredients: [
      "Candied Papaya Cubes",
      "Milk Chocolate Mass",
      "Cocoa Butter",
      "Vanilla Extract"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "45 Days",
    isAvailable: true,
    isBestseller: false,
    image: "/images/chocolates/tutti-frutti-chocolate.jpg",
    prepTime: "Freshly Prepared"
  },
  {
    id: "7",
    name: "Jelly Chocolate",
    slug: "jelly-chocolate",
    category: "Fruity & Jellies",
    piecePrice: 12,
    boxPrice: 600,
    approxPiecesPer250g: "20-24 pcs",
    tag: "Fruity Pop",
    badge: "Fun Bite",
    rating: 4.75,
    reviewsCount: 96,
    shortDescription: "Chocolate with colourful jelly cubes",
    fullDescription: "Chocolate with colourful jelly cubes. Bite through a snap of smooth milk chocolate to find soft, tangy fruit jelly centers.",
    ingredients: [
      "Fruit Pectin Jelly",
      "Pure Cocoa Mass",
      "Milk Solids",
      "Fruit Concentrates",
      "Natural Coloring"
    ],
    dietary: "100% Pure Vegetarian (Gelatin-Free)",
    shelfLife: "30 Days",
    isAvailable: true,
    isBestseller: false,
    image: "/images/chocolates/jelly-chocolate.jpg",
    prepTime: "Freshly Prepared"
  },
  {
    id: "8",
    name: "Walnut Bite",
    slug: "walnut-bite",
    category: "Nutty Delights",
    piecePrice: 15,
    boxPrice: 750,
    approxPiecesPer250g: "18-22 pcs",
    tag: "Nutty Indulgence",
    badge: "Premium",
    rating: 4.95,
    reviewsCount: 167,
    shortDescription: "Chocolate topped with walnuts",
    fullDescription: "Chocolate topped with walnuts. Premium buttery Kashmiri walnuts toasted to perfection and smothered in rich semi-sweet chocolate.",
    ingredients: [
      "Kashmiri Walnut Halves",
      "Dark Chocolate Mass",
      "Cocoa Butter",
      "Raw Sugar",
      "Natural Bourbon Vanilla"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "60 Days",
    isAvailable: true,
    isBestseller: true,
    image: "/images/chocolates/walnut-bite.jpg",
    prepTime: "Freshly Prepared"
  },
  {
    id: "9",
    name: "Gulkand Bite",
    slug: "gulkand-bite",
    category: "Indian Fusion",
    piecePrice: 15,
    boxPrice: 750,
    approxPiecesPer250g: "18-22 pcs",
    tag: "Royal Floral",
    badge: "Artisanal",
    rating: 4.9,
    reviewsCount: 153,
    shortDescription: "Chocolate with rose petals and gulkand",
    fullDescription: "Chocolate with rose petals and gulkand. Pure sun-cooked Damask rose petal preserve (gulkand) enveloped in fine bittersweet chocolate.",
    ingredients: [
      "Organic Sun-Cooked Gulkand",
      "Chaitri Rose Petals",
      "Cocoa Solids",
      "Cocoa Butter",
      "Cardamom",
      "Cane Sugar"
    ],
    dietary: "100% Pure Vegetarian",
    shelfLife: "45 Days",
    isAvailable: true,
    isBestseller: true,
    image: "/images/chocolates/gulkand-bite.jpg",
    prepTime: "Handmade Small Batch"
  }
];

export const CATEGORIES = [
  'All Chocolates',
  'Classics',
  'Nutty Delights',
  'Indian Fusion',
  'Kids & Crunchy',
  'Fruity & Jellies'
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Pooja Sharma',
    city: 'Mumbai',
    rating: 5,
    text: 'Ordered the Rasmalai and Gulkand bites for our family Diwali get-together. Every guest was blown away! You can taste the purity and freshness in every single bite. Will never buy commercial chocolates again.',
    productBought: 'Rasmalai & Gulkand Bites',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 2,
    name: 'Rahul Varma',
    city: 'Pune',
    rating: 5,
    text: 'The Almond Bite and Dry Fruits chocolates have become our family weakness. The packaging arrived fresh, perfectly chilled, and the chocolates melted like velvet. Incredible homemade quality!',
    productBought: 'Almond Bite (250g Box)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 3,
    name: 'Ananya Deshmukh',
    city: 'Bangalore',
    rating: 5,
    text: 'Zora Shop made custom gift boxes for my daughter’s birthday. The Oreo and Walnut chocolates were an absolute hit with both kids and adults. Clean, pure veg, and beautifully packed!',
    productBought: 'Oreo & Walnut Bites',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
];

export const INITIAL_ORDERS = [];

export const PROMO_CODES = {
  'SWEET10': { discountPercent: 10, minOrder: 500, description: '10% off orders above ₹500' },
  'ZORA100': { discountFlat: 100, minOrder: 1000, description: '₹100 flat off orders above ₹1000' },
  'FESTIVE15': { discountPercent: 15, minOrder: 1500, description: '15% off festive orders above ₹1500' }
};
