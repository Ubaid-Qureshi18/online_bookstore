const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = require('./models/db'); // ensure path is correct

async function injectBook() {
  try {
    // Manually create an entry just like backend/routes/admin.js does but bypassing HTTP formData
    const title = 'Arcanum Secret';
    const author = 'Admin Upload Demo';
    const category_id = 4; // Occult
    const rarity = 'Ultra Rare';
    const price = 500;
    const desc = 'This is a test book uploaded directly as requested.';
    
    // Copy the dummy PDF to uploads
    const uPdf = 'upload_test_valid_' + Date.now() + '.pdf';
    fs.copyFileSync('test_book_valid.pdf', path.join(__dirname, 'uploads', uPdf));
    
    // Copy the dummy cover to uploads
    const uImg = 'upload_test_cover_' + Date.now() + '.png';
    fs.copyFileSync('C:\\Users\\Aadil\\.gemini\\antigravity\\brain\\b11a63da-d6e5-4fff-b819-60998a74af62\\test_book_cover_1776528171525.png', path.join(__dirname, 'uploads', uImg));
    
    const [result] = await pool.query(
      `INSERT INTO books (title, author, category_id, description, cover_image_path, pdf_path, price, preview_pages, language, rarity_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, category_id, desc, uImg, uPdf, price, 3, 'English', rarity]
    );

    console.log('Book successfully mapped and added. ID:', result.insertId);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

injectBook();
