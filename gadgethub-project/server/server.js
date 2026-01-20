const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['root', 'branch_admin', 'agent', 'customer'], default: 'customer' },
  branchLocation: { type: String, default: 'Jakarta' }
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  name: String, price: Number, desc: String,
  category: { type: String, enum: ['iPhone', 'Android'] },
  brand: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Available' },
  isBU: Boolean, negotiable: Boolean,
  branchOrigin: { type: String, default: 'Jakarta' },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

const TransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tambah field Seller di Transaksi biar gampang query
  method: String, // 'cod_mandiri' or 'cod_agent'
  basePrice: Number, 
  agentFee: Number,  
  totalPrice: Number, 
  branchLocation: String,
  // STATUS: Pending -> On_Process (Janji Temu/Agent OTW) -> Verified/Completed
  status: { type: String, default: 'Pending' }, 
  createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- SERVER ---
const app = express();
app.use(cors()); app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/gadgethub').then(() => {
    console.log('MongoDB Connected'); seedData();
}).catch(err => console.log(err));

// --- SEEDING ---
const seedData = async () => {
  if (await User.countDocuments() === 0) {
    const hash = await bcrypt.hash('123456', 10);
    await User.create([
      { email: 'root@hq.com', password: hash, role: 'root', branchLocation: 'HQ' },
      { email: 'admin.jkt@gadgethub.com', password: hash, role: 'branch_admin', branchLocation: 'Jakarta' },
      { email: 'agent.jkt@gadgethub.com', password: hash, role: 'agent', branchLocation: 'Jakarta' },
      { email: 'admin.bdg@gadgethub.com', password: hash, role: 'branch_admin', branchLocation: 'Bandung' },
      { email: 'agent.bdg@gadgethub.com', password: hash, role: 'agent', branchLocation: 'Bandung' },
      { email: 'admin.sby@gadgethub.com', password: hash, role: 'branch_admin', branchLocation: 'Surabaya' },
      { email: 'agent.sby@gadgethub.com', password: hash, role: 'agent', branchLocation: 'Surabaya' },
      { email: 'customer@gmail.com', password: hash, role: 'customer', branchLocation: 'Jakarta' },
      { email: 'penjual@gmail.com', password: hash, role: 'customer', branchLocation: 'Jakarta' } // Tambah penjual dummy
    ]);
    console.log("✅ Users Seeded");
  }
  if (await Product.countDocuments() === 0) {
      const s = await User.findOne({email: 'penjual@gmail.com'}); // Pakai penjual dummy
      if(s) {
          const products = [
              // JAKARTA

          { name: 'iPhone 11 (JKT)', price: 3000000, branchOrigin: 'Jakarta', category: 'iPhone', brand: 'iPhone 11', isBU: false },

          { name: 'Samsung S24 Ultra (JKT)', price: 12000000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Samsung', isBU: true },

          { name: 'iPhone 15 Pro (JKT)', price: 16000000, branchOrigin: 'Jakarta', category: 'iPhone', brand: 'iPhone 15', isBU: false },

          { name: 'Pixel 8 (JKT)', price: 8000000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Google Pixel', isBU: true },

          { name: 'Xiaomi 14 (JKT)', price: 9000000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Xiaomi', isBU: false },

          { name: 'iPhone XR (JKT)', price: 2500000, branchOrigin: 'Jakarta', category: 'iPhone', brand: 'iPhone SE', isBU: true },

          { name: 'Infinix GT (JKT)', price: 3000000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Infinix', isBU: false },

          { name: 'Vivo V30 (JKT)', price: 5000000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Vivo', isBU: false },

          { name: 'Oppo Reno (JKT)', price: 4500000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Oppo', isBU: true },

          { name: 'iPhone 12 (JKT)', price: 5000000, branchOrigin: 'Jakarta', category: 'iPhone', brand: 'iPhone 12', isBU: false },



          // BANDUNG

          { name: 'iPhone 13 (BDG)', price: 7000000, branchOrigin: 'Bandung', category: 'iPhone', brand: 'iPhone 13', isBU: false },

          { name: 'Samsung S23 (BDG)', price: 9000000, branchOrigin: 'Bandung', category: 'Android', brand: 'Samsung', isBU: true },

          { name: 'iPhone 14 Plus (BDG)', price: 10000000, branchOrigin: 'Bandung', category: 'iPhone', brand: 'iPhone 14', isBU: false },

          { name: 'Pixel 7 (BDG)', price: 5000000, branchOrigin: 'Bandung', category: 'Android', brand: 'Google Pixel', isBU: true },

          { name: 'Poco F5 (BDG)', price: 4000000, branchOrigin: 'Bandung', category: 'Android', brand: 'Xiaomi', isBU: false },

          { name: 'iPhone 11 Pro (BDG)', price: 4500000, branchOrigin: 'Bandung', category: 'iPhone', brand: 'iPhone 11', isBU: false },

          { name: 'Samsung A55 (BDG)', price: 3800000, branchOrigin: 'Bandung', category: 'Android', brand: 'Samsung', isBU: false },

          { name: 'Vivo X80 (BDG)', price: 6000000, branchOrigin: 'Bandung', category: 'Android', brand: 'Vivo', isBU: true },

          { name: 'Oppo Find X (BDG)', price: 7500000, branchOrigin: 'Bandung', category: 'Android', brand: 'Oppo', isBU: false },

          { name: 'iPhone SE 3 (BDG)', price: 3200000, branchOrigin: 'Bandung', category: 'iPhone', brand: 'iPhone SE', isBU: true },



          // SURABAYA

          { name: 'iPhone 16 (SBY)', price: 18000000, branchOrigin: 'Surabaya', category: 'iPhone', brand: 'iPhone 16', isBU: false },

          { name: 'Samsung Z Flip (SBY)', price: 8000000, branchOrigin: 'Surabaya', category: 'Android', brand: 'Samsung', isBU: true },

          { name: 'iPhone 12 Pro (SBY)', price: 6500000, branchOrigin: 'Surabaya', category: 'iPhone', brand: 'iPhone 12', isBU: false },

          { name: 'Xiaomi 13T (SBY)', price: 5500000, branchOrigin: 'Surabaya', category: 'Android', brand: 'Xiaomi', isBU: false },

          { name: 'iPhone 15 Plus (SBY)', price: 13000000, branchOrigin: 'Surabaya', category: 'iPhone', brand: 'iPhone 15', isBU: true },

          { name: 'Asus ROG (SBY)', price: 11000000, branchOrigin: 'Surabaya', category: 'Android', brand: 'Infinix', isBU: false },

          { name: 'iPhone XS (SBY)', price: 3000000, branchOrigin: 'Surabaya', category: 'iPhone', brand: 'iPhone SE', isBU: false },

          { name: 'Samsung S22 (SBY)', price: 5000000, branchOrigin: 'Surabaya', category: 'Android', brand: 'Samsung', isBU: true },

          { name: 'Pixel 6 (SBY)', price: 3500000, branchOrigin: 'Surabaya', category: 'Android', brand: 'Google Pixel', isBU: false },

          { name: 'Poco X6 (SBY)', price: 3200000, branchOrigin: 'Surabaya', category: 'Android', brand: 'Xiaomi', isBU: true },
          ];
          await Product.insertMany(products.map(p => ({ ...p, seller: s._id, negotiable: true, desc: `Unit ${p.name} mulus.` })));
          console.log("✅ Products Seeded");
      }
  }
};

// --- ROUTES ---

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) return res.status(400).json({ msg: 'Gagal' });
  const token = jwt.sign({ id: user._id, role: user.role, branch: user.branchLocation }, 'secretkey');
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, branch: user.branchLocation } });
});

