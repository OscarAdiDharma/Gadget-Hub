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
  branchLocation: { type: String, default: 'Jakarta' },
  location: { type: String, default: 'Jakarta' }
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  name: String, price: Number, desc: String,
  category: { type: String, enum: ['iPhone', 'Android'] },
  brand: String,
  image: { type: String, default: '' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branchOrigin: { type: String, required: true },
  status: { type: String, default: 'Available' },
  isBU: Boolean, negotiable: Boolean,
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

const TransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  method: String,
  basePrice: Number, agentFee: Number, totalPrice: Number,
  branchLocation: String,
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
      { email: 'customer@gmail.com', password: hash, role: 'customer', location: 'Jakarta', branchLocation: 'Jakarta' }
    ]);
    console.log("✅ Users Seeded");
  }

  if (await Product.countDocuments() === 0) {
      const s = await User.findOne({email: 'customer@gmail.com'});
      if(s) {
          // Hanya contoh 3 produk agar tidak kepanjangan, sisanya logika sama
          const products = [
              // JAKARTA
              { name: 'iPhone 11 Black (JKT)', price: 3000000, branchOrigin: 'Jakarta', category: 'iPhone', brand: 'iPhone 11', isBU: false, image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=800' },
              { name: 'Samsung S24 Ultra (JKT)', price: 12000000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Samsung', isBU: true, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800' },
              { name: 'iPhone 15 Pro Titanium (JKT)', price: 16000000, branchOrigin: 'Jakarta', category: 'iPhone', brand: 'iPhone 15', isBU: false, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800' },
              { name: 'Pixel 8 Pro (JKT)', price: 8000000, branchOrigin: 'Jakarta', category: 'Android', brand: 'Google Pixel', isBU: true, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff23?auto=format&fit=crop&q=80&w=800' },
              
              // BANDUNG
              { name: 'iPhone 13 Pink (BDG)', price: 7000000, branchOrigin: 'Bandung', category: 'iPhone', brand: 'iPhone 13', isBU: false, image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800' },
              { name: 'Samsung Z Flip 5 (BDG)', price: 9000000, branchOrigin: 'Bandung', category: 'Android', brand: 'Samsung', isBU: true, image: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&q=80&w=800' },
              
              // SURABAYA
              { name: 'iPhone 14 Plus Blue (SBY)', price: 10000000, branchOrigin: 'Surabaya', category: 'iPhone', brand: 'iPhone 14', isBU: true, image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcd9?auto=format&fit=crop&q=80&w=800' },
              { name: 'Xiaomi 13T Leica (SBY)', price: 5500000, branchOrigin: 'Surabaya', category: 'Android', brand: 'Xiaomi', isBU: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff23?auto=format&fit=crop&q=80&w=800' },
          ];
          await Product.insertMany(products.map(p => ({ 
              ...p, seller: s._id, negotiable: true, 
              desc: `Unit ${p.name} mulus.`,
              image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800'
          })));
          console.log("✅ 3 Products Seeded (Simple Version)");
      }
  }
};

// --- ROUTES ---

// 1. LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) return res.status(400).json({ msg: 'Gagal Login' });
  const token = jwt.sign({ id: user._id, role: user.role }, 'secret');
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, branch: user.branchLocation, location: user.location } });
});

// 2. REGISTER
app.post('/api/register', async (req, res) => {
    const { email, password, location } = req.body;
    if(await User.findOne({email})) return res.status(400).json({ msg: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    
    // Auto Assign Branch
    let branch = 'Jakarta';
    if(['Bandung', 'Yogyakarta'].includes(location)) branch = 'Bandung';
    if(['Surabaya', 'Bali', 'Medan'].includes(location)) branch = 'Surabaya';

    await User.create({ email, password: hash, location, branchLocation: branch, role: 'customer' });
    res.json({ msg: 'Success' });
});

// 3. GET PRODUCTS
app.get('/api/products', async (req, res) => {
    const { branch } = req.query;
    const query = { status: 'Available' };
    if(branch && branch !== 'Semua') query.branchOrigin = branch;
    res.json(await Product.find(query).populate('seller', 'email').sort({createdAt: -1}));
});

// 4. TRANSACTION (INTI MASALAH ANDA ADA DISINI BIASANYA)
app.post('/api/transactions', async (req, res) => {
    try {
        const { productId, buyerId, method } = req.body;
        
        // Cek Produk
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });

        // Cek Buyer
        const buyer = await User.findById(buyerId);
        if (!buyer) return res.status(404).json({ msg: "User tidak ditemukan" });

        // Validasi Beli Barang Sendiri
        if (product.seller && product.seller.toString() === buyerId) {
            return res.status(400).json({ msg: "Anda tidak bisa membeli barang sendiri!" });
        }

        let fee = 0;
        if (method === 'cod_agent') fee = product.price * 0.05;

        // Create Transaksi
        const tx = await Transaction.create({
            product: productId, 
            buyer: buyerId, 
            seller: product.seller, // Pastikan field ini ada di DB Product
            method, 
            basePrice: product.price, 
            agentFee: fee, 
            totalPrice: product.price + fee,
            branchLocation: product.branchOrigin,
            status: 'Pending'
        });
        
        // Update Status Produk
        product.status = 'Booked'; 
        await product.save();
        
        res.json(tx);
    } catch (error) {
        console.log("TRANSACTION ERROR:", error);
        res.status(500).json({ msg: "Server Error saat Transaksi" });
    }
});

// 5. DASHBOARD & OTHERS
app.get('/api/orders/my-orders/:userId', async (req, res) => {
    const { userId } = req.params;
    const buying = await Transaction.find({ buyer: userId }).populate('product').populate('seller', 'email').sort({createdAt: -1});
    const selling = await Transaction.find({ seller: userId }).populate('product').populate('buyer', 'email').sort({createdAt: -1});
    res.json({ buying, selling });
});

app.get('/api/report/root', async (req, res) => {
    const report = await Transaction.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: "$branchLocation", total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
    ]);
    res.json(report);
});

app.get('/api/dashboard/:role', async (req, res) => {
    const { role } = req.params;
    const { branch } = req.query;
    if (role === 'branch_admin') {
        const data = await Transaction.find({ branchLocation: branch }).populate('product').populate('buyer');
        res.json(data);
    } else if (role === 'agent') {
        const data = await Transaction.find({ branchLocation: branch, status: 'Assigned', method: 'cod_agent' }).populate('product').populate('buyer');
        res.json(data);
    } else { res.json([]); }
});

app.put('/api/transactions/:id/status', async (req, res) => {
    const { status } = req.body;
    const tx = await Transaction.findByIdAndUpdate(req.params.id, { status });
    if(status === 'Rejected') await Product.findByIdAndUpdate(tx.product, { status: 'Available' });
    res.json({ msg: 'Updated' });
});

app.listen(5000, () => console.log('Server running on 5000'));