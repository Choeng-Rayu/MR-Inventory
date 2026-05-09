import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Category } from '../../common/entities/category.entity';
import { Product } from '../../common/entities/product.entity';
import { Supplier } from '../../common/entities/supplier.entity';
import { Unit } from '../../common/entities/unit.entity';
import { Batch } from '../../common/entities/batch.entity';

const CATEGORIES = [
  'Electronics',
  'Food & Beverages',
  'Clothing & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Office Supplies',
  'Automotive',
  'Toys & Games',
  'Pet Supplies',
];

const SUPPLIERS = [
  { name: 'Global Tech Distributors', contactPerson: 'John Smith', phone: '+1-555-0101', email: 'john@globaltech.com', address: '123 Tech Blvd, San Francisco, CA' },
  { name: 'Fresh Foods Inc.', contactPerson: 'Maria Garcia', phone: '+1-555-0102', email: 'maria@freshfoods.com', address: '456 Market St, New York, NY' },
  { name: 'Fashion Wholesale Co.', contactPerson: 'David Lee', phone: '+1-555-0103', email: 'david@fashionwholesale.com', address: '789 Style Ave, Los Angeles, CA' },
  { name: 'Home Comfort Supplies', contactPerson: 'Sarah Johnson', phone: '+1-555-0104', email: 'sarah@homecomfort.com', address: '321 Garden Rd, Seattle, WA' },
  { name: 'Beauty Essentials Ltd.', contactPerson: 'Emily Chen', phone: '+1-555-0105', email: 'emily@beautyessentials.com', address: '654 Spa Lane, Miami, FL' },
  { name: 'Sporting Goods Direct', contactPerson: 'Michael Brown', phone: '+1-555-0106', email: 'michael@sportingdirect.com', address: '987 Stadium Dr, Chicago, IL' },
  { name: 'Office Depot Wholesale', contactPerson: 'Lisa Wang', phone: '+1-555-0107', email: 'lisa@officedepot.com', address: '147 Paper St, Boston, MA' },
  { name: 'Auto Parts Pro', contactPerson: 'Robert Taylor', phone: '+1-555-0108', email: 'robert@autopartspro.com', address: '258 Mechanic Ave, Detroit, MI' },
  { name: 'Toy World Distribution', contactPerson: 'Amanda Wilson', phone: '+1-555-0109', email: 'amanda@toyworld.com', address: '369 Playful Rd, Dallas, TX' },
  { name: 'Pet Care Wholesale', contactPerson: 'James Martinez', phone: '+1-555-0110', email: 'james@petcare.com', address: '753 Furry Lane, Denver, CO' },
];

function generateBarcode(): string {
  // Generate a random EAN-13 barcode
  // EAN-13: 12 digits + 1 checksum
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += faker.number.int({ min: 0, max: 9 }).toString();
  }
  // EAN-13 checksum calculation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return `${code}${checksum}`;
}

function generateSKU(categoryCode: string, index: number): string {
  return `${categoryCode}-${String(index).padStart(4, '0')}`;
}

