const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Library kirim email
const crypto = require('crypto'); // Bawaan nodejs untuk bikin token acak

// --- KONFIGURASI EMAIL PENGIRIM (GMAIL) ---
// Agar bisa kirim email, kamu butuh "App Password" Gmail.
// Caranya: Akun Google > Security > 2-Step Verification > App Passwords.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'emailmu@gmail.com', // GANTI DENGAN EMAIL ASLI KAMU
    pass: 'xxxx xxxx xxxx xxxx' // GANTI DENGAN APP PASSWORD (16 digit)
  }
});

// --- SCHEMAS ---

// 1. USER SCHEMA (Update: Ada Location & Verifikasi)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true }, // Kota Domisili
  role: { type: String, enum: ['root', 'branch_admin', 'agent', 'customer'], default: 'customer' },
  branchLocation: { type: String, default: 'General' },
  // Status Verifikasi
  isVerified: { type: Boolean, default: false }, 
  verificationToken: String // Token sementara
});
const User = mongoose.model('User', UserSchema);

// 2. PRODUCT SCHEMA (Sama)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: String,
  category: { type: String, enum: ['iPhone', 'Android'], required: true },
  brand: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Available' },
  isBU: { type: Boolean, default: false },
  negotiable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

// 3. TRANSACTION SCHEMA (Sama)
const TransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  method: { type: String, required: true },
  agentFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- SERVER SETUP ---
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/gadgethub')
  .then(() => {
    console.log('MongoDB Connected');
    seedUsers();
  })
  .catch(err => console.log(err));

// --- SEEDING DATA (Update: Tambah Location & Auto-Verify Admin) ---
const seedUsers = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const users = [
      { email: 'root@gadgethub.com', location: 'Pusat', role: 'root', branchLocation: 'HQ', isVerified: true },
      { email: 'admin.jkt@gadgethub.com', location: 'Jakarta', role: 'branch_admin', branchLocation: 'Jakarta', isVerified: true },
      { email: 'agent001@gadgethub.com', location: 'Jakarta', role: 'agent', branchLocation: 'Jakarta', isVerified: true },
      // Customer dummy kita buat langsung verified biar ga ribet pas demo
      { email: 'customer@gmail.com', location: 'Bandung', role: 'customer', branchLocation: 'General', isVerified: true },
    ];

    for (let u of users) {
      await User.create({ ...u, password: hashedPassword });
    }
    console.log('✅ User Database Seeded (Users Verified)');
  }
  seedProducts();
};

