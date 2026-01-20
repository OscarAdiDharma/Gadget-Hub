import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- 1. DATA & KONFIGURASI ---
const IPHONE_MODELS = ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone SE"];
const ANDROID_BRANDS = ["Samsung", "Xiaomi", "Oppo", "Vivo", "Google Pixel", "Infinix"];
const CITIES = ["Jakarta", "Bandung", "Surabaya"];

// --- 2. UTILITY FUNCTIONS ---
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

const getDisplayName = (email) => {
    if (!email) return 'User';
    return email.split('@')[0];
};

// --- 3. COMPONENTS UI ---

// A. NAVBAR COMPONENT
const Navbar = ({ user, handleLogout, onSellClick, selectedBranch, setSelectedBranch, onMyOrdersClick }) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href='/'}>
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-gray-900">GadgetHUB</span>
          </div>

          {/* Filter Cabang (Hanya untuk Customer/Guest) */}
          {(!user || user.role === 'customer') && (
              <div className="hidden md:flex items-center bg-gray-50 rounded-full px-5 py-2.5 border border-gray-200 hover:border-gray-300 transition-all">
                  <span className="text-xs font-bold text-gray-400 mr-3 uppercase tracking-wider">📍 Lokasi Belanja:</span>
                  <select 
                      value={selectedBranch} 
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer hover:text-blue-600 transition"
                  >
                      <option value="Semua">🌏 Semua Indonesia</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
              </div>
          )}

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <button 
                        onClick={onMyOrdersClick}
                        className="text-sm font-bold text-gray-600 hover:text-black transition flex items-center gap-2">
                        📦 Pesanan Saya
                    </button>
                    <button 
                        onClick={onSellClick}
                        className="hidden md:block bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 transform hover:-translate-y-0.5">
                        + Jual HP
                    </button>
                  </>
                )}
                
                <div className="text-right hidden md:block leading-tight">
                    <span className="block text-sm font-bold text-gray-900">Hi, {getDisplayName(user.email)}</span>
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-bold mt-0.5">
                      {user.role === 'root' ? '👑 HEADQUARTER' : `${user.role} • ${user.branch || user.location}`}
                    </span>
                </div>
                
                <button 
                    onClick={handleLogout} 
                    className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// B. USER ORDERS MODAL (Pop-up Pesanan Saya - NEW FEATURE)