function generateProductName(category: string): string {
  const names: Record<string, string[]> = {
    'Electronics': ['Wireless Mouse', 'USB-C Cable', 'Bluetooth Speaker', 'Smart Watch', 'Power Bank', 'Laptop Stand', 'Webcam HD', 'Mechanical Keyboard', 'Noise Cancelling Headphones', 'Wireless Charger', 'Tablet Case', 'HDMI Adapter', 'SSD External Drive', 'Smart Bulb', 'Fitness Tracker', 'Portable Monitor', 'Gaming Mousepad', 'Router WiFi 6', 'Smart Plug', 'Dash Cam'],
    'Food & Beverages': ['Organic Rice 5kg', 'Green Tea Leaves', 'Olive Oil 1L', 'Instant Coffee', 'Honey Jar 500g', 'Pasta Spaghetti', 'Coconut Milk', 'Granola Bars', 'Dark Chocolate', 'Sparkling Water', 'Tomato Sauce', 'Quinoa Grain', 'Almond Butter', 'Dried Fruits Mix', 'Protein Powder', 'Matcha Powder', 'Chia Seeds', 'Coconut Oil', 'Oat Milk', 'Energy Drink'],
    'Clothing & Apparel': ['Cotton T-Shirt', 'Running Shoes', 'Winter Jacket', 'Denim Jeans', 'Wool Scarf', 'Baseball Cap', 'Leather Belt', 'Yoga Pants', 'Sneakers White', 'Rain Coat', 'Thermal Socks', 'Sun Hat', 'Work Boots', 'Silk Tie', 'Puffer Vest', 'Swim Trunks', 'Cotton Hoodie', 'Dress Shirt', 'Cargo Shorts', 'Flip Flops'],
    'Home & Garden': ['LED Desk Lamp', 'Storage Boxes Set', 'Kitchen Knife Set', 'Throw Pillows', 'Garden Hose', 'Air Purifier', 'Bath Towels', 'Cookware Set', 'Wall Shelves', 'Plant Pots', 'Bed Sheets', 'Vacuum Cleaner', 'Coffee Maker', 'Tool Box', 'Outdoor Chair', 'Curtain Panels', 'Rug 5x7ft', 'Blender Pro', 'Smart Thermostat', 'Compost Bin'],
    'Health & Beauty': ['Face Moisturizer', 'Vitamin C Serum', 'Shampoo Organic', 'Sunscreen SPF50', 'Toothpaste Whitening', 'Body Lotion', 'Lip Balm Set', 'Eye Cream', 'Hair Conditioner', 'Hand Sanitizer', 'Facial Cleanser', 'Essential Oil Set', 'Makeup Remover', 'Deodorant Stick', 'Hair Oil', 'Face Mask Pack', 'Nail Polish Set', 'Body Scrub', 'Anti-Aging Cream', 'Dental Floss'],
    'Sports & Outdoors': ['Yoga Mat', 'Resistance Bands', 'Tennis Racket', 'Camping Tent', 'Water Bottle', 'Running Belt', 'Dumbbells 10kg', 'Hiking Backpack', 'Swimming Goggles', 'Jump Rope', 'Cycling Helmet', 'Foam Roller', 'Golf Balls', 'Fishing Rod', 'Basketball', 'Soccer Ball', 'Trekking Poles', 'Sleeping Bag', 'First Aid Kit', 'Binoculars'],
    'Office Supplies': ['Stapler Heavy Duty', 'Printer Paper A4', 'Whiteboard Markers', 'File Folders', 'Desk Organizer', 'Ballpoint Pens', 'Notebook Lined', 'Binder Clips', 'Scissors Set', 'Tape Dispenser', 'Calculator Scientific', 'Envelopes Pack', 'Sticky Notes', 'Highlighter Set', 'Document Tray', 'Label Maker', 'Laminator', 'Paper Shredder', 'Desk Lamp LED', 'Easel Stand'],
    'Automotive': ['Car Wax', 'Tire Pressure Gauge', 'Windshield Wipers', 'Car Vacuum', 'Seat Covers', 'Dash Camera', 'Phone Mount', 'Car Air Freshener', 'Jumper Cables', 'Oil Filter', 'Brake Pads', 'Floor Mats', 'Steering Wheel Cover', 'Car Charger', 'LED Headlights', 'Touch Up Paint', 'Window Tint Film', 'Car Cover', 'Tool Set', 'Tire Inflator'],
    'Toys & Games': ['Building Blocks', 'Board Game Set', 'Remote Control Car', 'Puzzle 1000pc', 'Art Supplies Kit', 'Stuffed Animal', 'Action Figure', 'Doll House', 'Science Kit', 'Musical Toy', 'Water Guns', 'Kite', 'Trampoline Mini', 'Play-Doh Set', 'Card Game', 'Chess Set', 'Toy Train', 'Bubble Machine', 'Slime Kit', 'Robot Toy'],
    'Pet Supplies': ['Dog Food Premium', 'Cat Litter', 'Pet Shampoo', 'Dog Leash', 'Cat Scratching Post', 'Bird Cage', 'Fish Tank Filter', 'Pet Bed', 'Dog Treats', 'Cat Toys Set', 'Aquarium Decor', 'Pet Carrier', 'Grooming Brush', 'Water Fountain', 'Hamster Wheel', 'Dog Collar', 'Pet Feeder Auto', 'Training Pads', 'Dental Chews', 'Aquarium Gravel'],
  };

  const categoryNames = names[category] || ['Generic Product'];
  return faker.helpers.arrayElement(categoryNames);
}

function getBaseUnit(category: string): string {
  const units: Record<string, string> = {
    'Electronics': 'piece',
    'Food & Beverages': 'kg',
    'Clothing & Apparel': 'piece',
    'Home & Garden': 'piece',
    'Health & Beauty': 'piece',
    'Sports & Outdoors': 'piece',
    'Office Supplies': 'piece',
    'Automotive': 'piece',
    'Toys & Games': 'piece',
    'Pet Supplies': 'kg',
  };
  return units[category] || 'piece';
}