const seedProducts = async () => {
  const count = await Product.countDocuments();
  
  // Hanya isi jika database produk kosong
  if (count === 0) {
    // Cari user customer atau agent untuk jadi penjual
    const seller = await User.findOne({ email: 'customer@gmail.com' }) || await User.findOne({ role: 'agent' });
    const agent = await User.findOne({ role: 'agent' }); // Beberapa barang dijual oleh agent (titip jual)
    
    if (!seller) return; 

    const demoProducts = [
      // --- KATEGORI IPHONE ---
      {
        name: 'iPhone 11 64GB Black (Ex iBox)',
        price: 2150000,
        desc: 'Kondisi 85% lecet pemakaian wajar. BH 76% (Service). Kelengkapan HP + Dus saja. FaceID ON, Truetone ON. Cocok buat user pemula iOS.',
        category: 'iPhone', brand: 'iPhone 11',
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },
      {
        name: 'iPhone 12 Mini 128GB Blue',
        price: 3800000,
        desc: 'Kecil cabe rawit. Mulus 95%. Minus: Ada dent kecil di pojok kanan bawah (cek foto). Kamera jernih. Fullset OEM.',
        category: 'iPhone', brand: 'iPhone 12',
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },
      {
        name: 'iPhone 13 128GB Pink',
        price: 6200000,
        desc: 'Warna favorit! Ex Inter sinyal aman (Bea Cukai Lunas). Mulus like new, selalu pake case. BH 88% awet seharian.',
        category: 'iPhone', brand: 'iPhone 13',
        status: 'Available', seller: seller._id, isBU: true, negotiable: true
      },
      {
        name: 'iPhone 13 Pro Max 256GB Sierra Blue',
        price: 9500000,
        desc: 'Flagship pada masanya. Layar 120Hz smooth parah. Kelengkapan Fullset Original bawaan. Tidak pernah bongkar.',
        category: 'iPhone', brand: 'iPhone 13',
        status: 'Available', seller: agent._id, isBU: false, negotiable: false
      },
      {
        name: 'iPhone 14 Pro 128GB Deep Purple',
        price: 10800000,
        desc: 'Dynamic Island! Kamera 48MP sadis. Garansi Inter habis. Fisik 98%. Bonus casing MagSafe senilai 300rb.',
        category: 'iPhone', brand: 'iPhone 14',
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },
      {
        name: 'iPhone 15 128GB Black',
        price: 11500000,
        desc: 'Sudah USB-C! Pemakaian 4 bulan. Garansi iBox masih aktif panjang. Dijual karena mau upgrade ke Pro.',
        category: 'iPhone', brand: 'iPhone 15',
        status: 'Available', seller: seller._id, isBU: true, negotiable: true
      },
      {
        name: 'iPhone 15 Pro Max Natural Titanium',
        price: 15200000,
        desc: 'BU PARAH buat bayar cicilan! Unit simpanan, cycle count baterai masih dikit. Titanium enteng banget. Nego bensin aja.',
        category: 'iPhone', brand: 'iPhone 15',
        status: 'Available', seller: seller._id, isBU: true, negotiable: true
      },
      {
        name: 'iPhone 16 Pro 256GB Desert Titanium',
        price: 19500000,
        desc: 'Barang baru buka dus (BNOB). Hadiah kantor gak kepake. Harga miring dari toko resmi. Siapa cepat dia dapat.',
        category: 'iPhone', brand: 'iPhone 16',
        status: 'Available', seller: agent._id, isBU: false, negotiable: false
      },
      {
        name: 'iPhone XR 128GB Coral (Batangan)',
        price: 1800000,
        desc: 'Jual HP aja (Batangan). Mulus, no minus fungsi. Face ID jalan. iCloud aman bebas reset. Murah meriah.',
        category: 'iPhone', brand: 'iPhone SE', // Masuk kategori SE/Lainnya
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },

      // --- KATEGORI ANDROID ---
      {
        name: 'Samsung S24 Ultra Titanium Gray',
        price: 11200000,
        desc: 'Raja Zoom! AI Features lengkap. Stylus S-Pen lancar. Ada gores halus di layar (kalo pake hydrogel ga keliatan). Fullset.',
        category: 'Android', brand: 'Samsung',
        status: 'Available', seller: seller._id, isBU: true, negotiable: true
      },
      {
        name: 'Samsung Galaxy A55 5G',
        price: 3500000,
        desc: 'Mid-range rasa flagship. Body metal kaca premium. Pemakaian apik cewek. Masih garansi SEIN 3 bulan lagi.',
        category: 'Android', brand: 'Samsung',
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },
      {
        name: 'Samsung S22 5G Compact',
        price: 4200000,
        desc: 'HP kecil spek dewa. Snapdragon 8 Gen 1. Minus: Green line sehelai tipis banget (penyakit umum). Fungsi lain normal 100%.',
        category: 'Android', brand: 'Samsung',
        status: 'Available', seller: seller._id, isBU: true, negotiable: true
      },
      {
        name: 'Xiaomi 14 Leica Lens',
        price: 7800000,
        desc: 'Kamera Leica potraitnya juara dunia. Ukuran compact enak digenggam. HyperOS lancar jaya. Fullset dus buku.',
        category: 'Android', brand: 'Xiaomi',
        status: 'Available', seller: agent._id, isBU: false, negotiable: true
      },
      {
        name: 'Poco F6 Pro Gaming',
        price: 4900000,
        desc: 'Monster gaming rata kanan! Snapdragon 8 Gen 2. Pendingin mantap. RGB nyala. Bekas review youtube doang, kondisi 99%.',
        category: 'Android', brand: 'Xiaomi',
        status: 'Available', seller: seller._id, isBU: false, negotiable: false
      },
      {
        name: 'Google Pixel 8 Pro Bay Blue',
        price: 6500000,
        desc: 'Juaranya fotografi malam. Stock Android bersih tanpa iklan. IMEI aman terdaftar (Ex Singapore). Kelengkapan unit + kabel.',
        category: 'Android', brand: 'Google Pixel',
        status: 'Available', seller: seller._id, isBU: true, negotiable: true
      },
      {
        name: 'Google Pixel 7a Sea',
        price: 3200000,
        desc: 'Compact camera phone. Mulus 90%. Backdoor ada jamur dikit bekas casing. Kamera depannya jernih parah buat vlog.',
        category: 'Android', brand: 'Google Pixel',
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },
      {
        name: 'Infinix GT 20 Pro',
        price: 2800000,
        desc: 'HP Gaming budget mecha design. Lampu LED belakang nyala. Layar 144Hz. Masih mulus, baru pake sebulan jual karena bosen.',
        category: 'Android', brand: 'Infinix',
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },
      {
        name: 'Vivo V30 Pro Zeiss',
        price: 5500000,
        desc: 'Aura Light Portrait. Hasil foto kayak studio. Tipis & ringan. Cocok buat konten kreator. Fullset Garansi Resmi.',
        category: 'Android', brand: 'Vivo',
        status: 'Available', seller: seller._id, isBU: false, negotiable: true
      },
      {
        name: 'Oppo Reno 11 Pro 5G',
        price: 4100000,
        desc: 'Desain cantik warna Pearl. Telephoto lens mantap buat foto orang. Charge super ngebut 80W. No minus siap pakai.',
        category: 'Android', brand: 'Oppo',
        status: 'Available', seller: seller._id, isBU: true, negotiable: true
      }
    ];

    await Product.insertMany(demoProducts);
    console.log('🔥 20 DATA PRODUK DEMO (2026 PRICING) BERHASIL DITAMBAHKAN! 🔥');
  }
};

