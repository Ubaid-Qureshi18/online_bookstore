/* ═══════════════════════════════════════════════
   ARCANUM — Database Seed Script
   Seeds categories, 20+ books, admin, sample users & orders
   
   Usage: node seed.js
   ═══════════════════════════════════════════════ */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('\n═══ ARCANUM — Seeding Database ═══\n');

  // Connect
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306,
    multipleStatements: true
  });

  // Run schema
  console.log('→ Creating database & tables...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(schema);
  await conn.query('USE arcanum_books');

  // ─── CATEGORIES ────────────────────────────
  console.log('→ Seeding categories...');
  const categories = [
    { name: 'Ancient Civilizations', slug: 'ancient-civilizations', icon_emoji: '🏛️', description: 'Foundational texts, mythological compendiums, and governance records of antiquity\'s greatest empires — from Mesopotamia to the Indus Valley.' },
    { name: 'Archaeological Texts', slug: 'archaeological-texts', icon_emoji: '📜', description: 'Deciphered tablets, excavation codices, undeciphered scripts, and recovered artifacts documenting vanished cultures and forgotten peoples.' },
    { name: 'Medical & Healing Arts', slug: 'medical-healing-arts', icon_emoji: '🌿', description: 'Pre-modern medical manuscripts, botanical pharmacopeias, surgical treatises, and traditional healing scrolls from every civilization.' },
    { name: 'Occult Manuscripts', slug: 'occult-manuscripts', icon_emoji: '🧿', description: 'Medieval grimoires, alchemical codices, esoteric ritual texts, and mystical treatises from sealed European and Middle Eastern archives.' },
    { name: 'Forbidden Sciences', slug: 'forbidden-sciences', icon_emoji: '⚗️', description: 'Suppressed scientific treatises, banned astronomical works, pre-Inquisition research, and heretical philosophical texts.' }
  ];

  for (const cat of categories) {
    await conn.query(
      'INSERT IGNORE INTO categories (name, slug, description, icon_emoji) VALUES (?, ?, ?, ?)',
      [cat.name, cat.slug, cat.description, cat.icon_emoji]
    );
  }

  // ─── BOOKS ─────────────────────────────────
  console.log('→ Seeding books (20+ titles)...');
  const books = [
    // ── Ancient Civilizations (cat 1) ──
    {
      title: 'Epic of Gilgamesh: Complete Tablet Set',
      author: 'Sin-leqi-unninni (attributed)',
      category_id: 1,
      description: 'The oldest surviving work of literature in human history, composed in cuneiform on clay tablets in ancient Mesopotamia. This edition presents all twelve tablets of the Standard Babylonian version, including the Flood narrative that predates the Biblical account by over a millennium.',
      cover_image_path: null,
      price: 5200,
      preview_pages: 3,
      language: 'Akkadian / Sumerian',
      year_published: -1800,
      origin_region: 'Nineveh, Mesopotamia',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'Egyptian Book of the Dead: Papyrus of Ani',
      author: 'Scribe Ani',
      category_id: 1,
      description: 'A complete high-resolution reproduction of the most celebrated surviving copy of the Book of the Dead, containing 37 beautifully illustrated chapters of spells, hymns, and instructions for navigating the afterlife.',
      cover_image_path: null,
      price: 4700,
      preview_pages: 3,
      language: 'Hieroglyphic Egyptian',
      year_published: -1250,
      origin_region: 'Thebes, Egypt',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'The Arthashastra',
      author: 'Kautilya (Chanakya)',
      category_id: 1,
      description: 'The ancient Indian treatise on statecraft, economic policy, and military strategy. Often compared to Machiavelli\'s The Prince (written 1,800 years later), covering governance, espionage, law, taxation, and diplomacy with remarkable pragmatism.',
      cover_image_path: null,
      price: 2600,
      preview_pages: 3,
      language: 'Sanskrit',
      year_published: -300,
      origin_region: 'Pataliputra, India',
      rarity_level: 'Rare'
    },
    {
      title: 'Codex Mendoza: Aztec Imperial Record',
      author: 'Aztec Tlacuilo Scribes',
      category_id: 1,
      description: 'A pictorial manuscript documenting the history, tribute system, and daily life of the Aztec Empire. Painted by indigenous Nahua scribes, it provides an unparalleled visual record of Mesoamerican civilization.',
      cover_image_path: null,
      price: 3800,
      preview_pages: 3,
      language: 'Nahuatl / Spanish',
      year_published: 1541,
      origin_region: 'Mexico City',
      rarity_level: 'Extremely Rare'
    },

    // ── Archaeological Texts (cat 2) ──
    {
      title: 'The Voynich Manuscript: A Botanical Codex',
      author: 'Unknown',
      category_id: 2,
      description: 'High-resolution digitization of the world\'s most mysterious manuscript. Written in an undeciphered script with elaborate botanical, astronomical, and anatomical illustrations. Carbon-dated to the early 15th century, its origins remain one of history\'s greatest enigmas.',
      cover_image_path: null,
      price: 5500,
      preview_pages: 3,
      language: 'Unknown Script',
      year_published: 1404,
      origin_region: 'Central Europe',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'Indus Valley Seal Compendium',
      author: 'Dr. Arun Mehta (Ed.)',
      category_id: 2,
      description: 'A comprehensive photographic and analytical catalog of over 3,700 Indus Valley seals from Mohenjo-daro and Harappa. Includes computational analyses of the undeciphered Indus script and comparative studies with Mesopotamian writing systems.',
      cover_image_path: null,
      price: 2800,
      preview_pages: 3,
      language: 'English',
      year_published: 2019,
      origin_region: 'Sindh, Pakistan',
      rarity_level: 'Rare'
    },
    {
      title: 'The Rongorongo Tablets of Easter Island',
      author: 'Prof. Elena Vasquez',
      category_id: 2,
      description: 'The only comprehensive photographic study of all 26 surviving Rongorongo artifacts — the undeciphered hieroglyphic script of Rapa Nui. Includes infrared reflectography of faded glyphs and a critical review of all decipherment attempts.',
      cover_image_path: null,
      price: 3500,
      preview_pages: 3,
      language: 'English',
      year_published: 2015,
      origin_region: 'Rapa Nui (Easter Island)',
      rarity_level: 'Extremely Rare'
    },
    {
      title: 'Popol Vuh: The Maya Book of Creation',
      author: "K'iche' Maya Authors",
      category_id: 2,
      description: 'The foundational mythological narrative of the K\'iche\' Maya, recounting the creation of the world, the deeds of the Hero Twins, and the origin of humanity from maize. This edition presents the earliest surviving transcription.',
      cover_image_path: null,
      price: 3200,
      preview_pages: 3,
      language: "K'iche' / Spanish",
      year_published: 1554,
      origin_region: 'Guatemala',
      rarity_level: 'Extremely Rare'
    },

    // ── Medical & Healing Arts (cat 3) ──
    {
      title: 'De Materia Medica',
      author: 'Pedanius Dioscorides',
      category_id: 3,
      description: 'The preeminent pharmacological reference of the ancient world, cataloging over 600 medicinal plants, minerals, and animal-derived substances. For fifteen centuries, this text served as the foundation of pharmacology.',
      cover_image_path: null,
      price: 3500,
      preview_pages: 3,
      language: 'Greek',
      year_published: 70,
      origin_region: 'Anazarbus, Turkey',
      rarity_level: 'Extremely Rare'
    },
    {
      title: 'Charaka Samhita: Compendium of Medicine',
      author: 'Maharshi Charaka',
      category_id: 3,
      description: 'One of the two foundational texts of Ayurvedic medicine, covering internal medicine, diagnostics, therapeutics, and the philosophical principles of health. Perhaps the oldest systematic medical knowledge still in clinical use today.',
      cover_image_path: null,
      price: 2900,
      preview_pages: 3,
      language: 'Sanskrit',
      year_published: -200,
      origin_region: 'Northern India',
      rarity_level: 'Rare'
    },
    {
      title: 'Canon of Medicine (Kitāb al-Qānūn)',
      author: 'Ibn Sina (Avicenna)',
      category_id: 3,
      description: 'Avicenna\'s monumental medical encyclopedia synthesizing Greek, Roman, and Islamic medical knowledge into a coherent five-volume system. For centuries the standard medical textbook in both the Islamic world and European universities.',
      cover_image_path: null,
      price: 4400,
      preview_pages: 3,
      language: 'Arabic',
      year_published: 1025,
      origin_region: 'Hamadan, Persia',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'Sushruta Samhita: Treatise on Surgery',
      author: 'Maharshi Sushruta',
      category_id: 3,
      description: 'The earliest known systematic treatise on surgery, describing over 300 surgical procedures, 120 instruments, and advanced techniques including rhinoplasty, cataract surgery, and cesarean section.',
      cover_image_path: null,
      price: 3100,
      preview_pages: 3,
      language: 'Sanskrit',
      year_published: -600,
      origin_region: 'Varanasi, India',
      rarity_level: 'Extremely Rare'
    },

    // ── Occult Manuscripts (cat 4) ──
    {
      title: 'Clavicula Salomonis (Key of Solomon)',
      author: 'Attributed to King Solomon',
      category_id: 4,
      description: 'The famed Key of Solomon, a foundational grimoire of Western ceremonial magic, containing detailed instructions for invoking spirits, crafting talismans, and performing planetary rituals. Sourced from a 15th-century Italian manuscript.',
      cover_image_path: null,
      price: 4500,
      preview_pages: 3,
      language: 'Latin',
      year_published: 1450,
      origin_region: 'Florence, Italy',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'Picatrix: Ghāyat al-Ḥakīm',
      author: 'Pseudo-Magriti',
      category_id: 4,
      description: 'One of the most important texts of medieval astrological magic, originally composed in Arabic circa 1000 CE. Covers talismanic magic, celestial invocations, and the philosophical framework of sympathetic magic.',
      cover_image_path: null,
      price: 3800,
      preview_pages: 3,
      language: 'Arabic / Latin',
      year_published: 1256,
      origin_region: 'Al-Andalus',
      rarity_level: 'Extremely Rare'
    },
    {
      title: 'Codex Gigas (Devil\'s Bible)',
      author: 'Herman the Recluse',
      category_id: 4,
      description: 'A complete facsimile of the world\'s largest medieval manuscript. Originally penned in a Benedictine monastery in Bohemia, including the infamous full-page portrait of the Devil. A singular artifact of medieval cosmology.',
      cover_image_path: null,
      price: 6200,
      preview_pages: 3,
      language: 'Latin',
      year_published: 1229,
      origin_region: 'Bohemia',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'Ars Notoria: The Notory Art of Solomon',
      author: 'Anonymous',
      category_id: 4,
      description: 'A medieval text focused on acquiring knowledge through prayer, contemplation, and sacred geometry. Unlike other grimoires, this work blends Christian piety with Neoplatonic theurgy.',
      cover_image_path: null,
      price: 2900,
      preview_pages: 3,
      language: 'Latin',
      year_published: 1300,
      origin_region: 'France',
      rarity_level: 'Rare'
    },

    // ── Forbidden Sciences (cat 5) ──
    {
      title: 'De Humani Corporis Fabrica',
      author: 'Andreas Vesalius',
      category_id: 5,
      description: 'The revolutionary anatomical atlas that overturned 1,300 years of Galenic medical dogma. Published in 1543, this work established direct observation and dissection as the basis of anatomical knowledge.',
      cover_image_path: null,
      price: 4100,
      preview_pages: 3,
      language: 'Latin',
      year_published: 1543,
      origin_region: 'Basel, Switzerland',
      rarity_level: 'Extremely Rare'
    },
    {
      title: 'De Revolutionibus Orbium Coelestium',
      author: 'Nicolaus Copernicus',
      category_id: 5,
      description: 'Copernicus\'s epoch-making treatise proposing a heliocentric model of the solar system. Includes original mathematical proofs, star charts, and documentation of its banning by the Catholic Church.',
      cover_image_path: null,
      price: 5800,
      preview_pages: 3,
      language: 'Latin',
      year_published: 1543,
      origin_region: 'Nuremberg, Germany',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'Sidereus Nuncius (Starry Messenger)',
      author: 'Galileo Galilei',
      category_id: 5,
      description: 'Galileo\'s 1610 treatise announcing his telescopic discoveries — the mountains of the Moon, the moons of Jupiter, and the stars of the Milky Way. Includes original watercolor lunar illustrations.',
      cover_image_path: null,
      price: 4900,
      preview_pages: 3,
      language: 'Latin',
      year_published: 1610,
      origin_region: 'Venice, Italy',
      rarity_level: 'Ultra Rare'
    },
    {
      title: 'Experimenta Nova: On Vacuum and Pressure',
      author: 'Otto von Guericke',
      category_id: 5,
      description: 'Von Guericke\'s documentation of pioneering vacuum experiments, including the famous Magdeburg hemispheres demonstration. Challenged the Aristotelian doctrine that nature abhors a vacuum.',
      cover_image_path: null,
      price: 2700,
      preview_pages: 3,
      language: 'Latin',
      year_published: 1672,
      origin_region: 'Amsterdam',
      rarity_level: 'Rare'
    }
  ];

  for (const book of books) {
    await conn.query(
      `INSERT IGNORE INTO books (title, author, category_id, description, cover_image_path, price, preview_pages, language, year_published, origin_region, rarity_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [book.title, book.author, book.category_id, book.description, book.cover_image_path, book.price, book.preview_pages, book.language, book.year_published, book.origin_region, book.rarity_level]
    );
  }

  // ─── ADMIN ─────────────────────────────────
  console.log('→ Seeding admin user...');
  const adminHash = await bcrypt.hash('admin123', 10);
  await conn.query(
    'INSERT IGNORE INTO admins (username, password_hash) VALUES (?, ?)',
    ['admin', adminHash]
  );

  // ─── SAMPLE USERS ─────────────────────────
  console.log('→ Seeding sample users...');
  const userHash = await bcrypt.hash('password123', 10);
  const sampleUsers = [
    { name: 'Dr. Meera Iyer', email: 'meera.iyer@jnu.edu' },
    { name: 'Prof. Alistair Clarke', email: 'a.clarke@oxford.ac.uk' },
    { name: 'Fatima Al-Rashid', email: 'f.alrashid@kau.edu.sa' },
    { name: 'Dr. Ravi Shankar', email: 'r.shankar@bhu.ac.in' },
    { name: 'Elena Vasquez', email: 'e.vasquez@unam.mx' },
    { name: 'Kenji Tanaka', email: 'k.tanaka@todai.ac.jp' },
    { name: 'Sarah Adebayo', email: 's.adebayo@uct.ac.za' },
    { name: 'Marco Bianchi', email: 'm.bianchi@uniroma.it' },
    { name: 'Ananya Desai', email: 'a.desai@iitb.ac.in' },
    { name: 'James Whitfield', email: 'j.whitfield@harvard.edu' }
  ];

  for (const user of sampleUsers) {
    await conn.query(
      'INSERT IGNORE INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [user.name, user.email, userHash]
    );
  }

  // ─── SAMPLE ORDERS ────────────────────────
  console.log('→ Seeding sample orders...');
  const sampleOrders = [
    { user_id: 1, book_id: 10, amount: 2900, status: 'completed', days_ago: 1 },
    { user_id: 2, book_id: 15, amount: 6200, status: 'completed', days_ago: 1 },
    { user_id: 6, book_id: 18, amount: 5800, status: 'completed', days_ago: 2 },
    { user_id: 3, book_id: 11, amount: 4400, status: 'completed', days_ago: 2 },
    { user_id: 10, book_id: 1, amount: 5200, status: 'pending', days_ago: 3 },
    { user_id: 4, book_id: 3, amount: 2600, status: 'completed', days_ago: 3 },
    { user_id: 9, book_id: 12, amount: 3100, status: 'completed', days_ago: 4 },
    { user_id: 5, book_id: 8, amount: 3200, status: 'failed', days_ago: 4 },
    { user_id: 8, book_id: 13, amount: 4500, status: 'completed', days_ago: 5 },
    { user_id: 7, book_id: 2, amount: 4700, status: 'completed', days_ago: 5 },
    { user_id: 1, book_id: 9, amount: 3500, status: 'completed', days_ago: 8 },
    { user_id: 2, book_id: 5, amount: 5500, status: 'completed', days_ago: 10 },
    { user_id: 4, book_id: 17, amount: 4100, status: 'completed', days_ago: 15 },
    { user_id: 6, book_id: 19, amount: 4900, status: 'completed', days_ago: 20 },
    { user_id: 3, book_id: 14, amount: 3800, status: 'completed', days_ago: 25 }
  ];

  for (const order of sampleOrders) {
    await conn.query(
      `INSERT INTO orders (user_id, book_id, amount_paid, status, payment_id, purchased_at)
       VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
      [order.user_id, order.book_id, order.amount, order.status, `seed_pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, order.days_ago]
    );

    // If completed, add to library and update user spending
    if (order.status === 'completed') {
      await conn.query(
        'INSERT IGNORE INTO user_library (user_id, book_id) VALUES (?, ?)',
        [order.user_id, order.book_id]
      );
      await conn.query(
        'UPDATE users SET total_spent = total_spent + ? WHERE id = ?',
        [order.amount, order.user_id]
      );
    }
  }

  console.log('\n✓ Seeding complete!');
  console.log('  → 5 categories');
  console.log('  → 20 books');
  console.log('  → 1 admin (username: admin, password: admin123)');
  console.log('  → 10 sample users (password: password123)');
  console.log('  → 15 sample orders');
  console.log('\n═══════════════════════════════════════\n');

  await conn.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