const UserOrdersModal = ({ isOpen, onClose, user }) => {
    const [orders, setOrders] = useState({ buying: [], selling: [] });
    const [activeTab, setActiveTab] = useState('buying'); 

    const fetchOrders = () => {
        if(user) axios.get(`http://localhost:5000/api/orders/my-orders/${user.id}`).then(res => setOrders(res.data));
    }

    useEffect(() => { if(isOpen) fetchOrders(); }, [isOpen]);

    const updateStatus = async (id, status) => {
        if(!confirm(`Konfirmasi perubahan status menjadi ${status}?`)) return;
        await axios.put(`http://localhost:5000/api/transactions/${id}/status`, { status });
        fetchOrders();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl h-[85vh] flex flex-col relative overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Manajemen Pesanan</h2>
                        <p className="text-gray-500 text-sm mt-1">Pantau status pembelian dan penjualanmu disini.</p>
                    </div>
                    <button onClick={onClose} className="bg-gray-50 p-3 rounded-full shadow hover:bg-gray-100 transition text-gray-500 hover:text-black font-bold">✕</button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button onClick={() => setActiveTab('buying')} className={`flex-1 py-5 font-bold text-sm uppercase tracking-wider transition ${activeTab==='buying' ? 'border-b-4 border-black text-black bg-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                        🛒 Barang Saya Beli ({orders.buying.length})
                    </button>
                    <button onClick={() => setActiveTab('selling')} className={`flex-1 py-5 font-bold text-sm uppercase tracking-wider transition ${activeTab==='selling' ? 'border-b-4 border-black text-black bg-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                        💰 Barang Saya Jual ({orders.selling.length})
                    </button>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    {orders[activeTab].length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="text-6xl mb-4 opacity-20">📦</div>
                            <p className="text-gray-400 font-medium text-lg">Belum ada transaksi di tab ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {orders[activeTab].map(tx => (
                                <div key={tx._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status==='Completed'?'bg-green-100 text-green-700': tx.status==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>
                                                {tx.status}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                📅 {new Date(tx.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${tx.method === 'cod_agent' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                {tx.method === 'cod_agent' ? '🛡️ Via Agent' : '🤝 COD Mandiri'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{tx.product?.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">
                                            {activeTab === 'buying' ? `Penjual: ${tx.seller?.email}` : `Pembeli: ${tx.buyer?.email}`}
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">{formatRupiah(tx.totalPrice)}</p>
                                    </div>

                                    {/* LOGIKA TOMBOL KHUSUS COD MANDIRI (P2P) */}
                                    {tx.method === 'cod_mandiri' && (
                                        <div className="flex flex-col justify-center gap-3 min-w-[220px]">
                                            
                                            {/* SISI PENJUAL: Terima/Tolak Order Baru */}
                                            {activeTab === 'selling' && tx.status === 'Pending' && (
                                                <>
                                                    <button onClick={()=>updateStatus(tx._id, 'On_Process')} className="w-full bg-black text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 shadow-lg transition">
                                                        ✅ Terima Pesanan
                                                    </button>
                                                    <button onClick={()=>updateStatus(tx._id, 'Rejected')} className="w-full border-2 border-red-100 text-red-600 px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-50 transition">
                                                        Tolak
                                                    </button>
                                                </>
                                            )}

                                            {/* SISI PEMBELI: Konfirmasi Terima Barang */}
                                            {activeTab === 'buying' && tx.status === 'On_Process' && (
                                                <div className="text-center bg-green-50 p-4 rounded-xl border border-green-100">
                                                    <p className="text-xs text-green-700 mb-3 font-medium">Penjual sudah setuju. Jika sudah bertemu dan cek barang, klik selesai.</p>
                                                    <button onClick={()=>updateStatus(tx._id, 'Completed')} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-md transition">
                                                        🤝 Barang Diterima (Selesai)
                                                    </button>
                                                </div>
                                            )}

                                            {/* Status Info Text */}
                                            {tx.status === 'On_Process' && activeTab === 'selling' && (
                                                <span className="text-center text-xs text-blue-600 font-bold bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                    Menunggu Pembeli Konfirmasi Selesai
                                                </span>
                                            )}
                                            {tx.status === 'Pending' && activeTab === 'buying' && (
                                                <span className="text-center text-xs text-gray-500 italic bg-gray-100 p-3 rounded-xl">
                                                    Menunggu respon Penjual...
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* INFO UNTUK COD AGENT */}
                                    {tx.method === 'cod_agent' && (
                                        <div className="flex items-center justify-center min-w-[220px]">
                                            <div className="text-center w-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Status Proses Agent</p>
                                                <span className="text-sm font-bold text-purple-700 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 block">
                                                    {tx.status === 'Pending' ? 'Menunggu Admin Cabang' : 
                                                     tx.status === 'Assigned' ? 'Agent Sedang OTW' : 
                                                     tx.status === 'Verified' ? 'Menunggu Finalisasi Admin' : 
                                                     'Transaksi Selesai'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// C. SELL MODAL COMPONENT (Form Jual HP)
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
        } catch (error) { alert("Gagal posting produk. Pastikan semua data terisi."); }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center font-bold transition">✕</button>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">Jual Gadget</h2>
                <p className="text-gray-500 mb-8">Pasang iklan gratis, jangkau ribuan pembeli.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-2xl">
                        <button type="button" onClick={() => { setCategory('iPhone'); setBrand(IPHONE_MODELS[0]); }} className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${category === 'iPhone' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>📱 iPhone</button>
                        <button type="button" onClick={() => { setCategory('Android'); setBrand(ANDROID_BRANDS[0]); }} className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${category === 'Android' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>🤖 Android</button>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Tipe / Model</label>
                        <div className="relative">
                            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-900">
                                {category === 'iPhone' ? IPHONE_MODELS.map(m => <option key={m} value={m}>{m}</option>) : ANDROID_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">▼</div>
                        </div>
                    </div>
                    <input required placeholder="Judul Iklan (Contoh: iPhone 15 Pro Max Mulus Fullset)" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-200 focus:border-blue-500 transition font-medium placeholder-gray-400" />
                    <div className="relative"><span className="absolute left-4 top-4 text-gray-500 font-bold">Rp</span><input required type="number" placeholder="Harga Jual" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 rounded-xl outline-none border border-gray-200 focus:border-blue-500 transition font-bold text-lg" /></div>
                    <div className="flex gap-4">
                        <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition flex items-center justify-center gap-3 ${isBU ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}><input type="checkbox" checked={isBU} onChange={e => setIsBU(e.target.checked)} className="w-5 h-5 accent-red-600" /><span className="font-bold text-sm">⚡ Lagi BU (Cepat)</span></label>
                        <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition flex items-center justify-center gap-3 ${negotiable ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}><input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} className="w-5 h-5 accent-green-600" /><span className="font-bold text-sm">🤝 Boleh Nego</span></label>
                    </div>
                    <textarea required placeholder="Jelaskan kondisi fisik, minus, dan kelengkapan sejujur-jujurnya..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl outline-none h-32 border border-gray-200 focus:border-blue-500 transition text-sm resize-none"></textarea>
                    <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 shadow-xl shadow-gray-200 transition transform hover:-translate-y-1">Tayangkan Iklan Sekarang</button>
                </form>
            </div>
        </div>
    )
}

// D. PRODUCT DETAIL MODAL (Detail & Pilihan COD)
const ProductDetailModal = ({ isOpen, onClose, product, onBuy }) => {
    if (!isOpen || !product) return null;
    const agentFee = product.price * 0.05; 
    const totalPriceWithAgent = product.price + agentFee;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] relative">
                <button onClick={onClose} className="absolute top-6 right-6 z-20 bg-white/80 backdrop-blur p-2 rounded-full text-gray-800 hover:bg-gray-100 transition shadow-sm md:hidden">✕</button>
                <div className="w-full md:w-5/12 bg-gray-50 flex flex-col items-center justify-center p-12 relative border-r border-gray-100">
                    <div className="w-64 h-96 bg-white rounded-[3rem] border-8 border-gray-200 shadow-2xl flex items-center justify-center transform hover:scale-105 transition duration-700 ease-out"><span className="text-gray-300 font-bold text-2xl tracking-widest">{product.brand}</span></div>
                    {product.isBU && <div className="absolute top-8 left-8 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-2"><span>🔥</span> BUTUH UANG CEPAT</div>}
                    <div className="absolute bottom-8 w-full px-8 text-center"><div className="bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border border-gray-200 inline-block"><span className="text-gray-500 text-xs font-bold uppercase tracking-wide">Lokasi Barang</span><p className="text-lg font-bold text-gray-900 mt-1">📍 {product.branchOrigin}</p></div></div>
                </div>
                <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col overflow-y-auto bg-white">
                    <div className="flex justify-between items-start mb-6"><div><div className="flex items-center gap-2 mb-2"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{product.category}</span><span className="text-gray-300">•</span><span className="text-gray-500 text-xs font-bold uppercase">{product.brand}</span></div><h2 className="text-4xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h2><div className="flex items-center gap-2"><div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">?</div><p className="text-gray-500 text-sm font-medium">Penjual: <span className="text-black underline cursor-pointer">@{getDisplayName(product.seller?.email)}</span></p></div></div><button onClick={onClose} className="hidden md:flex bg-gray-50 hover:bg-gray-100 w-10 h-10 rounded-full items-center justify-center text-gray-500 transition font-bold text-lg">✕</button></div>
                    <div className="my-6 py-6 border-t border-b border-gray-100"><h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">📝 Deskripsi & Kondisi</h3><div className="bg-gray-50 p-6 rounded-2xl border border-gray-100"><p className="text-gray-700 whitespace-pre-line leading-relaxed">{product.desc || "Penjual tidak menyertakan deskripsi detail. Harap cek fisik dengan teliti saat COD."}</p></div></div>
                    <div className="mt-auto space-y-6">
                        <div><p className="text-sm text-gray-400 font-bold uppercase tracking-wide mb-1">Harga Penawaran</p><div className="flex items-end gap-4"><p className="text-4xl font-bold text-gray-900 tracking-tight">{formatRupiah(product.price)}</p>{product.negotiable && <span className="mb-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Bisa Nego</span>}</div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => onBuy(product._id, product.price, 'cod_mandiri')} className="group p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition text-left relative overflow-hidden"><div className="relative z-10"><div className="font-bold text-gray-900 text-lg mb-1">🤝 COD Mandiri</div><div className="text-xs text-gray-500 font-medium">Ketemuan langsung dengan penjual.</div><div className="mt-3 font-bold text-gray-900 bg-white inline-block px-3 py-1 rounded-lg border shadow-sm">Total: {formatRupiah(product.price)}</div></div></button>
                            <button onClick={() => onBuy(product._id, product.price, 'cod_agent')} className="group p-4 rounded-2xl bg-black hover:bg-gray-800 transition text-left relative overflow-hidden shadow-xl"><div className="relative z-10"><div className="font-bold text-white text-lg mb-1 flex items-center gap-2">🛡️ COD Agent <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded text-white">Safe</span></div><div className="text-xs text-gray-400 font-medium">Verifikasi fisik oleh Tim GadgetHUB.</div><div className="mt-3 font-bold text-white bg-white/10 inline-block px-3 py-1 rounded-lg border border-white/20">Total: {formatRupiah(totalPriceWithAgent)}</div><p className="text-[10px] text-gray-500 mt-1 absolute right-0 bottom-0">*Termasuk Fee 5%</p></div></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// E. PRODUCT CARD COMPONENT
const ProductCard = ({ product, onClick }) => {
  return (
    <div onClick={() => onClick(product)} className="group bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer relative overflow-hidden h-full">
      {product.isBU && <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-br-2xl z-20 shadow-lg">⚡ LAGI BU</div>}
      <div className="flex justify-between items-start mb-4 mt-2 px-1"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">{product.branchOrigin}</span><span className="text-xs text-gray-400 font-medium flex items-center gap-1">👤 {getDisplayName(product.seller?.email)}</span></div>
      <div className="aspect-[4/5] bg-gray-50 rounded-3xl mb-5 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-100 transition-colors"><div className="w-24 h-40 bg-white rounded-2xl border-4 border-gray-200 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-500"><span className="text-gray-300 font-bold text-xs text-center px-2 leading-tight">{product.name}</span></div><div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center"><span className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition hover:bg-gray-50">Lihat Detail</span></div></div>
      <div className="flex-1 flex flex-col px-1"><h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1 line-clamp-1 group-hover:text-blue-600 transition">{product.name}</h3><p className="text-sm text-gray-500 font-medium mb-4 line-clamp-2 leading-relaxed">{product.desc || 'Tidak ada deskripsi.'}</p><div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50"><p className="text-lg font-bold text-gray-900">{formatRupiah(product.price)}</p>{product.negotiable && <span className="text-[10px] bg-green-50 text-green-700 px-2.5 py-1 rounded-lg font-bold border border-green-100">Nego</span>}</div></div>
    </div>
  );
};

// --- 4. DASHBOARD COMPONENTS ---

// A. ROOT DASHBOARD
const RootDashboard = ({ data }) => {
    const [report, setReport] = useState([]);
    useEffect(() => { axios.get('http://localhost:5000/api/report/root').then(res => { const formatted = res.data.map(item => ({ name: item._id, Omzet: item.total, Transaksi: item.count })); setReport(formatted); }); }, []);
    return (
        <div className="pt-28 px-8 max-w-7xl mx-auto pb-20">
            <div className="flex justify-between items-end mb-10"><div><h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Pusat (HQ)</h1><p className="text-gray-500 text-lg">Monitoring real-time performa penjualan 3 cabang utama.</p></div><div className="bg-green-50 text-green-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-green-100 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>System Operational</div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">{report.map((item) => (<div key={item.name} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition duration-300 group"><div className="flex justify-between items-start mb-6"><div><h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Cabang</h3><span className="text-lg font-bold text-gray-900">{item.name}</span></div><div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition">🏢</div></div><div className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">{formatRupiah(item.Omzet)}</div><div className="flex items-center gap-3"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">Success</span><span className="text-gray-500 text-sm font-medium">{item.Transaksi} Unit Terjual</span></div></div>))}{report.length === 0 && <div className="col-span-3 text-center text-gray-400 py-20 bg-white rounded-[2rem] border border-dashed">Belum ada data transaksi yang selesai (Completed).</div>}</div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 h-[600px] relative"><h3 className="font-bold text-2xl mb-8 text-gray-900">Grafik Perbandingan Omzet</h3><ResponsiveContainer width="100%" height="85%"><BarChart data={report} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 14, fontWeight: 'bold'}} dy={15} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `Rp${value/1000000}jt`} /><Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '20px'}} formatter={(value) => [<span className="font-bold text-lg text-gray-900">{formatRupiah(value)}</span>, "Total Omzet"]} labelStyle={{color: '#9CA3AF', marginBottom: '5px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}} /><Bar dataKey="Omzet" fill="#111827" radius={[12, 12, 0, 0]} barSize={80} animationDuration={1500} /></BarChart></ResponsiveContainer></div>
        </div>
    )
}

// B. ADMIN CABANG DASHBOARD
const BranchAdminDashboard = ({ data, updateStatus, user }) => (
    <div className="max-w-7xl mx-auto px-4 py-28 pb-20">
        <div className="flex justify-between items-center mb-10"><div><h1 className="text-4xl font-bold text-gray-900">Manajemen Cabang: <span className="text-blue-600">{user.branch}</span></h1><p className="text-gray-500 mt-2 text-lg">Kelola pesanan masuk dan penugasan agen lapangan.</p></div><div className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm">Total Order Aktif: <span className="text-blue-600 text-lg ml-2">{data.length}</span></div></div>
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-gray-50/50 border-b border-gray-100"><tr><th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Produk Info</th><th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Tipe Order</th><th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Status</th><th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Aksi Manajer</th></tr></thead>
        <tbody className="divide-y divide-gray-50">{data.map(tx => (<tr key={tx._id} className="hover:bg-gray-50/80 transition duration-200"><td className="p-6"><div className="font-bold text-gray-900 text-base">{tx.product?.name}</div><div className="text-sm text-gray-500 mt-1 font-medium">{formatRupiah(tx.totalPrice)}</div><div className="text-xs text-gray-400 mt-1">Buyer: {tx.buyer?.email}</div></td>
        <td className="p-6"><span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${tx.method === 'cod_agent' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{tx.method === 'cod_agent' ? '🛡️ Via Agent' : '🤝 Mandiri'}</span></td>
        <td className="p-6"><span className={`px-4 py-2 rounded-full text-xs font-bold ${tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : tx.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : tx.status === 'Verified' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{tx.status}</span></td>
        <td className="p-6"><div className="flex flex-col gap-2">
            {tx.method === 'cod_agent' && tx.status === 'Pending' && <button onClick={()=>updateStatus(tx._id, 'Assigned')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 w-fit">👉 Proses & Tugaskan Agent</button>}
            {tx.status === 'Assigned' && <span className="text-gray-400 text-xs italic font-medium flex items-center gap-2">🕒 Menunggu Laporan Agent...</span>}
            {tx.status === 'Verified' && <button onClick={()=>updateStatus(tx._id, 'Completed')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-md shadow-green-200 w-fit">✅ Konfirmasi & Cairkan Dana</button>}
            {tx.status === 'Completed' && <span className="text-green-600 font-bold text-xs flex items-center gap-1">✔ Transaksi Selesai</span>}
            {/* Admin tidak perlu acc COD Mandiri, hanya monitoring */}
            {tx.method === 'cod_mandiri' && <span className="text-gray-400 text-xs italic">Diproses User P2P</span>}
        </div></td></tr>))}</tbody></table>{data.length === 0 && <div className="p-16 text-center text-gray-400">Belum ada pesanan masuk di cabang ini.</div>}</div>
    </div>
)

// C. AGENT DASHBOARD
const AgentDashboard = ({ data, updateStatus, user }) => (
    <div className="max-w-7xl mx-auto px-4 py-28 pb-20">
        <h1 className="text-3xl font-bold mb-2">Tugas Lapangan: <span className="text-blue-600">{user.branch}</span></h1>
        <p className="text-gray-500 mb-10 text-lg">Daftar kunjungan COD yang perlu diverifikasi fisik.</p>
        <div className="grid gap-6 md:grid-cols-2">
            {data.length === 0 ? <div className="col-span-2 text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-300 text-gray-400 text-lg">Tidak ada tugas verifikasi saat ini. Santai dulu! ☕</div> 
            : data.map(tx => (<div key={tx._id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-lg transition relative overflow-hidden"><div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div><div className="flex justify-between items-start"><div><div className="flex items-center gap-3 mb-2"><span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Tugas Baru</span><span className="text-gray-400 text-xs font-medium">Order ID: #{tx._id.slice(-6)}</span></div><h3 className="font-bold text-2xl text-gray-900 mb-1">{tx.product?.name}</h3><p className="text-sm text-gray-500 mt-1">Pembeli: <span className="font-bold text-gray-700">{tx.buyer?.email}</span></p></div><div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase">Total Tagihan</p><p className="text-xl font-bold text-gray-900">{formatRupiah(tx.totalPrice)}</p><p className="text-xs text-green-600 font-bold mt-1 bg-green-50 px-2 py-1 rounded inline-block">Fee Anda: {formatRupiah(tx.agentFee)}</p></div></div><div className="flex gap-4 mt-auto"><button onClick={()=>updateStatus(tx._id, 'Rejected')} className="flex-1 px-6 py-4 border-2 border-red-100 text-red-600 rounded-2xl hover:bg-red-50 text-sm font-bold transition flex justify-center items-center gap-2">✕ Reject (Rusak)</button><button onClick={()=>updateStatus(tx._id, 'Verified')} className="flex-1 px-6 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 text-sm font-bold shadow-lg transition flex justify-center items-center gap-2 transform active:scale-95">✓ Barang Oke (Verified)</button></div></div>))}
        </div>
    </div>
)

// D. CUSTOMER MARKETPLACE (Dengan Filter Cabang & Card Style)
const CustomerMarketplace = ({ user, selectedBranch, setSelectedBranch, onProductClick }) => {
    const [products, setProducts] = useState([]);
    useEffect(() => { axios.get(`http://localhost:5000/api/products?branch=${selectedBranch}`).then(res => setProducts(res.data)); }, [selectedBranch]);
    return (
        <div className="pt-28 px-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6"><div><h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">Marketplace.</h1><p className="text-xl text-gray-500">Temukan gadget impianmu di <span className="text-black font-bold border-b-2 border-yellow-400">{selectedBranch === 'Semua' ? 'Seluruh Indonesia' : selectedBranch}</span>.</p></div><div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-2 w-full md:w-auto"><div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">🗺️</div><div className="flex-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lokasi Toko</p><select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer w-full"><option value="Semua">🌏 Semua Cabang</option>{CITIES.map(c => <option key={c} value={c}>📍 {c}</option>)}</select></div></div></div>
            {products.length === 0 ? (<div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-gray-300"><p className="text-gray-400 text-xl font-medium">Belum ada produk di cabang {selectedBranch} saat ini.</p><button onClick={() => setSelectedBranch('Semua')} className="mt-6 text-blue-600 font-bold text-lg hover:underline">Lihat Semua Cabang</button></div>) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">{products.map(p => (<ProductCard key={p._id} product={p} onClick={() => onProductClick(p)} />))}</div>)}
        </div>
    )
}

// --- 5. MAIN CONTAINER ---
const Dashboard = ({ user, handleLogout }) => {
    const [data, setData] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('Semua'); 
    
    // Modal States
    const [isSellModalOpen, setSellModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isMyOrderOpen, setMyOrderOpen] = useState(false); // Modal Pesanan Saya

    const refreshData = () => { if(user && user.role !== 'customer') axios.get(`http://localhost:5000/api/dashboard/${user.role}?branch=${user.branch || user.location}`).then(res => setData(res.data)); };
    useEffect(() => { refreshData(); }, [user]);

    const handleUpdateStatus = async (id, newStatus) => { if(!confirm(`Konfirmasi perubahan status menjadi ${newStatus}?`)) return; await axios.put(`http://localhost:5000/api/transactions/${id}/status`, { status: newStatus }); refreshData(); };

    const buyProduct = async (productId, price, method) => {
        if(!user) return alert("Silakan Login terlebih dahulu untuk membeli.");
        try {
            await axios.post('http://localhost:5000/api/transactions', { productId, buyerId: user.id, method });
            alert("Pesanan Berhasil Dibuat! Cek menu 'Pesanan Saya'.");
            refreshData();
            setSelectedProduct(null); 
        } catch(e) { 
            // Handle error jika beli barang sendiri
            alert(e.response?.data?.msg || "Gagal Membeli Barang"); 
        }
    }

    if (user?.role === 'root') return <div className="min-h-screen bg-[#F5F5F7]"><Navbar user={user} handleLogout={handleLogout}/><RootDashboard data={data}/></div>;
    if (user?.role === 'branch_admin') return <div className="min-h-screen bg-[#F5F5F7]"><Navbar user={user} handleLogout={handleLogout}/><BranchAdminDashboard data={data} updateStatus={handleUpdateStatus} user={user}/></div>;
    if (user?.role === 'agent') return <div className="min-h-screen bg-[#F5F5F7]"><Navbar user={user} handleLogout={handleLogout}/><AgentDashboard data={data} updateStatus={handleUpdateStatus} user={user}/></div>;

    // CUSTOMER / GUEST
    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            <Navbar user={user} handleLogout={handleLogout} onSellClick={() => setSellModalOpen(true)} selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} onMyOrdersClick={() => setMyOrderOpen(true)} />
            <SellModal isOpen={isSellModalOpen} onClose={() => setSellModalOpen(false)} user={user} />
            <UserOrdersModal isOpen={isMyOrderOpen} onClose={() => setMyOrderOpen(false)} user={user} />
            <ProductDetailModal isOpen={!!selectedProduct} product={selectedProduct} onClose={() => setSelectedProduct(null)} onBuy={buyProduct} />
            <CustomerMarketplace user={user} selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} onProductClick={setSelectedProduct} />
        </div>
    );
};

// --- 6. AUTH PAGES ---
const Login = ({ setUser }) => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [errorMsg, setErrorMsg] = useState('');
  const handleLogin = async (e) => { e.preventDefault(); setErrorMsg(''); try { const res = await axios.post('http://localhost:5000/api/login', { email, password }); setUser(res.data.user); localStorage.setItem('user', JSON.stringify(res.data.user)); } catch (err) { setErrorMsg('Login Gagal. Periksa Email/Password.'); } };
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="hidden md:flex w-1/2 bg-black relative justify-center items-center"><div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90"></div><div className="relative z-10 px-20 text-white"><h1 className="text-6xl font-bold mb-6 leading-tight">GadgetHUB.<br/><span className="text-blue-500">Trusted.</span></h1><p className="text-xl text-gray-400 font-light">Platform jual beli gadget dengan sistem verifikasi fisik oleh agen profesional di 3 kota besar.</p></div></div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-12 bg-white"><div className="w-full max-w-md space-y-10"><div><h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h2><p className="text-gray-500">Masuk untuk mengelola pesanan Anda.</p></div>{errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-bold flex items-center gap-2">⚠️ {errorMsg}</div>}<form onSubmit={handleLogin} className="space-y-6"><input className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:ring-0 transition outline-none font-medium" placeholder="Email Address" onChange={e=>setEmail(e.target.value)} /><input className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:ring-0 transition outline-none font-medium" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} /><button className="w-full bg-black text-white p-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition shadow-xl transform active:scale-95">Sign In</button></form><p className="text-center text-gray-500">Belum punya akun? <Link to="/register" className="font-bold text-black underline">Daftar sekarang</Link></p></div></div>
    </div>
  );
};

const Register = () => {
    const [email, setE] = useState(''); const [password, setP] = useState(''); const [loc, setL] = useState('Jakarta');
    const doReg = async (e) => { e.preventDefault(); try{ await axios.post('http://localhost:5000/api/register', {email, password, location: loc}); alert("Sukses! Silakan Login."); window.location.href='/login'; } catch(e){ alert("Gagal Daftar"); } }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-gray-100">
                <div className="text-center mb-10"><h2 className="text-4xl font-bold text-gray-900 mb-2">Buat Akun</h2><p className="text-gray-500">Bergabung dengan komunitas GadgetHUB.</p></div>
                <form onSubmit={doReg} className="space-y-5"><input className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition font-medium" placeholder="Email Aktif" onChange={e=>setE(e.target.value)} required /><input className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition font-medium" type="password" placeholder="Buat Password" onChange={e=>setP(e.target.value)} required /><div><label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Domisili (Untuk Agen Terdekat)</label><select className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-500 outline-none cursor-pointer font-bold text-gray-700" onChange={e=>setL(e.target.value)}>{CITIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div><button className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg mt-4 transform active:scale-95">Daftar Sekarang</button></form><p className="mt-8 text-center text-sm text-gray-500">Sudah punya akun? <Link to="/login" className="font-bold text-blue-600 hover:underline">Login disini</Link></p>
            </div>
        </div>
    )
}

// --- 7. APP ROOT ---
function App() {
  const [user, setUser] = useState(null);
  useEffect(() => { const u = localStorage.getItem('user'); if (u) setUser(JSON.parse(u)); }, []);
  const handleLogout = () => { setUser(null); localStorage.removeItem('user'); window.location.href='/login'; };
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard user={user} handleLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;