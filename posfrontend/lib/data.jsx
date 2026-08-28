export const sampleProducts = [
  // Phones
  {
    id: "ph001",
    name: "iPhone 15 Pro Max",
    description: "Latest Apple flagship with A17 Pro chip",
    category: "phones",
    brand: "Apple",
    model: "15 Pro Max",
    basePrice: 1199,
    costPrice: 950,
    stock: 25,
    reorderLevel: 5,
    sku: "APL-IP15PM-256",
    barcode: "8901234567890",
    images: ["/iphone-15-pro-max.png"],
    attributes: { storage: "256GB", color: "Natural Titanium" },
    variants: [
      {
        id: "ph001-v1",
        sku: "APL-IP15PM-512",
        name: "512GB",
        attributes: { storage: "512GB" },
        price: 1399,
        costPrice: 1100,
        stock: 15,
        barcode: "8901234567891"
      },
      {
        id: "ph001-v2",
        sku: "APL-IP15PM-1TB",
        name: "1TB",
        attributes: { storage: "1TB" },
        price: 1599,
        costPrice: 1300,
        stock: 10,
        barcode: "8901234567892"
      }
    ],
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-15"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-15")
  },
  {
    id: "ph002",
    name: "Samsung Galaxy S24 Ultra",
    description: "Samsung's premium smartphone with S Pen",
    category: "phones",
    brand: "Samsung",
    model: "S24 Ultra",
    basePrice: 1099,
    costPrice: 850,
    stock: 30,
    reorderLevel: 8,
    sku: "SAM-S24U-256",
    barcode: "8901234567893",
    images: ["/samsung-galaxy-s24-ultra.png"],
    attributes: { storage: "256GB", color: "Titanium Gray" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-20"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-20")
  },
  {
    id: "ph003",
    name: "Google Pixel 8 Pro",
    description: "Google's AI-powered flagship phone",
    category: "phones",
    brand: "Google",
    model: "Pixel 8 Pro",
    basePrice: 999,
    costPrice: 750,
    stock: 20,
    reorderLevel: 5,
    sku: "GOO-PX8P-256",
    barcode: "8901234567894",
    images: ["/google-pixel-8-pro.png"],
    attributes: { storage: "256GB", color: "Obsidian" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-22"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-22")
  },
  // Laptops
  {
    id: "lp001",
    name: "MacBook Pro 16",
    description: "Apple M3 Max powered professional laptop",
    category: "laptops",
    brand: "Apple",
    model: "MacBook Pro 16 M3 Max",
    basePrice: 3499,
    costPrice: 2800,
    stock: 12,
    reorderLevel: 3,
    sku: "APL-MBP16-M3",
    barcode: "8901234567895",
    images: ["/macbook-pro-16.png"],
    attributes: { ram: "36GB", storage: "512GB", color: "Space Black" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-10"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-10")
  },
  {
    id: "lp002",
    name: "Dell XPS 15",
    description: "Premium Windows laptop with OLED display",
    category: "laptops",
    brand: "Dell",
    model: "XPS 15 9530",
    basePrice: 1899,
    costPrice: 1500,
    stock: 18,
    reorderLevel: 5,
    sku: "DEL-XPS15-I7",
    barcode: "8901234567896",
    images: ["/dell-xps-15.png"],
    attributes: { ram: "32GB", storage: "1TB", processor: "Intel i7-13700H" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-12"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-12")
  },
  {
    id: "lp003",
    name: "ThinkPad X1 Carbon",
    description: "Business ultrabook with legendary durability",
    category: "laptops",
    brand: "Lenovo",
    model: "X1 Carbon Gen 11",
    basePrice: 1649,
    costPrice: 1300,
    stock: 22,
    reorderLevel: 6,
    sku: "LEN-X1C-G11",
    barcode: "8901234567897",
    images: ["/thinkpad-x1-carbon.jpg"],
    attributes: { ram: "16GB", storage: "512GB", processor: "Intel i7-1365U" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-14"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-14")
  },
  // Smartwatches
  {
    id: "sw001",
    name: "Apple Watch Ultra 2",
    description: "Rugged smartwatch for extreme sports",
    category: "smartwatches",
    brand: "Apple",
    model: "Ultra 2",
    basePrice: 799,
    costPrice: 620,
    stock: 35,
    reorderLevel: 10,
    sku: "APL-AWU2-49",
    barcode: "8901234567898",
    images: ["/apple-watch-ultra-2.jpg"],
    attributes: { size: "49mm", band: "Alpine Loop" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-18"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-18")
  },
  {
    id: "sw002",
    name: "Samsung Galaxy Watch 6",
    description: "Advanced health tracking smartwatch",
    category: "smartwatches",
    brand: "Samsung",
    model: "Galaxy Watch 6",
    basePrice: 349,
    costPrice: 260,
    stock: 45,
    reorderLevel: 12,
    sku: "SAM-GW6-44",
    barcode: "8901234567899",
    images: ["/samsung-galaxy-watch-6.jpg"],
    attributes: { size: "44mm", color: "Graphite" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-19"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-19")
  },
  // Accessories
  {
    id: "ac001",
    name: "AirPods Pro 2",
    description: "Premium wireless earbuds with ANC",
    category: "accessories",
    brand: "Apple",
    model: "AirPods Pro 2nd Gen",
    basePrice: 249,
    costPrice: 180,
    stock: 80,
    reorderLevel: 20,
    sku: "APL-APP2",
    barcode: "8901234567900",
    images: ["/airpods-pro-2.jpg"],
    attributes: {},
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-05"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-05")
  },
  {
    id: "ac002",
    name: "MagSafe Charger",
    description: "Wireless charging pad for iPhone",
    category: "accessories",
    brand: "Apple",
    model: "MagSafe",
    basePrice: 39,
    costPrice: 25,
    stock: 120,
    reorderLevel: 30,
    sku: "APL-MAGSAFE",
    barcode: "8901234567901",
    images: ["/magsafe-charger.jpg"],
    attributes: {},
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-06"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-06")
  },
  {
    id: "ac003",
    name: "USB-C Hub Pro",
    description: "7-in-1 USB-C hub with HDMI",
    category: "accessories",
    brand: "Anker",
    model: "PowerExpand+",
    basePrice: 69,
    costPrice: 45,
    stock: 65,
    reorderLevel: 15,
    sku: "ANK-USBHUB7",
    barcode: "8901234567902",
    images: ["/usb-c-hub.jpg"],
    attributes: { ports: "7" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-07"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-07")
  },
  // Clothing (Boutique)
  {
    id: "cl001",
    name: "Premium Cotton T-Shirt",
    description: "100% organic cotton casual t-shirt",
    category: "clothing",
    brand: "Urban Style",
    basePrice: 35,
    costPrice: 18,
    stock: 150,
    reorderLevel: 40,
    sku: "URB-TSH-M-BLK",
    barcode: "8901234567903",
    images: ["/black-cotton-t-shirt.jpg"],
    attributes: { size: "M", color: "Black", material: "Cotton" },
    variants: [
      {
        id: "cl001-v1",
        sku: "URB-TSH-S-BLK",
        name: "Small Black",
        attributes: { size: "S", color: "Black" },
        price: 35,
        costPrice: 18,
        stock: 40
      },
      {
        id: "cl001-v2",
        sku: "URB-TSH-L-BLK",
        name: "Large Black",
        attributes: { size: "L", color: "Black" },
        price: 35,
        costPrice: 18,
        stock: 35
      },
      {
        id: "cl001-v3",
        sku: "URB-TSH-M-WHT",
        name: "Medium White",
        attributes: { size: "M", color: "White" },
        price: 35,
        costPrice: 18,
        stock: 50
      }
    ],
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-25"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-25")
  },
  {
    id: "cl002",
    name: "Slim Fit Jeans",
    description: "Classic slim fit denim jeans",
    category: "clothing",
    brand: "Denim Co",
    basePrice: 79,
    costPrice: 40,
    stock: 85,
    reorderLevel: 25,
    sku: "DEN-JNS-32-BLU",
    barcode: "8901234567904",
    images: ["/blue-slim-fit-jeans.jpg"],
    attributes: { size: "32", color: "Blue", fit: "Slim" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-26"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-26")
  },
  {
    id: "cl003",
    name: "Leather Jacket",
    description: "Genuine leather biker jacket",
    category: "clothing",
    brand: "Urban Style",
    basePrice: 299,
    costPrice: 150,
    stock: 20,
    reorderLevel: 5,
    sku: "URB-LJK-M-BLK",
    barcode: "8901234567905",
    images: ["/black-leather-jacket.jpg"],
    attributes: { size: "M", color: "Black", material: "Leather" },
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-27"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-27")
  },
  // Cold Store
  {
    id: "cs001",
    name: "Fresh Milk 1L",
    description: "Farm fresh whole milk",
    category: "cold_store",
    brand: "Dairy Fresh",
    basePrice: 3.99,
    costPrice: 2.5,
    stock: 200,
    reorderLevel: 50,
    sku: "DAI-MLK-1L",
    barcode: "8901234567906",
    images: ["/fresh-milk-bottle.jpg"],
    attributes: { volume: "1L", type: "Whole Milk" },
    expiryDate: /* @__PURE__ */ new Date("2024-02-15"),
    batchNumber: "MLK-2024-001",
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-28"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-28")
  },
  {
    id: "cs002",
    name: "Greek Yogurt",
    description: "Creamy Greek style yogurt",
    category: "cold_store",
    brand: "Dairy Fresh",
    basePrice: 5.49,
    costPrice: 3.2,
    stock: 120,
    reorderLevel: 30,
    sku: "DAI-YOG-500G",
    barcode: "8901234567907",
    images: ["/greek-yogurt-container.jpg"],
    attributes: { weight: "500g", flavor: "Plain" },
    expiryDate: /* @__PURE__ */ new Date("2024-02-10"),
    batchNumber: "YOG-2024-002",
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-28"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-28")
  },
  {
    id: "cs003",
    name: "Fresh Orange Juice",
    description: "100% pure squeezed orange juice",
    category: "cold_store",
    brand: "Citrus Valley",
    basePrice: 6.99,
    costPrice: 4,
    stock: 80,
    reorderLevel: 20,
    sku: "CIT-OJ-1L",
    barcode: "8901234567908",
    images: ["/fresh-orange-juice-bottle.jpg"],
    attributes: { volume: "1L", type: "No Pulp" },
    expiryDate: /* @__PURE__ */ new Date("2024-02-08"),
    batchNumber: "OJ-2024-003",
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-28"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-28")
  },
  {
    id: "cs004",
    name: "Frozen Pizza",
    description: "Authentic Italian frozen pizza",
    category: "cold_store",
    brand: "Italia Bake",
    basePrice: 12.99,
    costPrice: 7.5,
    stock: 60,
    reorderLevel: 15,
    sku: "ITA-PIZ-MARG",
    barcode: "8901234567909",
    images: ["/frozen-margherita-pizza.jpg"],
    attributes: { flavor: "Margherita", weight: "400g" },
    expiryDate: /* @__PURE__ */ new Date("2024-06-30"),
    batchNumber: "PIZ-2024-001",
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-29"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-29")
  }
];
export const sampleCustomers = [
  {
    id: "cust001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1234567890",
    address: "123 Main St, City",
    loyaltyPoints: 2500,
    totalPurchases: 15,
    purchaseHistory: [],
    createdAt: /* @__PURE__ */ new Date("2023-06-15")
  },
  {
    id: "cust002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1234567891",
    address: "456 Oak Ave, Town",
    loyaltyPoints: 5200,
    totalPurchases: 32,
    purchaseHistory: [],
    createdAt: /* @__PURE__ */ new Date("2023-04-20")
  },
  {
    id: "cust003",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1234567892",
    loyaltyPoints: 800,
    totalPurchases: 5,
    purchaseHistory: [],
    createdAt: /* @__PURE__ */ new Date("2024-01-10")
  }
];
export const sampleUsers = [
  {
    id: "user001",
    name: "Admin User",
    email: "admin@store.com",
    role: "admin",
    avatar: "/admin-avatar.png",
    createdAt: /* @__PURE__ */ new Date("2023-01-01"),
    lastLogin: /* @__PURE__ */ new Date()
  },
  {
    id: "user002",
    name: "Jane Manager",
    email: "jane@store.com",
    role: "manager",
    avatar: "/manager-avatar.png",
    createdAt: /* @__PURE__ */ new Date("2023-02-15"),
    lastLogin: /* @__PURE__ */ new Date()
  },
  {
    id: "user003",
    name: "Tom Cashier",
    email: "tom@store.com",
    role: "cashier",
    avatar: "/cashier-avatar.jpg",
    createdAt: /* @__PURE__ */ new Date("2023-06-01"),
    lastLogin: /* @__PURE__ */ new Date()
  },
  {
    id: "user004",
    name: "Lisa Stock",
    email: "lisa@store.com",
    role: "stock_officer",
    avatar: "/stock-officer-avatar.jpg",
    createdAt: /* @__PURE__ */ new Date("2023-08-20"),
    lastLogin: /* @__PURE__ */ new Date()
  }
];
export const sampleSuppliers = [
  {
    id: "sup001",
    name: "TechWorld Distributors",
    contactPerson: "David Lee",
    email: "david@techworld.com",
    phone: "+1234567800",
    address: "789 Industrial Park, Metro City",
    products: ["ph001", "ph002", "lp001", "lp002"],
    isActive: true
  },
  {
    id: "sup002",
    name: "Fashion Forward Inc",
    contactPerson: "Emma Wilson",
    email: "emma@fashionforward.com",
    phone: "+1234567801",
    address: "321 Fashion Ave, Style Town",
    products: ["cl001", "cl002", "cl003"],
    isActive: true
  },
  {
    id: "sup003",
    name: "Fresh Foods Co",
    contactPerson: "Robert Chen",
    email: "robert@freshfoods.com",
    phone: "+1234567802",
    address: "555 Farm Road, Agri District",
    products: ["cs001", "cs002", "cs003", "cs004"],
    isActive: true
  }
];
export const sampleBranches = [
  {
    id: "branch001",
    name: "Main Store - Downtown",
    address: "100 Central Plaza, Downtown",
    phone: "+1234560001",
    isActive: true
  },
  {
    id: "branch002",
    name: "Mall Outlet",
    address: "Shop 45, City Mall",
    phone: "+1234560002",
    isActive: true
  },
  {
    id: "branch003",
    name: "Airport Store",
    address: "Terminal 2, International Airport",
    phone: "+1234560003",
    isActive: true
  }
];
export const sampleSales = [
  {
    id: "sale001",
    receiptNumber: "RCP-2024-0001",
    cart: {
      id: "cart001",
      items: [],
      subtotal: 1199,
      taxAmount: 191.84,
      discountAmount: 0,
      total: 1390.84,
      status: "completed",
      createdAt: /* @__PURE__ */ new Date("2024-01-28T10:30:00")
    },
    payments: [{ method: "card", amount: 1390.84, cardLast4: "4242" }],
    cashierId: "user003",
    branchId: "branch001",
    status: "completed",
    createdAt: /* @__PURE__ */ new Date("2024-01-28T10:30:00"),
    completedAt: /* @__PURE__ */ new Date("2024-01-28T10:32:00")
  }
];
export const sampleDailySummary = {
  date: /* @__PURE__ */ new Date(),
  totalSales: 15420.5,
  totalTransactions: 47,
  cashTotal: 5230,
  cardTotal: 8120.5,
  mobileMoneyTotal: 2070,
  refundsTotal: 125,
  topProducts: [
    { productId: "ph001", quantity: 8, revenue: 9592 },
    { productId: "ac001", quantity: 15, revenue: 3735 },
    { productId: "cs001", quantity: 45, revenue: 179.55 }
  ]
};

// Utility: formatCurrency for demo data consumers
export function formatCurrency(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch (e) {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

// Utility: simple greedy optimal change calculation (usable in demo)
export function calculateOptimalChange(amount, currency = 'USD') {
  const DENOMS = {
    USD: [100,50,20,10,5,1,0.25,0.10,0.05,0.01],
    EUR: [200,100,50,20,10,5,2,1,0.50,0.20,0.10,0.05,0.02,0.01]
  };
  const denoms = DENOMS[currency] || DENOMS.USD;
  let remaining = Math.round(amount * 100) / 100;
  const breakdown = {};
  for (const d of denoms) {
    const count = Math.floor(remaining / d);
    if (count > 0) {
      breakdown[d] = count;
      remaining = Math.round((remaining - count * d) * 100) / 100;
    }
  }
  return { breakdown, remainder: remaining };
}
