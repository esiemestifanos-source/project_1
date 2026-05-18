// ========================================
// GEARSOULS - PRODUCT DATA
// WITH CORRECT SHOPIFY VARIANT IDs
// ========================================

const PRODUCTS = [
  { 
    id: "p1", 
    shopifyVariantId: "42817957675208",  // ✓ SKULL GEAR EMBLEM TEE
    name: "SKULL GEAR EMBLEM TEE", 
    price: 79, 
    category: "tops", 
    image: "img/0000.jpeg",
    images: ["img/0000.jpeg", "img/0001.jpeg", "img/0002.jpeg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White", "Charcoal"],
    description: "Premium heavyweight cotton t-shirt featuring the iconic skull-in-gear emblem.",
    details: "• 100% combed ring-spun cotton\n• Screen printed graphic\n• Made in Portugal"
  },
  { 
    id: "p2", 
    shopifyVariantId: "42817957707976",  // ✓ SIGNATURE SOUL HOODIE
    name: "SIGNATURE SOUL HOODIE", 
    price: 149, 
    category: "outerwear", 
    image: "img/0001.jpeg",
    images: ["img/0001.jpeg", "img/0000.jpeg", "img/0006.jpeg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Dark Grey"],
    description: "Oversized fleece hoodie with embroidered chest logo.",
    details: "• 80% cotton / 20% polyester\n• Embroidered logo\n• Kangaroo pocket"
  },
  { 
    id: "p3", 
    shopifyVariantId: "42817957740744",  // ✓ DESTINY CARGO PANT
    name: "DESTINY CARGO PANT", 
    price: 169, 
    category: "bottoms", 
    image: "img/0002.jpeg",
    images: ["img/0002.jpeg", "img/0003.jpeg", "img/0004.jpeg"],
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black", "Olive"],
    description: "Technical cargo pants with multiple pockets.",
    details: "• 98% cotton / 2% elastane\n• 6-pocket design\n• YKK zippers"
  },
  { 
    id: "p4", 
    shopifyVariantId: "42817957773512",  // ✓ OBSIDIAN BOMBER
    name: "OBSIDIAN BOMBER", 
    price: 229, 
    category: "outerwear", 
    image: "img/0003.jpeg",
    images: ["img/0003.jpeg", "img/0001.jpeg", "img/0005.jpeg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    description: "Classic bomber jacket with satin lining.",
    details: "• Nylon shell\n• Ribbed collar and cuffs\n• Two-way zipper"
  },
  { 
    id: "p5", 
    shopifyVariantId: "42817957806280",  // ✓ GEARSOULS ARCHIVE TEE
    name: "GEARSOULS ARCHIVE TEE", 
    price: 69, 
    category: "tops", 
    image: "img/0004.jpeg",
    images: ["img/0004.jpeg", "img/0000.jpeg", "img/0007.jpeg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White"],
    description: "Essential archive logo tee.",
    details: "• 100% cotton\n• Screen printed front and back\n• Garment washed"
  },
  { 
    id: "p6", 
    shopifyVariantId: "42817957839048",  // ✓ UTILITY VEST
    name: "UTILITY VEST", 
    price: 199, 
    category: "outerwear", 
    image: "img/0005.jpeg",
    images: ["img/0005.jpeg", "img/0006.jpeg", "img/0008.jpeg"],
    sizes: ["S", "M", "L"],
    colors: ["Black", "Tan"],
    description: "Multi-pocket utility vest.",
    details: "• 100% nylon ripstop\n• 8 exterior pockets\n• Water-resistant"
  },
  { 
    id: "p7", 
    shopifyVariantId: "42817957871816",  // ✓ CHAIN WALLET
    name: "CHAIN WALLET", 
    price: 45, 
    category: "accessories", 
    image: "img/0006.jpeg",
    images: ["img/0006.jpeg", "img/0007.jpeg"],
    sizes: ["One Size"],
    colors: ["Black", "Silver"],
    description: "Leather wallet with detachable chain.",
    details: "• Genuine leather\n• 6 card slots\n• RFID blocking"
  },
  { 
    id: "p8", 
    shopifyVariantId: "42817957904584",  // ✓ METAL RING BEANIE
    name: "METAL RING BEANIE", 
    price: 55, 
    category: "accessories", 
    image: "img/0007.jpeg",
    images: ["img/0007.jpeg", "img/0000.jpeg"],
    sizes: ["One Size"],
    colors: ["Black", "Dark Grey"],
    description: "Rib-knit beanie with metal ring detail.",
    details: "• 100% acrylic\n• Metal logo ring\n• Made in Italy"
  }
];

const FEATURED_IDS = ["p1", "p2", "p3", "p6"];

const SHOPIFY_CONFIG = {
  domain: 'shgx4k-wb.myshopify.com',
  storefrontAccessToken: '68f1ddeff53ca07083b438c92837d296'
};