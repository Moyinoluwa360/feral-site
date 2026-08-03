#!/usr/bin/env node
// scripts/seed.js — Populates Firestore with initial product data
//
// firebase-admin is already a root dependency — just `npm install` if missing.
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' node scripts/seed.js
//
// Or set FIREBASE_SERVICE_ACCOUNT in a .env.local file and use:
//   npx dotenv -e .env.local -- node scripts/seed.js
//
// The script uses the Firestore doc ID matching the product's `id` field
// so that /product/:id URLs work correctly after seeding.

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ─── Auth ─────────────────────────────────────────────────────────────────────
let serviceAccount
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
  console.error(
    'ERROR: Set FIREBASE_SERVICE_ACCOUNT env var to your Firebase service account JSON string.'
  )
  process.exit(1)
}

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// ─── Product Data ─────────────────────────────────────────────────────────────
// Mirrors the existing dummy data from src/data/products.js, extended with
// a `stock` map (size → quantity). Adjust stock numbers before seeding.

const products = [
  {
    id: '1',
    name: 'APEX MOTO JACKET',
    price: 289,
    category: 'outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: { XS: 8, S: 12, M: 15, L: 12, XL: 8 },
    description: 'Technical moto-inspired shell with asymmetric zip closure and reflective paneling. Built for the untamed.',
    materials: '82% Nylon, 18% Spandex. YKK hardware throughout.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    ],
    featured: true,
    new: true,
  },
  {
    id: '2',
    name: 'FERAL STENCIL TEE',
    price: 68,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    stock: { XS: 20, S: 25, M: 30, L: 25, XL: 20, '2XL': 10 },
    description: 'Heavyweight 320gsm cotton with oversized FERAL stencil graphic. Pre-distressed finish.',
    materials: '100% Heavyweight Cotton. Garment washed.',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80',
    ],
    featured: true,
    new: false,
  },
  {
    id: '3',
    name: 'CARGO UTILITY PANTS',
    price: 145,
    category: 'bottoms',
    sizes: ['28', '30', '32', '34', '36'],
    stock: { '28': 5, '30': 10, '32': 15, '34': 10, '36': 5 },
    description: '6-pocket tactical cargo with adjustable ankle cuffs and coated ripstop construction.',
    materials: '65% Cotton, 35% Ripstop Nylon. Water-resistant coating.',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    ],
    featured: false,
    new: true,
  },
  {
    id: '4',
    name: 'CLAW MARK HOODIE',
    price: 128,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15, '2XL': 8 },
    description: 'Triple-panel fleece hoodie with embossed claw mark appliqué across the back.',
    materials: '80% Cotton, 20% Polyester Fleece. 400gsm weight.',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
    ],
    featured: true,
    new: false,
  },
  {
    id: '5',
    name: 'TECHNICAL SHELL JACKET',
    price: 345,
    category: 'outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 6, M: 8, L: 8, XL: 6 },
    description: 'Seam-sealed 3-layer membrane shell. Packable hood, underarm vents, articulated patterning.',
    materials: '100% Recycled Nylon face. PTFE membrane. Bluesign certified.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    ],
    featured: false,
    new: false,
  },
  {
    id: '6',
    name: 'DISTRESSED DENIM',
    price: 178,
    category: 'bottoms',
    sizes: ['28', '30', '32', '34', '36', '38'],
    stock: { '28': 4, '30': 8, '32': 10, '34': 8, '36': 4, '38': 2 },
    description: 'Hand-finished raw denim with FERAL patch detail. Custom chainstitched hem.',
    materials: '100% Selvedge Denim. 14oz weight. Sanforized.',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80',
    ],
    featured: false,
    new: true,
  },
  {
    id: '7',
    name: 'THERMAL BASE LAYER',
    price: 89,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: { XS: 10, S: 15, M: 18, L: 15, XL: 10 },
    description: 'Merino-blend technical base. Flatlock seams, anti-odor treatment, fitted silhouette.',
    materials: '70% Merino Wool, 30% Nylon. 200gsm.',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80',
    ],
    featured: false,
    new: false,
  },
  {
    id: '8',
    name: 'ASYMMETRIC VEST',
    price: 168,
    category: 'outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: { XS: 7, S: 10, M: 12, L: 10, XL: 7 },
    description: 'Down-filled paneled vest with asymmetric front zip and internal media pocket.',
    materials: 'Shell: 100% Nylon. Fill: 600 fill power duck down.',
    images: [
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    ],
    featured: false,
    new: true,
  },
  {
    id: '9',
    name: 'TRACK PANTS',
    price: 112,
    category: 'bottoms',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    stock: { XS: 12, S: 18, M: 22, L: 18, XL: 12, '2XL': 6 },
    description: 'Tapered track silhouette with side stripe piping and elastic drawcord waist.',
    materials: '88% Polyester, 12% Elastane. Brushed fleece lining.',
    images: [
      'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    ],
    featured: false,
    new: false,
  },
  {
    id: '10',
    name: 'LONGSLEEVE GRAPHIC',
    price: 84,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    stock: { XS: 18, S: 22, M: 28, L: 22, XL: 18, '2XL': 10 },
    description: 'Full-length ribbed cuffs, oversized fit. All-over sub-dye FERAL claw mark.',
    materials: '100% Polyester. Sublimation printed. Quick-dry.',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    ],
    featured: true,
    new: false,
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`Seeding ${products.length} products to Firestore…`)
  const batch = db.batch()

  for (const product of products) {
    const { id, ...data } = product
    const ref = db.collection('products').doc(id)
    // merge: true preserves fields not present in this seed (e.g. if you later add custom fields)
    batch.set(ref, data, { merge: true })
  }

  await batch.commit()
  console.log(`✓ Done. ${products.length} products seeded.`)
  console.log('\nNote: Create a Firestore composite index for the orders query:')
  console.log('  Collection: orders | Fields: userId ASC, createdAt DESC')
  console.log('  Firebase will log a direct link to create it on first query.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