function getAlternateUnits(baseUnit: string): { unitName: string; conversionRate: number }[] {
  if (baseUnit === 'kg') {
    return [
      { unitName: 'g', conversionRate: 0.001 },
      { unitName: 'lb', conversionRate: 0.453592 },
    ];
  }
  if (baseUnit === 'piece') {
    return [
      { unitName: 'box', conversionRate: 12 },
      { unitName: 'pack', conversionRate: 6 },
    ];
  }
  return [{ unitName: 'unit', conversionRate: 1 }];
}

export async function seedProducts(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository(Category);
  const supplierRepo = dataSource.getRepository(Supplier);
  const productRepo = dataSource.getRepository(Product);
  const unitRepo = dataSource.getRepository(Unit);
  const batchRepo = dataSource.getRepository(Batch);

  console.log('Starting product seed...');

  // Seed categories
  const categoryEntities: Category[] = [];
  for (const catName of CATEGORIES) {
    let category = await categoryRepo.findOne({ where: { name: catName } });
    if (!category) {
      category = categoryRepo.create({
        name: catName,
        description: faker.commerce.productDescription(),
      });
      await categoryRepo.save(category);
    }
    categoryEntities.push(category);
  }
  console.log(`✓ ${categoryEntities.length} categories ready`);

  // Seed suppliers
  const supplierEntities: Supplier[] = [];
  for (const sup of SUPPLIERS) {
    let supplier = await supplierRepo.findOne({ where: { name: sup.name } });
    if (!supplier) {
      supplier = supplierRepo.create(sup);
      await supplierRepo.save(supplier);
    }
    supplierEntities.push(supplier);
  }
  console.log(`✓ ${supplierEntities.length} suppliers ready`);

  // Track used product names to avoid duplicates
  const usedNames = new Set<string>();
  const usedBarcodes = new Set<string>();

  // Seed 100 products
  for (let i = 0; i < 100; i++) {
    const category = categoryEntities[i % categoryEntities.length];
    const categoryCode = category.name.substring(0, 3).toUpperCase();

    // Generate unique product name
    let productName: string;
    let attempts = 0;
    do {
      productName = generateProductName(category.name);
      // Add variant suffix if duplicate
      if (usedNames.has(productName)) {
        productName = `${productName} ${faker.word.adjective()}`;
      }
      attempts++;
    } while (usedNames.has(productName) && attempts < 10);
    usedNames.add(productName);

    // Generate unique barcode
    let barcode: string;
    do {
      barcode = generateBarcode();
    } while (usedBarcodes.has(barcode));
    usedBarcodes.add(barcode);

    const baseUnit = getBaseUnit(category.name);

    const product = productRepo.create({
      name: productName,
      sku: generateSKU(categoryCode, i + 1),
      barcode,
      categoryId: category.id,
      baseUnit,
      description: faker.commerce.productDescription(),
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      lowStockThreshold: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
    });

    await productRepo.save(product);

    // Create base unit
    const baseUnitEntity = unitRepo.create({
      productId: product.id,
      unitName: baseUnit,
      conversionRate: 1,
      isBaseUnit: true,
    });
    await unitRepo.save(baseUnitEntity);

    // Create alternate units
    const alternates = getAlternateUnits(baseUnit);
    for (const alt of alternates) {
      const altUnit = unitRepo.create({
        productId: product.id,
        unitName: alt.unitName,
        conversionRate: alt.conversionRate,
        isBaseUnit: false,
      });
      await unitRepo.save(altUnit);
    }

    // Create 1-3 batches per product
    const batchCount = faker.number.int({ min: 1, max: 3 });
    for (let b = 0; b < batchCount; b++) {
      const supplier = supplierEntities[faker.number.int({ min: 0, max: supplierEntities.length - 1 })];
      const importDate = faker.date.past({ years: 1 });
      const expiryDate = faker.date.future({ years: 2, refDate: importDate });

      const batch = batchRepo.create({
        batchCode: `${categoryCode}-${String(i + 1).padStart(4, '0')}-${String(b + 1).padStart(2, '0')}`,
        productId: product.id,
        supplierId: supplier.id,
        quantity: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        importDate,
        expiryDate,
        unitCost: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
        isDepleted: false,
      });
      await batchRepo.save(batch);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  ...${i + 1} products seeded`);
    }
  }

  console.log('✓ Product seed complete: 100 products with units and batches');
}