app.post('/api/register', async (req, res) => {
    const { email, password, location } = req.body;
    if(await User.findOne({email})) return res.status(400).json({ msg: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    let branch = 'Jakarta';
    if(['Bandung', 'Yogyakarta'].includes(location)) branch = 'Bandung';
    if(['Surabaya', 'Bali'].includes(location)) branch = 'Surabaya';
    await User.create({ email, password: hash, location, branchLocation: branch, role: 'customer' });
    res.json({ msg: 'Register Success' });
});

app.get('/api/products', async (req, res) => {
    const { branch } = req.query;
    const query = { status: 'Available' };
    if(branch && branch !== 'Semua') query.branchOrigin = branch;
    res.json(await Product.find(query).populate('seller', 'email').sort({createdAt: -1}));
});

// TRANSAKSI
app.post('/api/transactions', async (req, res) => {
    const { productId, buyerId, method } = req.body;
    const product = await Product.findById(productId);
    
    // Validasi: Seller tidak bisa beli barang sendiri
    if (product.seller.toString() === buyerId) {
        return res.status(400).json({ msg: "Anda tidak bisa membeli barang sendiri." });
    }

    let fee = 0;
    if (method === 'cod_agent') fee = product.price * 0.05;

    const tx = await Transaction.create({
        product: productId, buyer: buyerId, seller: product.seller, // Simpan ID Seller
        method, basePrice: product.price, agentFee: fee, totalPrice: product.price + fee,
        branchLocation: product.branchOrigin,
        status: 'Pending'
    });
    
    product.status = 'Booked'; await product.save();
    res.json(tx);
});

// DASHBOARD ADMIN & AGENT & ROOT
app.get('/api/dashboard/:role', async (req, res) => {
    const { role } = req.params;
    const { branch } = req.query;

    if (role === 'root') {
        const data = await Transaction.find({ status: 'Completed' }).populate('product'); 
        res.json(data);
    } else if (role === 'branch_admin') {
        // Admin hanya melihat metode 'cod_agent' (karena mandiri urusan user) 
        // ATAU bisa melihat semua tapi hanya bisa aksi di 'cod_agent'
        const data = await Transaction.find({ branchLocation: branch }).populate('product').populate('buyer');
        res.json(data);
    } else if (role === 'agent') {
        const data = await Transaction.find({ branchLocation: branch, status: 'Assigned', method: 'cod_agent' }).populate('product').populate('buyer');
        res.json(data);
    } else { res.json([]); }
});

// KHUSUS ENDPOINT PESANAN USER (PEMBELI & PENJUAL)
app.get('/api/orders/my-orders/:userId', async (req, res) => {
    const { userId } = req.params;
    
    // Apa yang saya beli?
    const buying = await Transaction.find({ buyer: userId }).populate('product').populate('seller', 'email').sort({createdAt: -1});
    
    // Apa yang saya jual?
    const selling = await Transaction.find({ seller: userId }).populate('product').populate('buyer', 'email').sort({createdAt: -1});

    res.json({ buying, selling });
});

// GRAFIK ROOT
app.get('/api/report/root', async (req, res) => {
    const report = await Transaction.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: "$branchLocation", total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
    ]);
    res.json(report);
});

app.put('/api/transactions/:id/status', async (req, res) => {
    const { status } = req.body;
    const tx = await Transaction.findByIdAndUpdate(req.params.id, { status });
    if(status === 'Rejected') await Product.findByIdAndUpdate(tx.product, { status: 'Available' });
    res.json({ msg: 'Updated' });
});

app.listen(5000, () => console.log('Server running...'));