// --- ROUTES ---

// 1. LOGIN (Cek Status Verifikasi)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) return res.status(400).json({ msg: 'Email tidak terdaftar' });

  // CEK APAKAH SUDAH VERIFIED?
  if (!user.isVerified) {
    return res.status(400).json({ msg: 'Akun belum diverifikasi. Silakan cek email Anda.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Password salah' });

  const token = jwt.sign({ id: user._id, role: user.role, branch: user.branchLocation }, 'secretkey');
  res.json({ token, user: { id: user._id, email: user.email, location: user.location, role: user.role, branch: user.branchLocation } });
});

// 2. REGISTER (Kirim Email Verifikasi)
app.post('/api/register', async (req, res) => {
  const { email, password, location } = req.body; // Terima Location
  
  if (!email.includes('@')) return res.status(400).json({ msg: 'Format email salah' });

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ msg: 'Email sudah digunakan' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Buat Token Random
  const verificationToken = crypto.randomBytes(32).toString('hex');

  try {
    const newUser = await User.create({ 
        email, 
        password: hashedPassword, 
        location, // Simpan Lokasi
        role: 'customer',
        verificationToken // Simpan Token
    });

    // Link yang mengarah ke FRONTEND
    const verifyLink = `http://localhost:5173/verify/${verificationToken}`;

    // Opsi Email
    const mailOptions = {
        from: 'GadgetHUB Security',
        to: email,
        subject: 'Verifikasi Akun GadgetHUB',
        text: `Halo! Klik link ini untuk mengaktifkan akun GadgetHUB kamu: ${verifyLink}`
    };

    // Coba kirim email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email terkirim ke ${email}`);
    } catch (err) {
        console.log("⚠️ Gagal kirim email (Config Gmail belum diset).");
        console.log("⚠️ PENTING: Klik link ini manual untuk demo:", verifyLink);
    }

    res.json(newUser);
  } catch (e) { res.status(400).json({ msg: 'Gagal Register' }); }
});

// 3. VERIFY ROUTE (Baru: Untuk memproses link)
app.post('/api/verify', async (req, res) => {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ msg: 'Token tidak valid atau kadaluarsa' });

    user.isVerified = true;
    user.verificationToken = undefined; // Hapus token setelah dipakai
    await user.save();

    res.json({ msg: 'Verifikasi Berhasil!' });
});

// 4. Products Routes (Sama)
app.get('/api/products', async (req, res) => {
  const products = await Product.find({ status: 'Available' }).populate('seller', 'email location').sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const { name, price, desc, category, brand, sellerId, isBU, negotiable } = req.body;
  const newProduct = await Product.create({ name, price, desc, category, brand, seller: sellerId, isBU, negotiable });
  res.json(newProduct);
});

// 5. Transaction Route (Sama)
app.post('/api/transactions', async (req, res) => {
  const { productId, buyerId, method } = req.body;
  const product = await Product.findById(productId);
  let fee = method === 'cod_agent' ? product.price * 0.05 : 0;
  const newTrans = await Transaction.create({
    product: productId, buyer: buyerId, method, agentFee: fee,
    totalPrice: product.price + fee, status: method === 'cod_agent' ? 'Waiting Verification' : 'Direct COD'
  });
  product.status = 'Booked'; await product.save();
  res.json(newTrans);
});

// 6. Dashboard Route (Sama)
app.get('/api/dashboard/:role', async (req, res) => {
  const { role } = req.params;
  let data = [];
  if (role === 'root') data = await Transaction.find().populate('product').populate('buyer', 'email location');
  else if (role === 'branch_admin') data = await Transaction.find().populate('product'); 
  else if (role === 'agent') data = await Transaction.find({ method: 'cod_agent' }).populate('product');
  res.json(data);
});

app.listen(5000, () => console.log('Server running on port 5000'));