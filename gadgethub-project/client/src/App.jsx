import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

// --- DATA LIST ---
const IPHONE_MODELS = ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone SE"];
const ANDROID_BRANDS = ["Samsung", "Xiaomi", "Oppo", "Vivo", "Google Pixel", "Infinix"];
const CITIES = ["Jakarta", "Bandung", "Surabaya", "Medan", "Yogyakarta", "Bali", "Lainnya"];

// --- UTILS ---
const getDisplayName = (email) => {
    if (!email) return 'User';
    return email.split('@')[0];
}

// --- COMPONENTS ---

// 1. NAVBAR
const Navbar = ({ user, handleLogout, onSellClick }) => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href='/'}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="font-semibold text-xl tracking-tight text-gray-900">GadgetHUB</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.role === 'customer' && (
                <button onClick={onSellClick} className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-200">+ Jual HP</button>
              )}
              <div className="text-right hidden md:block">
                  <span className="block text-sm font-bold text-gray-900">Hi, {getDisplayName(user.email)}</span>
                  <span className="block text-xs text-gray-500">📍 {user.location || 'Indonesia'}</span>
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-gray-900 hover:text-red-600 transition-colors">Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200">Sign In</Link>
          )}
        </div>
      </div>
    </div>
  </nav>
);

// 2. SELL MODAL (Sudah diperbaiki: Fitur Lengkap Kembali)
const SellModal = ({ isOpen, onClose, user }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('iPhone'); 
    const [brand, setBrand] = useState(IPHONE_MODELS[0]);
    const [isBU, setIsBU] = useState(false);
    const [negotiable, setNegotiable] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/products', {
                name, price: parseInt(price), desc, category, brand, sellerId: user.id, isBU, negotiable
            });
            alert("Iklan Berhasil Tayang!"); onClose(); window.location.reload();
        } catch (error) { alert("Gagal posting produk"); }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative animate-fade-in-up overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-bold transition">✕</button>
                <h2 className="text-2xl font-bold mb-6">Jual Gadget Bekas</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => { setCategory('iPhone'); setBrand(IPHONE_MODELS[0]); }} className={`py-3 rounded-xl font-medium border transition ${category === 'iPhone' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>iPhone</button>
                        <button type="button" onClick={() => { setCategory('Android'); setBrand(ANDROID_BRANDS[0]); }} className={`py-3 rounded-xl font-medium border transition ${category === 'Android' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>Android</button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{category === 'iPhone' ? 'Pilih Seri iPhone' : 'Pilih Merk Android'}</label>
                        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500">
                            {category === 'iPhone' ? IPHONE_MODELS.map(m => <option key={m} value={m}>{m}</option>) : ANDROID_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <input required placeholder="Judul Iklan (Contoh: iPhone 15 Pro Max BU)" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none" />
                    <input required type="number" placeholder="Harga Pembuka (Rp)" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none" />
                    <div className="flex gap-4">
                        <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${isBU ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200'}`}>
                            <input type="checkbox" checked={isBU} onChange={e => setIsBU(e.target.checked)} className="w-5 h-5 accent-red-600" /> <span className="font-bold text-sm">⚡ Lagi BU</span>
                        </label>
                        <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${negotiable ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200'}`}>
                            <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} className="w-5 h-5 accent-green-600" /> <span className="font-bold text-sm">🤝 Boleh Nego</span>
                        </label>
                    </div>
                    <textarea required placeholder="Jelaskan kondisi fisik & minus..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none h-24"></textarea>
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Tayangkan Iklan</button>
                </form>
            </div>
        </div>
    )
}

// 3. PRODUCT DETAIL MODAL (Sudah diperbaiki: Tampil Lengkap)
const ProductDetailModal = ({ isOpen, onClose, product, onBuy }) => {
    if (!isOpen || !product) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur p-2 rounded-full text-gray-800 hover:bg-gray-200 md:hidden">✕</button>
                <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-8 relative">
                    <div className="w-48 h-72 bg-white rounded-[2.5rem] border-8 border-gray-200 shadow-2xl flex items-center justify-center transform hover:scale-105 transition duration-500">
                        <span className="text-gray-400 font-bold text-lg">{product.brand}</span>
                    </div>
                    {product.isBU && <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">⚡ Butuh Uang Cepat</div>}
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold shadow-sm">Status: <span className="text-green-600">{product.status}</span></div>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-blue-600 mb-1 tracking-wide uppercase">{product.category} • {product.brand}</p>
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h2>
                            <p className="text-gray-500 text-sm">Seller: {getDisplayName(product.seller?.email)}</p>
                        </div>
                        <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-black text-2xl font-bold">✕</button>
                    </div>
                    <div className="my-6 border-t border-b border-gray-100 py-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">📝 Deskripsi & Kondisi</h3>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100"><p className="text-gray-700 whitespace-pre-line leading-relaxed">{product.desc || "Cek fisik saat COD."}</p></div>
                        <div className="mt-4 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg"><span>ℹ️</span><p>Harga <b>{product.negotiable ? "BISA NEGO" : "NET"}</b>. Negosiasi dilakukan saat COD.</p></div>
                    </div>
                    <div className="mt-auto">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Harga Penawaran</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-3xl font-bold text-gray-900">Rp {product.price.toLocaleString()}</p>
                                    {product.negotiable && <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Nego</span>}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => onBuy(product._id, product.price, 'cod_mandiri')} className="py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition text-sm">COD Mandiri</button>
                            <button onClick={() => onBuy(product._id, product.price, 'cod_agent')} className="py-3 px-4 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm flex justify-center items-center gap-2"><span>🛡️ Beli via Agent</span></button>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-3">*Fee Agent: Rp {(product.price * 0.05).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. PRODUCT CARD (Sudah diperbaiki: Desain Kartu Kembali)
const ProductCard = ({ product, onClick }) => {
  return (
    <div onClick={() => onClick(product)} className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer relative overflow-hidden">
      {product.isBU && <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl z-20 shadow-md">⚡ LAGI BU</div>}
      <div className="flex justify-between items-start mb-4 mt-2">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{product.brand}</span>
          <span className="text-xs text-gray-400">By: {getDisplayName(product.seller?.email)}</span>
      </div>
      <div className="aspect-[4/5] bg-gray-50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
        <div className="w-32 h-48 bg-gray-200 rounded-[2rem] border-4 border-gray-300 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
             <span className="text-gray-400 font-semibold text-xs text-center px-2">{product.name}</span>
        </div>
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
            <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition">Lihat Detail</span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-2">{product.desc}</p>
        <div className="flex items-center gap-2 mb-6">
            <p className="text-xl font-bold text-gray-900">Rp {product.price.toLocaleString()}</p>
            {product.negotiable && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Nego</span>}
        </div>
      </div>
    </div>
  );
};

// 5. DASHBOARD (Sudah diperbaiki: Logic Lengkap Kembali)
const Dashboard = ({ user, handleLogout }) => {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterType, setFilterType] = useState('All'); 

  useEffect(() => {
    if (!user || user.role === 'customer') {
      axios.get('http://localhost:5000/api/products').then(res => {
         setProducts(res.data);
         setFilteredProducts(res.data);
      });
    } else {
      axios.get(`http://localhost:5000/api/dashboard/${user.role}?branch=${user.branch}`)
           .then(res => setData(res.data));
    }
  }, [user]);

  useEffect(() => {
      if (filterType === 'All') {
          setFilteredProducts(products);
      } else {
          setFilteredProducts(products.filter(p => p.category === filterType));
      }
  }, [filterType, products]);

  const buyProduct = async (productId, price, method) => {
    if (!user) { alert("Silakan Login terlebih dahulu."); return; }
    try {
        await axios.post('http://localhost:5000/api/transactions', { productId, buyerId: user.id, method });
        alert("Pesanan berhasil dibuat!"); window.location.reload();
    } catch(e) { console.error(e); }
  }

  // View Admin
  if (user?.role && user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Navbar user={user} handleLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 py-24">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard: {user.role}</h1>
            <div className="bg-white p-6 rounded-3xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead><tr className="border-b"><th className="p-4">Product</th><th className="p-4">Method</th><th className="p-4">Status</th></tr></thead>
                    <tbody>
                        {data.map(tx => (
                            <tr key={tx._id} className="border-b">
                                <td className="p-4">{tx.product?.name}</td>
                                <td className="p-4">{tx.method}</td>
                                <td className="p-4">{tx.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }

  // View Customer (Marketplace)
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar user={user} handleLogout={handleLogout} onSellClick={() => setSellModalOpen(true)} />
      
      {/* MODAL & POPUP */}
      <SellModal isOpen={isSellModalOpen} onClose={() => setSellModalOpen(false)} user={user} />
      <ProductDetailModal isOpen={!!selectedProduct} product={selectedProduct} onClose={() => setSelectedProduct(null)} onBuy={buyProduct} />
      
      <div className="pt-32 pb-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">Jual Beli Gadget.<br/><span className="text-gray-400">Aman & Terverifikasi.</span></h1>
        <p className="text-gray-500 mb-8">Platform COD HP bekas pertama dengan layanan Agen Verifikasi.</p>
        <button onClick={() => setSellModalOpen(true)} className="md:hidden bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-200">+ Jual HP Sekarang</button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                {['All', 'iPhone', 'Android'].map(type => (
                    <button key={type} onClick={() => setFilterType(type)} className={`px-6 py-2 rounded-lg text-sm font-medium transition ${filterType === type ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>{type}</button>
                ))}
            </div>
        </div>

        {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400">Belum ada produk di kategori ini.</p>
                <button onClick={() => setFilterType('All')} className="text-blue-600 font-medium mt-2">Lihat Semua</button>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredProducts.map(p => (
                    <ProductCard key={p._id} product={p} onClick={setSelectedProduct} />
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

// 6. LOGIN PAGE
const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMsg(''); setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      setUser(res.data.user); localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) { 
        setErrorMsg(err.response?.data?.msg || 'Login Gagal'); 
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="hidden md:flex w-1/2 bg-black relative justify-center items-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550029402-226115b7c579?q=80&w=1965&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="relative z-10 px-16 w-full text-white mb-20">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/10"><span className="font-bold text-2xl">G</span></div>
            <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Quality gadgets,<br/><span className="text-blue-400">verified trust.</span></h1>
            <p className="text-lg text-gray-300 font-light max-w-md">Edisi Tahun 2026. Harga paling update.</p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left"><h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2><p className="text-gray-500 mt-2 text-sm">Masuk menggunakan Email Anda.</p></div>
            {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">⚠️ {errorMsg}</div>}
            <form onSubmit={handleLogin} className="space-y-6">
                <input className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" type="email" placeholder="contoh: budi@gmail.com" onChange={e => setEmail(e.target.value)} />
                <input className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
                <button disabled={isLoading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg shadow-gray-200 transform hover:-translate-y-0.5 disabled:opacity-50">{isLoading ? 'Memproses...' : 'Sign In'}</button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-8">Belum punya akun? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500">Daftar Sekarang</Link></p>
        </div>
      </div>
    </div>
  );
};

// 7. REGISTER PAGE
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState(CITIES[0]); 
    const [successMsg, setSuccessMsg] = useState('');

    const handleReg = async (e) => { 
        e.preventDefault(); 
        try { 
            await axios.post('http://localhost:5000/api/register', {email, password, location}); 
            setSuccessMsg(`Link verifikasi telah dikirim ke ${email}. Jika menggunakan email dummy, silakan cek Terminal VS Code (Server).`);
        } 
        catch (e) { alert("Email sudah dipakai / Gagal"); } 
    }

    if (successMsg) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg animate-fade-in-up">
                    <div className="text-6xl mb-4">📩</div>
                    <h2 className="text-2xl font-bold text-green-700 mb-2">Cek Email Anda!</h2>
                    <p className="text-gray-600 mb-6">{successMsg}</p>
                    <Link to="/login" className="block w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Kembali ke Login</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] px-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900">Buat Akun</h2><p className="text-gray-500">Isi data lengkap Anda.</p></div>
                <form onSubmit={handleReg} className="space-y-4">
                    <input className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email Asli" onChange={e => setEmail(e.target.value)} required />
                    <input className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Domisili Kota</label>
                        <select className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:ring-2 focus:ring-blue-500" onChange={e => setLocation(e.target.value)}>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-0.5">Daftar & Verifikasi</button>
                </form>
                <p className="mt-6 text-center text-sm">Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold">Login</Link></p>
            </div>
        </div>
    )
}

// 8. VERIFY PAGE
const VerifyPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        axios.post('http://localhost:5000/api/verify', { token })
            .then(() => setStatus('Sukses! Akun Anda telah terverifikasi.'))
            .catch(() => setStatus('Gagal Verifikasi. Token mungkin salah atau kadaluarsa.'));
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{status.includes('Sukses') ? '✅ Verifikasi Berhasil' : '❌ Verifikasi Gagal'}</h2>
                <p className="text-gray-500 mb-6">{status}</p>
                {status.includes('Sukses') && <Link to="/login" className="block w-full bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">Login Sekarang</Link>}
            </div>
        </div>
    )
}

// 9. APP ROOT
function App() {
  const [user, setUser] = useState(null);
  useEffect(() => { const loggedIn = localStorage.getItem('user'); if (loggedIn) setUser(JSON.parse(loggedIn)); }, []);
  const handleLogout = () => { setUser(null); localStorage.removeItem('user'); };
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<VerifyPage />} />
        <Route path="/" element={<Dashboard user={user} handleLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;