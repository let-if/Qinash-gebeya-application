
// import React, { useEffect, useState, useRef } from 'react';
// import { 
//   ShoppingBag, 
//   CreditCard, 
//   PlusCircle, 
//   FolderPlus, 
//   Tv, 
//   Users, 
//   LogOut, 
//   Upload, 
//   Trash2, 
//   AlertTriangle, 
//   ShieldCheck, 
//   RefreshCw, 
//   X,
//   CheckCircle,
//   Ban,
//   Film,
//   Image as ImageIcon
// } from 'lucide-react';
// import { useAdminAuth } from '../context/AdminAuthContext';
// import api from '../api/client';

// const ALL_SYSTEM_TABS = [
//   { id: 'orders', name: 'ትእዛዞች (Orders)', icon: ShoppingBag },
//   { id: 'credit', name: 'የብድር ጥያቄዎች (Credit)', icon: CreditCard },
//   { id: 'products', name: 'እቃዎችና ክምችት (Products)', icon: PlusCircle },
//   { id: 'categories', name: 'ምድቦች (Categories)', icon: FolderPlus },
//   { id: 'ads', name: 'ማስታወቂያዎች (Ad Studio)', icon: Tv },
//   { id: 'users', name: 'ተጠቃሚዎችና ፍቃድ (Users)', icon: Users },
// ];

// export default function Dashboard() {
//   const { admin, logout } = useAdminAuth();

//   const [orders, setOrders] = useState([]);
//   const [creditOrders, setCreditOrders] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [banners, setBanners] = useState([]);
//   const [usersList, setUsersList] = useState([]);

//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [uploadingSlot, setUploadingSlot] = useState(null); // 'prod', 'slot0', 'slot1', 'slot2', 'editProd'

//   // 3-Slot Media Banner State
//   const [adForm, setAdForm] = useState({
//     title: '',
//     actionLink: '',
//     mediaSlots: [
//       { url: '', type: 'IMAGE' },
//       { url: '', type: 'IMAGE' },
//       { url: '', type: 'IMAGE' },
//     ],
//   });

//   const [catForm, setCatForm] = useState({ nameAm: '', nameOm: '', iconUrl: '' });

//   // Product Form with 4-Tier Pricing Options
//   const [prodForm, setProdForm] = useState({
//     nameAm: '',
//     nameOm: '',
//     categoryId: '',
//     pricePerUnit: '',
//     actualStock: '50',
//     postedStock: '100',
//     imageUrl: '',
//     allowsHalfCarton: false,
//     priceHalfCarton: '',
//     allowsHalfDozen: false,
//     priceHalfDozen: '',
//     allowsPacket: false,
//     pricePacket: '',
//   });

//   const [userForm, setUserForm] = useState({
//     phoneNumber: '',
//     shopName: '',
//     password: '',
//     role: 'ADMIN',
//     allowedTabs: ['orders', 'products'],
//   });

//   const [editingProduct, setEditingProduct] = useState(null);
//   const [restockModal, setRestockModal] = useState({ open: false, productId: null, productName: '', addedStock: '20' });
//   const [permModal, setPermModal] = useState({ open: false, userId: null, shopName: '', allowedTabs: [] });

//   const isSuperAdmin = admin?.role === 'SUPERADMIN' || admin?.phone === '0911000000' || admin?.phone === '+251911000000' || admin?.phoneNumber === '0911000000';
//   const userAllowedTabs = isSuperAdmin
//     ? ALL_SYSTEM_TABS.map((t) => t.id)
//     : (Array.isArray(admin?.allowedTabs) && admin.allowedTabs.length > 0 ? admin.allowedTabs : ['orders']);

//   const visibleNavTabs = ALL_SYSTEM_TABS.filter((tab) => userAllowedTabs.includes(tab.id));
//   const [activeTab, setActiveTab] = useState(visibleNavTabs[0]?.id || 'orders');

//   useEffect(() => {
//     if (!userAllowedTabs.includes(activeTab) && visibleNavTabs.length > 0) {
//       setActiveTab(visibleNavTabs[0].id);
//     }
//   }, [userAllowedTabs, activeTab]);

//   // Silent Data Loading / Polling
//   const loadData = async (showSpinner = false) => {
//     if (showSpinner) setIsRefreshing(true);
//     try {
//       const [ordRes, credRes, catRes, prodRes, banRes, usrRes] = await Promise.all([
//         api.get('/orders').catch(() => ({ data: [] })),
//         api.get('/orders/credit-requests').catch(() => ({ data: { creditOrders: [] } })),
//         api.get('/admin/categories').catch(() => ({ data: [] })),
//         api.get('/admin/products').catch(() => ({ data: [] })),
//         api.get('/admin/banners').catch(() => ({ data: [] })),
//         api.get('/admin/users').catch(() => ({ data: [] })),
//       ]);

//       const rawOrders = ordRes.data?.orders || (Array.isArray(ordRes.data) ? ordRes.data : []);
//       setOrders(rawOrders.filter((o) => !o.isCreditOrder));
//       setCreditOrders(credRes.data?.creditOrders || []);
//       setCategories(catRes.data || []);

//       const rawProducts = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.products || []);
//       setProducts(rawProducts);

//       setBanners(banRes.data || []);
//       setUsersList(usrRes.data || []);
//     } catch (err) {
//       console.error('Silent sync error:', err);
//     } finally {
//       if (showSpinner) setIsRefreshing(false);
//     }
//   };

//   // 1. Initial Load & 2. Automatic Live Background Refresh Polling
//   useEffect(() => {
//     loadData(true);

//     // Auto-poll silently every 6 seconds without flickering or browser refreshing
//     const timer = setInterval(() => {
//       loadData(false);
//     }, 6000);

//     return () => clearInterval(timer);
//   }, []);

//   // Universal Media File Upload Handler
//   const handleFileUpload = async (file, slotKey, onSuccess) => {
//     if (!file) return;
//     setUploadingSlot(slotKey);
//     const fd = new FormData();
//     fd.append('file', file);
//     try {
//       const res = await api.post('/admin/upload', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       onSuccess(res.data.url, res.data.mediaType || 'IMAGE');
//     } catch (err) {
//       alert('ስቀቱ አልተሳካም: ' + (err.response?.data?.error || err.message));
//     } finally {
//       setUploadingSlot(null);
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       await api.patch('/orders/' + orderId + '/status', { status: newStatus });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleApproveCredit = async (orderId, approved) => {
//     try {
//       await api.patch('/orders/' + orderId + '/approve-credit', { approved });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleSettleCredit = async (orderId) => {
//     if (!window.confirm('ይህ ብድር ሙሉ በሙሉ መከፈሉን አረጋግጠዋል? የባለሱቁ የብድር ጣሪያ ይመለሳል።')) return;
//     try {
//       await api.patch('/orders/' + orderId + '/settle-credit');
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleRestockSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.patch('/admin/products/' + restockModal.productId + '/restock', {
//         addedStock: Number(restockModal.addedStock),
//       });
//       alert('ክምችቱ ተሞልቷል!');
//       setRestockModal({ open: false, productId: null, productName: '', addedStock: '20' });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   // Safe pre-fill keeping all 4 price tiers strictly separated
//   const startEditingProduct = (p) => {
//     const rawActual = p.actualStock !== undefined && p.actualStock !== null ? p.actualStock : (p.currentStock ?? 50);
//     const rawPosted = p.postedStock !== undefined && p.postedStock !== null ? p.postedStock : (p.currentStock ?? 100);

//     setEditingProduct({
//       id: p.id,
//       categoryId: p.categoryId || p.category?.id || '',
//       nameAm: p.nameAm || '',
//       nameOm: p.nameOm || '',
//       pricePerUnit: String(p.pricePerUnit || ''),
//       actualStock: String(rawActual),
//       postedStock: String(rawPosted),
//       imageUrl: p.imageUrl || '',
//       allowsHalfCarton: Boolean(p.allowsHalfCarton),
//       priceHalfCarton: p.priceHalfCarton ? String(p.priceHalfCarton) : '',
//       allowsHalfDozen: Boolean(p.allowsHalfDozen),
//       priceHalfDozen: p.priceHalfDozen ? String(p.priceHalfDozen) : '',
//       allowsPacket: Boolean(p.allowsPacket),
//       pricePacket: p.pricePacket ? String(p.pricePacket) : '',
//     });
//   };

//   const handleSaveEditProduct = async (e) => {
//     e.preventDefault();
//     try {
//       const actVal = Number(editingProduct.actualStock);
//       const postVal = Number(editingProduct.postedStock);

//       const res = await api.put('/admin/products/' + editingProduct.id, {
//         categoryId: editingProduct.categoryId,
//         nameAm: editingProduct.nameAm,
//         nameOm: editingProduct.nameOm,
//         imageUrl: editingProduct.imageUrl,
//         pricePerUnit: Number(editingProduct.pricePerUnit),
//         actualStock: isNaN(actVal) ? 0 : actVal,
//         postedStock: isNaN(postVal) ? 0 : postVal,
//         allowsHalfCarton: Boolean(editingProduct.allowsHalfCarton),
//         priceHalfCarton: editingProduct.priceHalfCarton ? Number(editingProduct.priceHalfCarton) : null,
//         allowsHalfDozen: Boolean(editingProduct.allowsHalfDozen),
//         priceHalfDozen: editingProduct.priceHalfDozen ? Number(editingProduct.priceHalfDozen) : null,
//         allowsPacket: Boolean(editingProduct.allowsPacket),
//         pricePacket: editingProduct.pricePacket ? Number(editingProduct.pricePacket) : null,
//       });

//       setProducts((prev) =>
//         prev.map((item) =>
//           item.id === editingProduct.id
//             ? { ...item, ...(res.data?.product || {}), actualStock: actVal, postedStock: postVal }
//             : item
//         )
//       );

//       alert('ምርቱ በተሳካ ሁኔታ ተስተካክሏል!');
//       setEditingProduct(null);
//       loadData(false);
//     } catch (err) {
//       alert('ማስተካከል አልተቻለም: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const deleteProduct = async (productId, productName) => {
//     if (!window.confirm('ምርቱን (' + productName + ') መሰረዝ ይፈልጋሉ?')) return;
//     try {
//       await api.delete('/admin/products/' + productId);
//       alert('ምርቱ ተሰርዟል!');
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const submitProduct = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/admin/products', {
//         ...prodForm,
//         pricePerUnit: Number(prodForm.pricePerUnit),
//         actualStock: Number(prodForm.actualStock),
//         postedStock: Number(prodForm.postedStock),
//         allowsHalfCarton: Boolean(prodForm.allowsHalfCarton),
//         priceHalfCarton: prodForm.priceHalfCarton ? Number(prodForm.priceHalfCarton) : null,
//         allowsHalfDozen: Boolean(prodForm.allowsHalfDozen),
//         priceHalfDozen: prodForm.priceHalfDozen ? Number(prodForm.priceHalfDozen) : null,
//         allowsPacket: Boolean(prodForm.allowsPacket),
//         pricePacket: prodForm.pricePacket ? Number(prodForm.pricePacket) : null,
//       });
//       alert('ምርቱ ተመዝግቧል!');
//       setProdForm({
//         nameAm: '',
//         nameOm: '',
//         categoryId: '',
//         pricePerUnit: '',
//         actualStock: '50',
//         postedStock: '100',
//         imageUrl: '',
//         allowsHalfCarton: false,
//         priceHalfCarton: '',
//         allowsHalfDozen: false,
//         priceHalfDozen: '',
//         allowsPacket: false,
//         pricePacket: '',
//       });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const submitCategory = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/admin/categories', catForm);
//       alert('ምድቡ ተመዝግቧል!');
//       setCatForm({ nameAm: '', nameOm: '', iconUrl: '' });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const deleteCategory = async (categoryId, categoryName) => {
//     if (!window.confirm('ይህን ምድብ (' + categoryName + ') ሲሰርዙ በውስጡ ያሉ እቃዎች በሙሉ ይሰረዛሉ። እርግጠኛ ነዎት?')) return;
//     try {
//       await api.delete('/admin/categories/' + categoryId);
//       alert('ምድቡ ተሰርዟል!');
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   // 3-Slot Banner Submission
//   const submitBanner = async (e) => {
//     e.preventDefault();
//     const activeMedia = adForm.mediaSlots.filter((s) => s.url.trim().length > 0);
//     if (activeMedia.length === 0) {
//       alert('እባክዎ ቢያንስ 1 ምስል ወይም ቪዲዮ ይስቀሉ');
//       return;
//     }
//     try {
//       const mediaUrls = activeMedia.map((m) => m.url);
//       const mediaTypes = activeMedia.map((m) => m.type);

//       await api.post('/admin/banners', {
//         title: adForm.title,
//         actionLink: adForm.actionLink,
//         mediaUrl: mediaUrls[0],
//         mediaType: mediaTypes[0],
//         mediaUrls,
//         mediaTypes,
//       });

//       alert('ማስታወቂያው ተለቋል!');
//       setAdForm({
//         title: '',
//         actionLink: '',
//         mediaSlots: [
//           { url: '', type: 'IMAGE' },
//           { url: '', type: 'IMAGE' },
//           { url: '', type: 'IMAGE' },
//         ],
//       });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   // Change User Status (Blocks Login When Set to REJECTED)
//   const changeUserApproval = async (id, status) => {
//     try {
//       await api.patch('/admin/users/' + id + '/approval', { status });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const submitUser = async (e) => {
//     e.preventDefault();
//     if (userForm.allowedTabs.length === 0) {
//       alert('እባክዎ ቢያንስ አንድ የሚፈቀድ ገጽ ይምረጡ');
//       return;
//     }
//     try {
//       await api.post('/admin/users', userForm);
//       alert('አዲሱ አስተዳዳሪ ተመዝግቧል!');
//       setUserForm({
//         phoneNumber: '',
//         shopName: '',
//         password: '',
//         role: 'ADMIN',
//         allowedTabs: ['orders', 'products'],
//       });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleSavePermissions = async (e) => {
//     e.preventDefault();
//     try {
//       await api.patch('/admin/users/' + permModal.userId + '/permissions', {
//         allowedTabs: permModal.allowedTabs,
//       });
//       alert('ፍቃዱ ተስተካክሏል!');
//       setPermModal({ open: false, userId: null, shopName: '', allowedTabs: [] });
//       loadData(false);
//     } catch (err) {
//       alert('ስህተት: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const toggleTabInCreation = (tabId) => {
//     setUserForm((prev) => {
//       const exists = prev.allowedTabs.includes(tabId);
//       return {
//         ...prev,
//         allowedTabs: exists ? prev.allowedTabs.filter((id) => id !== tabId) : [...prev.allowedTabs, tabId],
//       };
//     });
//   };

//   const toggleTabInEdit = (tabId) => {
//     setPermModal((prev) => {
//       const exists = prev.allowedTabs.includes(tabId);
//       return {
//         ...prev,
//         allowedTabs: exists ? prev.allowedTabs.filter((id) => id !== tabId) : [...prev.allowedTabs, tabId],
//       };
//     });
//   };

//   const lowStockCount = products.filter((p) => {
//     const act = p.actualStock !== undefined && p.actualStock !== null ? Number(p.actualStock) : Number(p.currentStock ?? 0);
//     return act < 5;
//   }).length;

//   const pendingCreditCount = creditOrders.filter((c) => c.creditApproved === null).length;

//   return React.createElement(
//     'div',
//     { className: 'flex h-screen bg-gradient-to-br from-[#F5F7F3] via-[#F7FAF5] to-[#EBF3EC] overflow-hidden' },

//     // SIDEBAR
//     React.createElement(
//       'aside',
//       { className: 'w-72 border-r border-[#E6ECE7] bg-white/95 backdrop-blur flex flex-col justify-between shrink-0 select-none shadow-[2px_0_20px_rgba(18,36,26,0.05)] z-10' },
//       React.createElement(
//         'div',
//         { className: 'flex flex-col min-h-0 flex-1' },
//         React.createElement(
//           'div',
//           { className: 'h-16 flex items-center gap-3 px-6 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] shrink-0' },
//           React.createElement('div', { className: 'h-10 w-10 bg-gradient-to-br from-[#17A06A] to-[#0F7B4A] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#0F7B4A]/30 ring-1 ring-white/20' }, 'ቅገ'),
//           React.createElement(
//             'div',
//             null,
//             React.createElement('h1', { className: 'text-sm font-black text-[#12241A] tracking-tight' }, 'ቅናሽ ገበያ'),
//             React.createElement('p', { className: 'text-[11px] font-bold text-[#62726A]' }, isSuperAdmin ? 'Main Superadmin' : 'Authorized Admin')
//           )
//         ),
//         React.createElement(
//           'nav',
//           { className: 'p-4 space-y-1.5 overflow-y-auto' },
//           visibleNavTabs.map((item) => {
//             const Icon = item.icon;
//             const isActive = activeTab === item.id;
//             const count = item.id === 'orders' ? orders.length
//               : item.id === 'credit' ? creditOrders.length
//               : item.id === 'products' ? products.length
//               : item.id === 'categories' ? categories.length
//               : item.id === 'ads' ? banners.length
//               : usersList.length;

//             const alertBadge = item.id === 'products' ? lowStockCount
//               : item.id === 'credit' ? pendingCreditCount
//               : 0;

//             return React.createElement(
//               'button',
//               {
//                 key: item.id,
//                 onClick: () => setActiveTab(item.id),
//                 className: 'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ' +
//                   (isActive
//                     ? 'bg-gradient-to-r from-[#E4F2EA] to-[#F1F9F3] text-[#0F7B4A] shadow-sm shadow-[#0F7B4A]/10 ring-1 ring-[#0F7B4A]/15'
//                     : 'text-[#62726A] hover:bg-[#F2F7F3] hover:text-[#0F7B4A] hover:translate-x-0.5')
//               },
//               React.createElement(
//                 'div',
//                 { className: 'flex items-center gap-3' },
//                 React.createElement(Icon, { className: 'h-4 w-4 transition-colors duration-200 ' + (isActive ? 'text-[#0F7B4A] drop-shadow-sm' : 'text-[#8DA396]') }),
//                 React.createElement('span', null, item.name)
//               ),
//               React.createElement(
//                 'div',
//                 { className: 'flex items-center gap-1.5' },
//                 alertBadge > 0 ? React.createElement(
//                   'span',
//                   { className: 'px-1.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-b from-red-500 to-red-600 text-white animate-pulse shadow-md shadow-red-500/40 ring-2 ring-white' },
//                   alertBadge
//                 ) : null,
//                 React.createElement(
//                   'span',
//                   { className: 'px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors duration-200 ' + (isActive ? 'bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] text-white shadow-sm shadow-[#0F7B4A]/30' : 'bg-[#F1F5F2] text-[#62726A] ring-1 ring-[#E6ECE7]') },
//                   count
//                 )
//               )
//             );
//           })
//         )
//       ),
//       React.createElement(
//         'div',
//         { className: 'p-4 border-t border-[#E6ECE7] bg-gradient-to-t from-[#FAFCFA] to-white shrink-0' },
//         React.createElement(
//           'button',
//           { onClick: logout, className: 'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black text-red-600 ring-1 ring-transparent hover:ring-red-100 hover:bg-red-50 hover:shadow-sm active:scale-[0.98] cursor-pointer transition-all duration-200' },
//           React.createElement(LogOut, { className: 'h-4 w-4' }),
//           React.createElement('span', null, 'ከአካውንት ውጣ (Sign Out)')
//         )
//       )
//     ),

//     // MAIN VIEWPORT
//     React.createElement(
//       'div',
//       { className: 'flex-1 flex flex-col min-w-0 overflow-hidden' },
//       React.createElement(
//         'header',
//         { className: 'h-16 bg-white/80 backdrop-blur-md border-b border-[#E6ECE7] px-8 flex items-center justify-between shrink-0 shadow-sm shadow-[#12241A]/[0.03]' },
//         React.createElement(
//           'div',
//           { className: 'flex items-center gap-3' },
//           React.createElement('div', { className: 'h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/15' }),
//           React.createElement('div', { className: 'font-black text-xs text-[#12241A]' }, 'የአዳማ ማዕከል ቀጥታ መስመር (Live Sync)'),
//           pendingCreditCount > 0 ? React.createElement(
//             'div',
//             { className: 'text-[11px] font-black bg-gradient-to-b from-amber-50 to-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-sm shadow-amber-500/15' },
//             '💳 ' + pendingCreditCount + ' የብድር ጥያቄዎች'
//           ) : null,
//           lowStockCount > 0 ? React.createElement(
//             'div',
//             { className: 'text-[11px] font-black bg-gradient-to-b from-red-50 to-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 shadow-sm shadow-red-500/15' },
//             '⚠ ' + lowStockCount + ' እቃዎች መጋዘን አልቀዋል'
//           ) : null,
//           React.createElement(
//             'button',
//             {
//               onClick: () => loadData(true),
//               title: 'Manual Sync',
//               className: 'p-1.5 hover:bg-[#E4F2EA] rounded-lg cursor-pointer text-gray-500 hover:text-[#0F7B4A] transition-all duration-300'
//             },
//             React.createElement(RefreshCw, { className: 'h-3.5 w-3.5 ' + (isRefreshing ? 'animate-spin text-[#0F7B4A]' : '') })
//           )
//         ),
//         React.createElement('div', { className: 'text-xs font-black text-[#0F7B4A] bg-gradient-to-b from-[#E4F2EA] to-[#D8ECDF] px-3 py-1.5 rounded-full ring-1 ring-[#0F7B4A]/15 shadow-sm' }, admin?.phone || admin?.phoneNumber || '0911000000')
//       ),

//       React.createElement(
//         'main',
//         { className: 'flex-1 p-8 overflow-y-auto scroll-smooth' },
//         React.createElement(
//           'div',
//           { className: 'max-w-6xl mx-auto space-y-6' },

//           // ==========================================
//           // TAB: ORDERS
//           // ==========================================
//           activeTab === 'orders' ? React.createElement(
//             'div',
//             { className: 'space-y-4' },
//             React.createElement(
//               'div',
//               { className: 'flex justify-between items-center' },
//               React.createElement('h2', { className: 'text-base font-black text-[#12241A] tracking-tight' }, 'የገቡ ትእዛዞች ዝርዝር (Standard Orders - ' + orders.length + ')'),
//               React.createElement('span', { className: 'text-xs text-[#62726A] font-semibold bg-white border border-[#E6ECE7] px-3 py-1.5 rounded-full shadow-sm' }, 'ጠቅላላ ሽያጭ: ' + orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString() + ' ብር')
//             ),
//             orders.length === 0 ? React.createElement('div', { className: 'bg-white p-12 text-center rounded-2xl border border-[#E6ECE7] shadow-sm text-xs text-[#62726A] font-semibold' }, 'ምንም የገባ ትእዛዝ የለም') :
//             React.createElement(
//               'div',
//               { className: 'space-y-3' },
//               orders.map((o) => {
//                 const items = o.items || o.orderItems || [];
//                 const isPending = o.status === 'PENDING';
//                 const isApproved = o.status === 'APPROVED' || o.status === 'CONFIRMED';
//                 const isDispatched = o.status === 'DISPATCHED';

//                 return React.createElement(
//                   'div',
//                   { key: o.id, className: 'bg-gradient-to-b from-white to-[#FCFDFB] p-5 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-lg hover:shadow-[#12241A]/[0.07] hover:border-[#CFE7D9] transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4' },
//                   React.createElement(
//                     'div',
//                     { className: 'space-y-2 flex-1' },
//                     React.createElement(
//                       'div',
//                       { className: 'flex items-center gap-3 flex-wrap' },
//                       React.createElement('span', { className: 'font-black text-sm text-[#12241A]' }, o.user?.shopName || 'ሱቅ'),
//                       React.createElement('span', { className: 'text-xs text-[#62726A] font-semibold' }, '📞 ' + (o.user?.phoneNumber || '')),
//                       React.createElement('span', { className: 'text-[11px] px-2.5 py-0.5 rounded-full font-bold ring-1 shadow-sm ' + 
//                         (isApproved ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 
//                          isDispatched ? 'bg-blue-100 text-blue-700 ring-blue-200' : 
//                          o.status === 'CANCELLED' ? 'bg-red-100 text-red-700 ring-red-200' : 'bg-amber-100 text-amber-700 ring-amber-200')
//                       }, isPending ? '⏳ በመጠባበቅ ላይ' : isApproved ? '✅ የጸደቀ' : isDispatched ? '🚚 በመንገድ ላይ' : o.status)
//                     ),
//                     React.createElement(
//                       'div',
//                       { className: 'text-xs text-[#62726A] flex gap-4 font-semibold' },
//                       React.createElement('span', null, 'የማድረሻ ሰዓት: ' + (o.deliverySlot === 'BATCH_6AM' ? '🌅 ጠዋት 6:00' : '☀️ ቀትር 12:00')),
//                       React.createElement('span', null, 'ቀን: ' + new Date(o.createdAt).toLocaleDateString('am-ET'))
//                     ),
//                     React.createElement(
//                       'div',
//                       { className: 'text-xs bg-gradient-to-b from-[#F9FBF8] to-[#F4F8F4] p-2.5 rounded-xl border border-[#EEF2EE] space-y-1' },
//                       items.map((it, idx) => React.createElement(
//                         'div',
//                         { key: idx, className: 'flex justify-between text-[#334155]' },
//                         React.createElement('span', null, '• ' + (it.product?.nameAm || 'እቃ') + ' (' + it.quantity + ' ' + (it.selectedUnit || it.unitType || 'ካርቶን') + ')'),
//                         React.createElement('span', { className: 'font-bold' }, (Number(it.unitPrice) * Number(it.quantity)).toLocaleString() + ' ብር')
//                       ))
//                     )
//                   ),
//                   React.createElement(
//                     'div',
//                     { className: 'flex flex-col md:items-end gap-2 w-full md:w-auto shrink-0' },
//                     React.createElement('div', { className: 'font-black text-lg text-[#0F7B4A] drop-shadow-sm' }, Number(o.totalAmount || 0).toLocaleString() + ' ብር'),
//                     React.createElement(
//                       'div',
//                       { className: 'flex gap-2' },
//                       isPending ? React.createElement(
//                         'button',
//                         {
//                           onClick: () => updateOrderStatus(o.id, 'APPROVED'),
//                           className: 'px-3.5 py-1.5 bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] hover:from-[#0F7B4A] hover:to-[#0c653d] text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-[#0F7B4A]/25 hover:shadow-lg hover:shadow-[#0F7B4A]/40 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200'
//                         },
//                         'አጽድቅ (Approve)'
//                       ) : null,
//                       isApproved ? React.createElement(
//                         'button',
//                         {
//                           onClick: () => updateOrderStatus(o.id, 'DISPATCHED'),
//                           className: 'px-3.5 py-1.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200'
//                         },
//                         'ላክ (Dispatch)'
//                       ) : null,
//                       isPending || isApproved ? React.createElement(
//                         'button',
//                         {
//                           onClick: () => updateOrderStatus(o.id, 'CANCELLED'),
//                           className: 'px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold cursor-pointer ring-1 ring-red-100 hover:ring-red-200 active:scale-[0.98] transition-all duration-200'
//                         },
//                         'ሰርዝ (Cancel)'
//                       ) : null
//                     )
//                   )
//                 );
//               })
//             )
//           ) : null,

//           // ==========================================
//           // TAB: CREDIT REQUESTS
//           // ==========================================
//           activeTab === 'credit' ? React.createElement(
//             'div',
//             { className: 'space-y-4' },
//             React.createElement(
//               'div',
//               { className: 'flex justify-between items-center' },
//               React.createElement('h2', { className: 'text-base font-black text-[#12241A] tracking-tight' }, 'የብድር ጥያቄዎችና ሂሳብ መዝገብ (Credit Ledger - ' + creditOrders.length + ')'),
//               React.createElement('span', { className: 'text-xs text-amber-700 font-bold' }, '*ፈቃድ የተሰጠው ብድር ሲከፈል "ተከፍሏል" የሚለውን ይጫኑ')
//             ),
//             creditOrders.length === 0 ? React.createElement('div', { className: 'bg-white p-12 text-center rounded-2xl border border-[#E6ECE7] shadow-sm text-xs text-[#62726A] font-semibold' }, 'ምንም የብድር ጥያቄ የለም') :
//             React.createElement(
//               'div',
//               { className: 'space-y-3' },
//               creditOrders.map((co) => {
//                 const items = co.items || co.orderItems || [];
//                 const isPaid = co.isCreditSettled === true;
//                 const isApproved = co.creditApproved === true && !isPaid;
//                 const isRejected = co.creditApproved === false;
//                 const isWaiting = co.creditApproved === null;

//                 const limit = Number(co.user?.creditLimit || 20000);
//                 const used = Number(co.user?.usedCredit || 0);
//                 const remaining = limit - used;

//                 return React.createElement(
//                   'div',
//                   { key: co.id, className: 'bg-gradient-to-b from-white to-[#FCFDFB] p-5 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-lg hover:shadow-[#12241A]/[0.07] hover:border-[#CFE7D9] transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4' },
//                   React.createElement(
//                     'div',
//                     { className: 'space-y-2 flex-1' },
//                     React.createElement(
//                       'div',
//                       { className: 'flex items-center gap-3 flex-wrap' },
//                       React.createElement('span', { className: 'font-black text-sm text-[#12241A]' }, co.user?.shopName || 'ሱቅ'),
//                       React.createElement('span', { className: 'text-xs text-[#62726A] font-semibold' }, '📞 ' + (co.user?.phoneNumber || '')),
//                       React.createElement('span', { className: 'text-[11px] px-2.5 py-0.5 rounded-full font-black ring-1 shadow-sm ' +
//                         (isPaid ? 'bg-blue-100 text-blue-800 ring-blue-200' :
//                          isApproved ? 'bg-emerald-100 text-emerald-800 ring-emerald-200' :
//                          isRejected ? 'bg-red-100 text-red-700 ring-red-200' : 'bg-amber-100 text-amber-800 ring-amber-200 animate-pulse')
//                       }, isPaid ? '✅ ተከፍሏል (Paid)' : isApproved ? '✔ ተፈቅዷል (Allowed)' : isRejected ? '❌ ውድቅ የተደረገ' : '⏳ ፈቃድ በመጠባበቅ ላይ')
//                     ),
//                     React.createElement(
//                       'div',
//                       { className: 'text-xs flex gap-6 text-[#62726A] flex-wrap' },
//                       React.createElement('span', null, 'የብድር ጣሪያ: ' + limit.toLocaleString() + ' ብር'),
//                       React.createElement('span', null, 'የተወሰደ: ' + used.toLocaleString() + ' ብር'),
//                       React.createElement('span', { className: 'font-bold text-[#0F7B4A]' }, 'የቀረ ጣሪያ: ' + remaining.toLocaleString() + ' ብር')
//                     ),
//                     React.createElement(
//                       'div',
//                       { className: 'text-xs bg-gradient-to-b from-[#F9FBF8] to-[#F4F8F4] p-2.5 rounded-xl border border-[#EEF2EE] space-y-1' },
//                       items.map((it, idx) => React.createElement(
//                         'div',
//                         { key: idx, className: 'flex justify-between text-[#334155]' },
//                         React.createElement('span', null, '• ' + (it.product?.nameAm || 'እቃ') + ' (' + it.quantity + ' ' + (it.selectedUnit || it.unitType || 'ካርቶን') + ')'),
//                         React.createElement('span', { className: 'font-bold' }, (Number(it.unitPrice) * Number(it.quantity)).toLocaleString() + ' ብር')
//                       ))
//                     )
//                   ),
//                   React.createElement(
//                     'div',
//                     { className: 'flex flex-col md:items-end gap-2 w-full md:w-auto shrink-0' },
//                     React.createElement('div', { className: 'font-black text-lg drop-shadow-sm ' + (isPaid ? 'text-blue-700' : 'text-amber-700') },
//                       Number(co.totalAmount || 0).toLocaleString() + ' ብር ' + (isPaid ? '(የተከፈለ)' : '(በብድር)')
//                     ),
//                     isWaiting ? React.createElement(
//                       'div',
//                       { className: 'flex gap-2' },
//                       React.createElement(
//                         'button',
//                         {
//                           onClick: () => handleApproveCredit(co.id, true),
//                           className: 'px-3.5 py-1.5 bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] hover:from-[#0F7B4A] hover:to-[#0c653d] text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-[#0F7B4A]/25 hover:shadow-lg hover:shadow-[#0F7B4A]/40 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200'
//                         },
//                         'ፍቀድ (Approve)'
//                       ),
//                       React.createElement(
//                         'button',
//                         {
//                           onClick: () => handleApproveCredit(co.id, false),
//                           className: 'px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold cursor-pointer ring-1 ring-red-100 hover:ring-red-200 active:scale-[0.98] transition-all duration-200'
//                         },
//                         'ከልክል (Reject)'
//                       )
//                     ) : isApproved ? React.createElement(
//                       'button',
//                       {
//                         onClick: () => handleSettleCredit(co.id),
//                         className: 'px-3.5 py-1.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/45 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200'
//                       },
//                       'ተከፍሏል (Mark as Paid)'
//                     ) : React.createElement(
//                       'span',
//                       { className: 'text-xs font-black ' + (isPaid ? 'text-blue-600' : 'text-gray-400') },
//                       isPaid ? 'ክፍያው ተጠናቋል ✔' : 'ውድቅ ተደርጓል ✕'
//                     )
//                   )
//                 );
//               })
//             )
//           ) : null,

//           // ==========================================
//           // TAB: PRODUCTS (With 4-Tier Breakdown Pricing)
//           // ==========================================
//           activeTab === 'products' ? React.createElement(
//             'div',
//             { className: 'space-y-6' },
//             React.createElement(
//               'form',
//               { onSubmit: submitProduct, className: 'bg-white p-6 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-md hover:shadow-[#12241A]/[0.05] transition-shadow duration-300 space-y-4' },
//               React.createElement('h2', { className: 'text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ እቃ ወደ መጋዘን መመዝገቢያ (Add Product with Tiered Pricing)'),
//               React.createElement(
//                 'div',
//                 { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
//                 React.createElement(
//                   'select',
//                   {
//                     value: prodForm.categoryId,
//                     required: true,
//                     onChange: (e) => setProdForm({ ...prodForm, categoryId: e.target.value }),
//                     className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs font-semibold outline-none transition-all duration-200 hover:border-[#9CC5AE] focus:border-[#0F7B4A] focus:ring-4 focus:ring-[#0F7B4A]/10'
//                   },
//                   React.createElement('option', { value: '' }, '-- ምድብ ይምረጡ (Select Category) --'),
//                   categories.map((c) => React.createElement('option', { key: c.id, value: c.id }, c.nameAm))
//                 ),
//                 React.createElement('input', {
//                   type: 'text',
//                   placeholder: 'የእቃው ስም (አማርኛ)',
//                   value: prodForm.nameAm,
//                   required: true,
//                   onChange: (e) => setProdForm({ ...prodForm, nameAm: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none transition-all duration-200 hover:border-[#9CC5AE] focus:border-[#0F7B4A] focus:ring-4 focus:ring-[#0F7B4A]/10'
//                 }),
//                 React.createElement('input', {
//                   type: 'text',
//                   placeholder: 'የእቃው ስም (ኦሮምኛ)',
//                   value: prodForm.nameOm,
//                   onChange: (e) => setProdForm({ ...prodForm, nameOm: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none transition-all duration-200 hover:border-[#9CC5AE] focus:border-[#0F7B4A] focus:ring-4 focus:ring-[#0F7B4A]/10'
//                 }),
//                 React.createElement('input', {
//                   type: 'number',
//                   placeholder: 'ሙሉ የካርቶን / ደርዘን ዋጋ (ብር)',
//                   value: prodForm.pricePerUnit,
//                   required: true,
//                   onChange: (e) => setProdForm({ ...prodForm, pricePerUnit: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs font-bold text-[#0F7B4A] outline-none transition-all duration-200 hover:border-[#9CC5AE] focus:border-[#0F7B4A] focus:ring-4 focus:ring-[#0F7B4A]/10'
//                 }),
//                 React.createElement('input', {
//                   type: 'number',
//                   placeholder: 'እውነተኛ የመጋዘን ክምችት (Actual Stock - Admin Only)',
//                   value: prodForm.actualStock,
//                   required: true,
//                   onChange: (e) => setProdForm({ ...prodForm, actualStock: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs font-bold text-gray-800 outline-none transition-all duration-200 hover:border-[#9CC5AE] focus:border-[#0F7B4A] focus:ring-4 focus:ring-[#0F7B4A]/10'
//                 }),
//                 React.createElement('input', {
//                   type: 'number',
//                   placeholder: 'በመተግበሪያው የሚታይ ክምችት (Posted Stock - App Display)',
//                   value: prodForm.postedStock,
//                   required: true,
//                   onChange: (e) => setProdForm({ ...prodForm, postedStock: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs font-bold text-[#0F7B4A] outline-none transition-all duration-200 hover:border-[#9CC5AE] focus:border-[#0F7B4A] focus:ring-4 focus:ring-[#0F7B4A]/10'
//                 })
//               ),

//               // Breakdown Pricing Sub-Grid (Half Carton, Half Dozen, Packet)
//               React.createElement(
//                 'div',
//                 { className: 'p-4 rounded-xl border border-[#DDE4DD] bg-[#FAFCFA] space-y-3' },
//                 React.createElement('p', { className: 'text-xs font-black text-[#12241A]' }, 'የችርቻሮ መሸጫ ደረጃዎችና ዋጋዎች (Breakdown Pricing Options):'),
//                 React.createElement(
//                   'div',
//                   { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
//                   // Half Carton Tier
//                   React.createElement(
//                     'div',
//                     { className: 'p-2.5 rounded-lg border border-[#E6ECE7] bg-white space-y-2' },
//                     React.createElement(
//                       'label',
//                       { className: 'flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12241A]' },
//                       React.createElement('input', {
//                         type: 'checkbox',
//                         checked: prodForm.allowsHalfCarton,
//                         onChange: (e) => setProdForm({ ...prodForm, allowsHalfCarton: e.target.checked }),
//                         className: 'rounded text-[#0F7B4A] focus:ring-[#0F7B4A]'
//                       }),
//                       React.createElement('span', null, 'ግማሽ ካርቶን (Half Carton)')
//                     ),
//                     prodForm.allowsHalfCarton ? React.createElement('input', {
//                       type: 'number',
//                       placeholder: 'የግማሽ ካርቶን ዋጋ (ብር)',
//                       value: prodForm.priceHalfCarton,
//                       onChange: (e) => setProdForm({ ...prodForm, priceHalfCarton: e.target.value }),
//                       className: 'w-full p-2 border border-[#DDE4DD] rounded-lg text-xs font-bold'
//                     }) : null
//                   ),
//                   // Half Dozen Tier
//                   React.createElement(
//                     'div',
//                     { className: 'p-2.5 rounded-lg border border-[#E6ECE7] bg-white space-y-2' },
//                     React.createElement(
//                       'label',
//                       { className: 'flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12241A]' },
//                       React.createElement('input', {
//                         type: 'checkbox',
//                         checked: prodForm.allowsHalfDozen,
//                         onChange: (e) => setProdForm({ ...prodForm, allowsHalfDozen: e.target.checked }),
//                         className: 'rounded text-[#0F7B4A] focus:ring-[#0F7B4A]'
//                       }),
//                       React.createElement('span', null, 'ግማሽ ደርዘን (Half Dozen)')
//                     ),
//                     prodForm.allowsHalfDozen ? React.createElement('input', {
//                       type: 'number',
//                       placeholder: 'የግማሽ ደርዘን ዋጋ (ብር)',
//                       value: prodForm.priceHalfDozen,
//                       onChange: (e) => setProdForm({ ...prodForm, priceHalfDozen: e.target.value }),
//                       className: 'w-full p-2 border border-[#DDE4DD] rounded-lg text-xs font-bold'
//                     }) : null
//                   ),
//                   // Packet Tier
//                   React.createElement(
//                     'div',
//                     { className: 'p-2.5 rounded-lg border border-[#E6ECE7] bg-white space-y-2' },
//                     React.createElement(
//                       'label',
//                       { className: 'flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12241A]' },
//                       React.createElement('input', {
//                         type: 'checkbox',
//                         checked: prodForm.allowsPacket,
//                         onChange: (e) => setProdForm({ ...prodForm, allowsPacket: e.target.checked }),
//                         className: 'rounded text-[#0F7B4A] focus:ring-[#0F7B4A]'
//                       }),
//                       React.createElement('span', null, 'ፓኬት / ቁራጭ (Packet / Piece)')
//                     ),
//                     prodForm.allowsPacket ? React.createElement('input', {
//                       type: 'number',
//                       placeholder: 'የአንድ ፓኬት ዋጋ (ብር)',
//                       value: prodForm.pricePacket,
//                       onChange: (e) => setProdForm({ ...prodForm, pricePacket: e.target.value }),
//                       className: 'w-full p-2 border border-[#DDE4DD] rounded-lg text-xs font-bold'
//                     }) : null
//                   )
//                 )
//               ),

//               // Product Image Uploader
//               React.createElement(
//                 'div',
//                 { className: 'p-3 border-2 border-dashed border-[#DDE4DD] rounded-xl text-center md:col-span-2 hover:border-[#0F7B4A]/50 hover:bg-[#F5FAF7]' },
//                 React.createElement('input', {
//                   type: 'file',
//                   accept: 'image/*',
//                   id: 'prodImgInput',
//                   className: 'hidden',
//                   onChange: (e) => handleFileUpload(e.target.files[0], 'prod', (url) => setProdForm({ ...prodForm, imageUrl: url }))
//                 }),
//                 React.createElement(
//                   'label',
//                   { htmlFor: 'prodImgInput', className: 'cursor-pointer text-xs font-black text-[#0F7B4A] inline-flex items-center gap-2' },
//                   React.createElement(Upload, { className: 'h-4 w-4' }),
//                   React.createElement('span', null, uploadingSlot === 'prod' ? 'በመጫን ላይ...' : prodForm.imageUrl ? 'የምርት ፎቶ ተመርጧል ✔' : 'የምርት ፎቶ ስቀል (Upload Image)')
//                 ),
//                 prodForm.imageUrl ? React.createElement(
//                   'div',
//                   { className: 'mt-2 flex items-center justify-center gap-2' },
//                   React.createElement('img', { src: prodForm.imageUrl, className: 'h-10 w-10 object-cover rounded-lg border', alt: '' }),
//                   React.createElement('span', { className: 'text-[10px] text-gray-500 font-mono truncate max-w-xs' }, prodForm.imageUrl)
//                 ) : null
//               ),
//               React.createElement('button', { type: 'submit', className: 'py-2.5 px-6 bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] hover:from-[#0F7B4A] hover:to-[#0c653d] text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-[#0F7B4A]/25 hover:shadow-lg transition-all duration-200' }, 'ምርቱን መዝግብ')
//             ),

//             // Products Table with All Pricing Columns
//             React.createElement(
//               'div',
//               { className: 'bg-white rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden' },
//               React.createElement(
//                 'div',
//                 { className: 'p-4 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] flex justify-between items-center' },
//                 React.createElement('div', { className: 'font-black text-xs text-[#12241A]' }, 'የመጋዘን እቃዎችና ዝርዝር ዋጋዎች (' + products.length + ')'),
//                 React.createElement('div', { className: 'text-[11px] text-[#62726A]' }, '*ቀይ ማስጠንቀቂያ እውነተኛ የመጋዘን ክምችት ከ 5 በታች ሲሆን ብቻ ይበራል')
//               ),
//               React.createElement(
//                 'table',
//                 { className: 'w-full text-left text-xs' },
//                 React.createElement(
//                   'thead',
//                   { className: 'bg-gradient-to-b from-[#F8FAF7] to-[#F3F7F3] border-b border-[#E6ECE7]' },
//                   React.createElement('tr', null,
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'ፎቶ'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'የእቃው ስም'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'ምድብ'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'የካርቶን / ዝርዝር ዋጋዎች'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'መጋዘን / አፕ ላይ'),
//                     React.createElement('th', { className: 'p-3 text-right text-[11px] font-black text-[#62726A]' }, 'እርምጃዎች')
//                   )
//                 ),
//                 React.createElement(
//                   'tbody',
//                   { className: 'divide-y divide-[#E6ECE7]' },
//                   products.map((p) => {
//                     const actual = p.actualStock !== undefined && p.actualStock !== null ? Number(p.actualStock) : Number(p.currentStock ?? 0);
//                     const posted = p.postedStock !== undefined && p.postedStock !== null ? Number(p.postedStock) : Number(p.currentStock ?? 0);
//                     const isLow = actual < 5;

//                     return React.createElement(
//                       'tr',
//                       { key: p.id, className: (isLow ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-[#F8FAF7]') + ' transition-colors duration-150' },
//                       React.createElement('td', { className: 'p-3' },
//                         p.imageUrl && p.imageUrl.startsWith('http')
//                           ? React.createElement('img', { src: p.imageUrl, className: 'w-10 h-10 object-cover rounded-lg ring-1 ring-[#E6ECE7] shadow-sm', alt: '' })
//                           : React.createElement('span', { className: 'text-2xl' }, p.imageUrl || '📦')
//                       ),
//                       React.createElement('td', { className: 'p-3' },
//                         React.createElement('div', { className: 'font-black text-[#12241A]' }, p.nameAm),
//                         React.createElement('div', { className: 'text-[11px] text-[#62726A]' }, p.nameOm || '-')
//                       ),
//                       React.createElement('td', { className: 'p-3 text-[#62726A] font-semibold' }, p.category?.nameAm || '-'),
//                       React.createElement('td', { className: 'p-3' },
//                         React.createElement(
//                           'div',
//                           { className: 'space-y-1' },
//                           React.createElement('div', { className: 'font-black text-[#0F7B4A]' }, 'ሙሉ: ' + Number(p.pricePerUnit).toLocaleString() + ' ብር'),
//                           p.allowsHalfCarton && p.priceHalfCarton ? React.createElement('div', { className: 'text-[10px] text-gray-600 font-semibold' }, 'ግማሽ ካርቶን: ' + Number(p.priceHalfCarton).toLocaleString() + ' ብር') : null,
//                           p.allowsHalfDozen && p.priceHalfDozen ? React.createElement('div', { className: 'text-[10px] text-gray-600 font-semibold' }, 'ግማሽ ደርዘን: ' + Number(p.priceHalfDozen).toLocaleString() + ' ብር') : null,
//                           p.allowsPacket && p.pricePacket ? React.createElement('div', { className: 'text-[10px] text-gray-600 font-semibold' }, 'ፓኬት: ' + Number(p.pricePacket).toLocaleString() + ' ብር') : null
//                         )
//                       ),
//                       React.createElement('td', { className: 'p-3' },
//                         React.createElement('div', { className: 'flex flex-col gap-1' },
//                           isLow ? React.createElement(
//                             'span',
//                             { className: 'px-2 py-0.5 bg-gradient-to-b from-red-500 to-red-600 text-white rounded text-[10px] font-black inline-flex items-center gap-1 w-fit animate-pulse shadow-md shadow-red-500/30' },
//                             React.createElement(AlertTriangle, { className: 'h-3 w-3' }),
//                             'መጋዘን: ' + actual + ' (አልቋል!)'
//                           ) : React.createElement(
//                             'span',
//                             { className: 'text-xs font-black text-gray-800' },
//                             'መጋዘን: ' + actual + ' ካርቶን'
//                           ),
//                           React.createElement(
//                             'span',
//                             { className: 'text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded w-fit shadow-sm' },
//                             'አፕ ላይ: ' + posted + ' ካርቶን'
//                           )
//                         )
//                       ),
//                       React.createElement(
//                         'td',
//                         { className: 'p-3 text-right space-x-1.5' },
//                         React.createElement(
//                           'button',
//                           {
//                             onClick: () => setRestockModal({ open: true, productId: p.id, productName: p.nameAm, addedStock: '20' }),
//                             className: 'px-2.5 py-1 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-black cursor-pointer shadow-sm transition-all duration-200'
//                           },
//                           '+ ክምችት ሙላ'
//                         ),
//                         React.createElement(
//                           'button',
//                           {
//                             onClick: () => startEditingProduct(p),
//                             className: 'px-2.5 py-1 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-sm transition-all duration-200'
//                           },
//                           'አስተካክል'
//                         ),
//                         React.createElement(
//                           'button',
//                           {
//                             onClick: () => deleteProduct(p.id, p.nameAm),
//                             className: 'p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer transition-all duration-200'
//                           },
//                           React.createElement(Trash2, { className: 'h-3.5 w-3.5' })
//                         )
//                       )
//                     );
//                   })
//                 )
//               )
//             )
//           ) : null,

//           // ==========================================
//           // TAB: CATEGORIES
//           // ==========================================
//           activeTab === 'categories' ? React.createElement(
//             'div',
//             { className: 'space-y-6' },
//             React.createElement(
//               'form',
//               { onSubmit: submitCategory, className: 'bg-white p-6 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-md transition-shadow duration-300 space-y-3' },
//               React.createElement('h2', { className: 'text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ የምርት ምድብ መመዝገቢያ (Add Category)'),
//               React.createElement(
//                 'div',
//                 { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
//                 React.createElement('input', {
//                   type: 'text',
//                   placeholder: 'የምድብ ስም በአማርኛ',
//                   value: catForm.nameAm,
//                   required: true,
//                   onChange: (e) => setCatForm({ ...catForm, nameAm: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none focus:border-[#0F7B4A]'
//                 }),
//                 React.createElement('input', {
//                   type: 'text',
//                   placeholder: 'የምድብ ስም በኦሮምኛ',
//                   value: catForm.nameOm,
//                   onChange: (e) => setCatForm({ ...catForm, nameOm: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none focus:border-[#0F7B4A]'
//                 }),
//                 React.createElement('input', {
//                   type: 'text',
//                   placeholder: 'ኢሞጂ ወይም ምስል',
//                   value: catForm.iconUrl,
//                   onChange: (e) => setCatForm({ ...catForm, iconUrl: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none focus:border-[#0F7B4A]'
//                 })
//               ),
//               React.createElement('button', { type: 'submit', className: 'py-2 px-6 bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] text-white rounded-xl text-xs font-black cursor-pointer shadow-md' }, 'ምድቡን መዝግብ')
//             ),
//             React.createElement(
//               'div',
//               { className: 'bg-white rounded-2xl border border-[#E6ECE7] shadow-sm overflow-hidden' },
//               React.createElement('div', { className: 'p-4 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] font-black text-xs text-[#12241A]' }, 'ነባር ምድቦች (' + categories.length + ')'),
//               React.createElement(
//                 'table',
//                 { className: 'w-full text-left text-xs' },
//                 React.createElement(
//                   'thead',
//                   { className: 'bg-gradient-to-b from-[#F8FAF7] to-[#F3F7F3] border-b border-[#E6ECE7]' },
//                   React.createElement('tr', null,
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'አይኮን'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'ስም (አማርኛ)'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'ስም (ኦሮምኛ)'),
//                     React.createElement('th', { className: 'p-3 text-right text-[11px] font-black text-[#62726A]' }, 'እርምጃ')
//                   )
//                 ),
//                 React.createElement(
//                   'tbody',
//                   { className: 'divide-y divide-[#E6ECE7]' },
//                   categories.map((c) => React.createElement(
//                     'tr',
//                     { key: c.id, className: 'hover:bg-[#F8FAF7]' },
//                     React.createElement('td', { className: 'p-3 text-xl' }, c.iconUrl || '📦'),
//                     React.createElement('td', { className: 'p-3 font-black text-[#12241A]' }, c.nameAm),
//                     React.createElement('td', { className: 'p-3 text-[#62726A] font-semibold' }, c.nameOm || '-'),
//                     React.createElement(
//                       'td',
//                       { className: 'p-3 text-right' },
//                       React.createElement(
//                         'button',
//                         {
//                           onClick: () => deleteCategory(c.id, c.nameAm),
//                           className: 'p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer inline-flex items-center gap-1 font-bold'
//                         },
//                         React.createElement(Trash2, { className: 'h-3.5 w-3.5' }),
//                         React.createElement('span', null, 'ምድቡን ሰርዝ')
//                       )
//                     )
//                   ))
//                 )
//               )
//             )
//           ) : null,

//           // ==========================================
//           // TAB: ADVERTISEMENTS (Up to 3 Images or MP4 Videos)
//           // ==========================================
//           activeTab === 'ads' ? React.createElement(
//             'div',
//             { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
//             React.createElement(
//               'form',
//               { onSubmit: submitBanner, className: 'bg-white p-6 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4' },
//               React.createElement('h2', { className: 'text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ ማስታወቂያ ስቀል (3-Slot Image & Video Studio)'),
//               React.createElement('input', {
//                 type: 'text',
//                 placeholder: 'የማስታወቂያ ርዕስ (Title)',
//                 value: adForm.title,
//                 required: true,
//                 onChange: (e) => setAdForm({ ...adForm, title: e.target.value }),
//                 className: 'w-full p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none focus:border-[#0F7B4A]'
//               }),

//               // 3 Distinct Media Upload Slots
//               React.createElement(
//                 'div',
//                 { className: 'space-y-2.5' },
//                 React.createElement('p', { className: 'text-[11px] font-black text-[#62726A]' }, 'እስከ 3 የሚደርሱ ምስሎች ወይም 15 ሰከንድ ቪዲዮዎች ይስቀሉ:'),
//                 [0, 1, 2].map((slotIdx) => {
//                   const slot = adForm.mediaSlots[slotIdx];
//                   const slotKey = 'slot' + slotIdx;
//                   const isUploading = uploadingSlot === slotKey;

//                   return React.createElement(
//                     'div',
//                     { key: slotIdx, className: 'p-3 border rounded-xl bg-[#FAFCFA] border-[#DDE4DD] flex items-center justify-between gap-3' },
//                     React.createElement(
//                       'div',
//                       { className: 'flex items-center gap-2.5 overflow-hidden flex-1' },
//                       slot.url ? (
//                         slot.type === 'VIDEO'
//                           ? React.createElement('div', { className: 'w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0' }, '▶')
//                           : React.createElement('img', { src: slot.url, className: 'w-10 h-10 object-cover rounded-lg border shrink-0', alt: '' })
//                       ) : React.createElement(
//                         'div',
//                         { className: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs shrink-0' },
//                         slotIdx + 1
//                       ),
//                       React.createElement(
//                         'div',
//                         { className: 'overflow-hidden flex-1' },
//                         React.createElement('p', { className: 'text-xs font-bold text-[#12241A]' }, 'ማስታወቂያ ክፍል ' + (slotIdx + 1)),
//                         React.createElement('p', { className: 'text-[10px] text-[#62726A] truncate' }, slot.url || 'ፋይል አልተመረጠም')
//                       )
//                     ),
//                     React.createElement(
//                       'div',
//                       { className: 'shrink-0' },
//                       React.createElement('input', {
//                         type: 'file',
//                         accept: 'image/*,video/mp4',
//                         id: 'mediaInput' + slotIdx,
//                         className: 'hidden',
//                         onChange: (e) => handleFileUpload(e.target.files[0], slotKey, (url, type) => {
//                           const updated = [...adForm.mediaSlots];
//                           updated[slotIdx] = { url, type };
//                           setAdForm({ ...adForm, mediaSlots: updated });
//                         })
//                       }),
//                       React.createElement(
//                         'label',
//                         {
//                           htmlFor: 'mediaInput' + slotIdx,
//                           className: 'px-3 py-1.5 bg-[#E4F2EA] text-[#0F7B4A] hover:bg-[#d5ebde] rounded-lg text-xs font-black cursor-pointer inline-flex items-center gap-1'
//                         },
//                         React.createElement(Upload, { className: 'h-3.5 w-3.5' }),
//                         React.createElement('span', null, isUploading ? '...' : slot.url ? 'ቀይር' : 'ስቀል')
//                       )
//                     )
//                   );
//                 })
//               ),

//               React.createElement('button', { type: 'submit', className: 'w-full py-2.5 bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] hover:from-[#0F7B4A] hover:to-[#0c653d] text-white rounded-xl text-xs font-black cursor-pointer shadow-md' }, 'ማስታወቂያውን በሞባይል ላይ ልቀቅ')
//             ),

//             // Active Ads List with Media Counters
//             React.createElement(
//               'div',
//               { className: 'bg-white p-6 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-md transition-shadow duration-300 space-y-3' },
//               React.createElement('h3', { className: 'text-sm font-black text-[#12241A] tracking-tight' }, 'በአሁኑ ሰዓት የሚሰሩ ማስታወቂያዎች (' + banners.length + ')'),
//               banners.map((b) => {
//                 const totalMedia = Array.isArray(b.mediaUrls) && b.mediaUrls.length > 0 ? b.mediaUrls.length : (b.mediaUrl ? 1 : 0);
//                 const isVideo = b.mediaType === 'VIDEO';

//                 return React.createElement(
//                   'div',
//                   { key: b.id, className: 'p-3 border border-[#E6ECE7] rounded-xl text-xs flex gap-3 items-center bg-gradient-to-r from-white to-[#FCFDFB] hover:border-[#CFE7D9] transition-all duration-200' },
//                   isVideo
//                     ? React.createElement('div', { className: 'w-14 h-14 bg-gradient-to-br from-[#12241A] to-black text-white flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 ring-1 ring-white/10' }, '▶ ቪዲዮ')
//                     : React.createElement('img', { src: b.mediaUrl || b.mediaUrls?.[0], className: 'w-14 h-14 rounded-lg object-cover shrink-0 ring-1 ring-[#E6ECE7] shadow-sm', alt: '' }),
//                   React.createElement(
//                     'div',
//                     { className: 'overflow-hidden flex-1' },
//                     React.createElement('p', { className: 'font-black truncate text-[#12241A]' }, b.title),
//                     React.createElement('p', { className: 'text-[11px] text-[#62726A] font-semibold' }, isVideo ? 'የቪዲዮ ማስታወቂያ' : 'የምስል ማስታወቂያ'),
//                     React.createElement('span', { className: 'text-[10px] text-[#0F7B4A] font-bold bg-[#E4F2EA] px-2 py-0.5 rounded-full inline-block mt-1' }, totalMedia + ' ሚዲያ ፋይሎች (Files)')
//                   )
//                 );
//               })
//             )
//           ) : null,

//           // ==========================================
//           // TAB: USERS & RBAC (With Deny/Block Login Action)
//           // ==========================================
//           activeTab === 'users' ? React.createElement(
//             'div',
//             { className: 'space-y-6' },
//             React.createElement(
//               'form',
//               { onSubmit: submitUser, className: 'bg-white p-6 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4' },
//               React.createElement('h2', { className: 'text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ አስተዳዳሪና የተፈቀዱ ገጾች መመዝገቢያ'),
//               React.createElement(
//                 'div',
//                 { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
//                 React.createElement('input', {
//                   type: 'text',
//                   placeholder: 'ስልክ ቁጥር (09...)',
//                   value: userForm.phoneNumber,
//                   required: true,
//                   onChange: (e) => setUserForm({ ...userForm, phoneNumber: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none focus:border-[#0F7B4A]'
//                 }),
//                 React.createElement('input', {
//                   type: 'text',
//                   placeholder: 'የአስተዳዳሪው ስም / የስራ ክፍል',
//                   value: userForm.shopName,
//                   required: true,
//                   onChange: (e) => setUserForm({ ...userForm, shopName: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none focus:border-[#0F7B4A]'
//                 }),
//                 React.createElement('input', {
//                   type: 'password',
//                   placeholder: 'የይለፍ ቃል (Password)',
//                   value: userForm.password,
//                   required: true,
//                   onChange: (e) => setUserForm({ ...userForm, password: e.target.value }),
//                   className: 'p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-xs outline-none focus:border-[#0F7B4A]'
//                 })
//               ),
//               React.createElement(
//                 'div',
//                 { className: 'space-y-2 pt-2' },
//                 React.createElement('label', { className: 'text-xs font-black text-[#12241A] block' }, 'ለዚህ አስተዳዳሪ የሚፈቀዱ የሳይድባር ገጾች:'),
//                 React.createElement(
//                   'div',
//                   { className: 'grid grid-cols-2 sm:grid-cols-3 gap-2.5' },
//                   ALL_SYSTEM_TABS.map((t) => {
//                     const isChecked = userForm.allowedTabs.includes(t.id);
//                     return React.createElement(
//                       'button',
//                       {
//                         key: t.id,
//                         type: 'button',
//                         onClick: () => toggleTabInCreation(t.id),
//                         className: 'flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer text-left ' +
//                           (isChecked ? 'border-[#0F7B4A] bg-[#E4F2EA] text-[#0F7B4A]' : 'border-[#E6ECE7] bg-white text-[#62726A]')
//                       },
//                       React.createElement('div', {
//                         className: 'w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 shrink-0 ' +
//                           (isChecked ? 'border-[#0F7B4A] bg-[#0F7B4A] text-white' : 'border-gray-300 bg-white')
//                       }, isChecked ? '✓' : ''),
//                       React.createElement('span', null, t.name)
//                     );
//                   })
//                 )
//               ),
//               React.createElement('button', { type: 'submit', className: 'py-2.5 px-6 bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] text-white font-black rounded-xl text-xs cursor-pointer shadow-md' }, 'አዲሱን Admin መዝግብ')
//             ),

//             React.createElement(
//               'div',
//               { className: 'bg-white rounded-2xl border border-[#E6ECE7] shadow-sm overflow-hidden' },
//               React.createElement('div', { className: 'p-4 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] font-black text-xs text-[#12241A]' }, 'የተጠቃሚዎች ዝርዝርና የመግቢያ ፍቃድ ሁኔታ (' + usersList.length + ')'),
//               React.createElement(
//                 'table',
//                 { className: 'w-full text-left text-xs' },
//                 React.createElement(
//                   'thead',
//                   { className: 'bg-gradient-to-b from-[#F8FAF7] to-[#F3F7F3] border-b border-[#E6ECE7]' },
//                   React.createElement('tr', null,
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'ስልክ / ሱቅ'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'ሚና'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'የተፈቀዱ ገጾች'),
//                     React.createElement('th', { className: 'p-3 text-[11px] font-black text-[#62726A]' }, 'የፍቃድ ሁኔታ (Status)'),
//                     React.createElement('th', { className: 'p-3 text-right text-[11px] font-black text-[#62726A]' }, 'እርምጃ (Actions)')
//                   )
//                 ),
//                 React.createElement(
//                   'tbody',
//                   { className: 'divide-y divide-[#E6ECE7]' },
//                   usersList.map((u) => {
//                     const isSuper = u.role === 'SUPERADMIN' || u.phoneNumber === '0911000000';
//                     const activeTabs = u.allowedTabs || ['orders'];
//                     const isRejected = u.approvalStatus === 'REJECTED' || u.approvalStatus === 'SUSPENDED';

//                     return React.createElement(
//                       'tr',
//                       { key: u.id, className: 'hover:bg-[#F8FAF7]' },
//                       React.createElement('td', { className: 'p-3 font-black text-[#12241A]' }, u.shopName, React.createElement('div', { className: 'text-[11px] text-[#62726A] font-semibold' }, u.phoneNumber)),
//                       React.createElement('td', { className: 'p-3 font-bold' },
//                         React.createElement('span', { className: 'px-2 py-0.5 rounded-full bg-[#F1F5F2] text-[#62726A] text-[10px] font-black' }, u.role)
//                       ),
//                       React.createElement('td', { className: 'p-3' },
//                         isSuper ? React.createElement('span', { className: 'px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-black text-[10px]' }, 'ሁሉም ገጾች (Full Access)')
//                         : React.createElement(
//                           'div',
//                           { className: 'flex flex-wrap gap-1' },
//                           activeTabs.map((tid) => {
//                             const found = ALL_SYSTEM_TABS.find((tab) => tab.id === tid);
//                             return React.createElement(
//                               'span',
//                               { key: tid, className: 'px-1.5 py-0.5 bg-[#F1F5F2] text-[#62726A] rounded-full text-[10px] font-semibold' },
//                               found ? found.name.split(' ')[0] : tid
//                             );
//                           })
//                         )
//                       ),
//                       React.createElement('td', { className: 'p-3' },
//                         React.createElement(
//                           'span',
//                           { className: 'px-2.5 py-0.5 rounded-full text-[11px] font-black ' + (isRejected ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200') },
//                           isRejected ? '🚫 የታገደ (REJECTED)' : '✓ ፈቃድ ያለው (APPROVED)'
//                         )
//                       ),
//                       React.createElement(
//                         'td',
//                         { className: 'p-3 text-right space-x-1.5' },
//                         !isSuper ? React.createElement(
//                           'button',
//                           {
//                             onClick: () => setPermModal({ open: true, userId: u.id, shopName: u.shopName, allowedTabs: activeTabs }),
//                             className: 'px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-black cursor-pointer inline-flex items-center gap-1'
//                           },
//                           React.createElement(ShieldCheck, { className: 'h-3 w-3' }),
//                           'ፍቃድ ቀይር'
//                         ) : null,
//                         u.approvalStatus !== 'APPROVED' ? React.createElement(
//                           'button',
//                           {
//                             onClick: () => changeUserApproval(u.id, 'APPROVED'),
//                             className: 'px-2.5 py-1 bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] hover:from-[#0F7B4A] text-white rounded-lg text-[10px] font-black cursor-pointer'
//                           },
//                           'ፍቀድ (Approve)'
//                         ) : null,
//                         u.approvalStatus !== 'REJECTED' && !isSuper ? React.createElement(
//                           'button',
//                           {
//                             onClick: () => changeUserApproval(u.id, 'REJECTED'),
//                             className: 'px-2.5 py-1 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 text-white rounded-lg text-[10px] font-black cursor-pointer inline-flex items-center gap-1'
//                           },
//                           React.createElement(Ban, { className: 'h-3 w-3' }),
//                           'ከልክል (Block)'
//                         ) : null
//                       )
//                     );
//                   })
//                 )
//               )
//             )
//           ) : null
//         )
//       )
//     ),

//     // ==========================================
//     // MODAL: RESTOCK QUANTITY DIALOG
//     // ==========================================
//     restockModal.open ? React.createElement(
//       'div',
//       { className: 'fixed inset-0 bg-[#0B1F14]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' },
//       React.createElement(
//         'form',
//         { onSubmit: handleRestockSubmit, className: 'bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl space-y-4' },
//         React.createElement(
//           'div',
//           { className: 'flex justify-between items-center' },
//           React.createElement('h3', { className: 'font-black text-sm text-[#12241A]' }, 'ክምችት ሙላ (Restock Product)'),
//           React.createElement('button', { type: 'button', onClick: () => setRestockModal({ ...restockModal, open: false }), className: 'text-gray-400 hover:text-black cursor-pointer' }, React.createElement(X, { className: 'h-4 w-4' }))
//         ),
//         React.createElement('p', { className: 'text-xs text-[#62726A]' }, 'ለምርቱ: ', React.createElement('b', { className: 'text-[#12241A]' }, restockModal.productName)),
//         React.createElement(
//           'div',
//           null,
//           React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የሚጨመረው የካርቶን ብዛት (+ Quantity)'),
//           React.createElement('input', {
//             type: 'number',
//             min: '1',
//             value: restockModal.addedStock,
//             required: true,
//             onChange: (e) => setRestockModal({ ...restockModal, addedStock: e.target.value }),
//             className: 'w-full p-2.5 border border-[#DDE4DD] rounded-xl text-sm font-black text-[#0F7B4A]'
//           })
//         ),
//         React.createElement(
//           'div',
//           { className: 'flex gap-2 pt-2' },
//           React.createElement('button', { type: 'button', onClick: () => setRestockModal({ ...restockModal, open: false }), className: 'flex-1 py-2 text-xs font-bold bg-[#F1F5F2] rounded-xl cursor-pointer' }, 'ተመለስ'),
//           React.createElement('button', { type: 'submit', className: 'flex-1 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer' }, 'አድስ (Restock)')
//         )
//       )
//     ) : null,

//     // ==========================================
//     // MODAL: EDIT PRODUCT (4-TIER PRICING & DUAL STOCK)
//     // ==========================================
//     editingProduct ? React.createElement(
//       'div',
//       { className: 'fixed inset-0 bg-[#0B1F14]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' },
//       React.createElement(
//         'form',
//         { onSubmit: handleSaveEditProduct, className: 'bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto' },
//         React.createElement(
//           'div',
//           { className: 'flex justify-between items-center' },
//           React.createElement('h3', { className: 'font-black text-sm text-[#12241A]' }, 'ምርቱን አስተካክል (Edit Product)'),
//           React.createElement('button', { type: 'button', onClick: () => setEditingProduct(null), className: 'text-gray-400 hover:text-black cursor-pointer' }, React.createElement(X, { className: 'h-4 w-4' }))
//         ),
//         React.createElement(
//           'div',
//           { className: 'space-y-3' },
//           React.createElement(
//             'div',
//             null,
//             React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የምርት ምድብ (Category)'),
//             React.createElement(
//               'select',
//               {
//                 value: editingProduct.categoryId,
//                 required: true,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value }),
//                 className: 'w-full p-2.5 rounded-xl border border-[#DDE4DD] text-xs'
//               },
//               categories.map((c) => React.createElement('option', { key: c.id, value: c.id }, c.nameAm))
//             )
//           ),
//           React.createElement(
//             'div',
//             null,
//             React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የእቃው ስም (አማርኛ)'),
//             React.createElement('input', {
//               type: 'text',
//               value: editingProduct.nameAm,
//               required: true,
//               onChange: (e) => setEditingProduct({ ...editingProduct, nameAm: e.target.value }),
//               className: 'w-full p-2 rounded-xl border border-[#DDE4DD] text-xs'
//             })
//           ),
//           React.createElement(
//             'div',
//             null,
//             React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የእቃው ስም (ኦሮምኛ)'),
//             React.createElement('input', {
//               type: 'text',
//               value: editingProduct.nameOm || '',
//               onChange: (e) => setEditingProduct({ ...editingProduct, nameOm: e.target.value }),
//               className: 'w-full p-2 rounded-xl border border-[#DDE4DD] text-xs'
//             })
//           ),
//           React.createElement(
//             'div',
//             { className: 'grid grid-cols-3 gap-2.5' },
//             React.createElement(
//               'div',
//               null,
//               React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'ሙሉ ካርቶን (ብር)'),
//               React.createElement('input', {
//                 type: 'number',
//                 value: editingProduct.pricePerUnit,
//                 required: true,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, pricePerUnit: e.target.value }),
//                 className: 'w-full p-2 rounded-xl border border-[#DDE4DD] text-xs font-bold'
//               })
//             ),
//             React.createElement(
//               'div',
//               null,
//               React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'መጋዘን (Actual)'),
//               React.createElement('input', {
//                 type: 'number',
//                 value: editingProduct.actualStock,
//                 required: true,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, actualStock: e.target.value }),
//                 className: 'w-full p-2 rounded-xl border border-[#DDE4DD] text-xs font-bold text-gray-800'
//               })
//             ),
//             React.createElement(
//               'div',
//               null,
//               React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'አፕ ላይ (Posted)'),
//               React.createElement('input', {
//                 type: 'number',
//                 value: editingProduct.postedStock,
//                 required: true,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, postedStock: e.target.value }),
//                 className: 'w-full p-2 rounded-xl border border-[#DDE4DD] text-xs font-bold text-[#0F7B4A]'
//               })
//             )
//           ),

//           // Breakdown Pricing Tiers in Edit
//           React.createElement(
//             'div',
//             { className: 'p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2' },
//             React.createElement('p', { className: 'text-xs font-black text-gray-800' }, 'የችርቻሮ መሸጫ ደረጃዎች (Edit Tiers):'),
//             // Half Carton
//             React.createElement(
//               'div',
//               { className: 'flex items-center gap-3' },
//               React.createElement('input', {
//                 type: 'checkbox',
//                 checked: editingProduct.allowsHalfCarton,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, allowsHalfCarton: e.target.checked })
//               }),
//               React.createElement('span', { className: 'text-xs font-bold w-28' }, 'ግማሽ ካርቶን'),
//               React.createElement('input', {
//                 type: 'number',
//                 placeholder: 'ዋጋ (ብር)',
//                 disabled: !editingProduct.allowsHalfCarton,
//                 value: editingProduct.priceHalfCarton,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, priceHalfCarton: e.target.value }),
//                 className: 'flex-1 p-1.5 border rounded-lg text-xs bg-white'
//               })
//             ),
//             // Half Dozen
//             React.createElement(
//               'div',
//               { className: 'flex items-center gap-3' },
//               React.createElement('input', {
//                 type: 'checkbox',
//                 checked: editingProduct.allowsHalfDozen,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, allowsHalfDozen: e.target.checked })
//               }),
//               React.createElement('span', { className: 'text-xs font-bold w-28' }, 'ግማሽ ደርዘን'),
//               React.createElement('input', {
//                 type: 'number',
//                 placeholder: 'ዋጋ (ብር)',
//                 disabled: !editingProduct.allowsHalfDozen,
//                 value: editingProduct.priceHalfDozen,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, priceHalfDozen: e.target.value }),
//                 className: 'flex-1 p-1.5 border rounded-lg text-xs bg-white'
//               })
//             ),
//             // Packet
//             React.createElement(
//               'div',
//               { className: 'flex items-center gap-3' },
//               React.createElement('input', {
//                 type: 'checkbox',
//                 checked: editingProduct.allowsPacket,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, allowsPacket: e.target.checked })
//               }),
//               React.createElement('span', { className: 'text-xs font-bold w-28' }, 'ፓኬት / ቁራጭ'),
//               React.createElement('input', {
//                 type: 'number',
//                 placeholder: 'ዋጋ (ብር)',
//                 disabled: !editingProduct.allowsPacket,
//                 value: editingProduct.pricePacket,
//                 onChange: (e) => setEditingProduct({ ...editingProduct, pricePacket: e.target.value }),
//                 className: 'flex-1 p-1.5 border rounded-lg text-xs bg-white'
//               })
//             )
//           ),

//           // Edit Image Uploader
//           React.createElement(
//             'div',
//             { className: 'p-3 border-2 border-dashed border-[#DDE4DD] rounded-xl text-center' },
//             React.createElement('input', {
//               type: 'file',
//               accept: 'image/*',
//               id: 'editProdImg',
//               className: 'hidden',
//               onChange: (e) => handleFileUpload(e.target.files[0], 'editProd', (url) => setEditingProduct({ ...editingProduct, imageUrl: url }))
//             }),
//             React.createElement(
//               'label',
//               { htmlFor: 'editProdImg', className: 'cursor-pointer text-xs font-black text-[#0F7B4A]' },
//               uploadingSlot === 'editProd' ? 'በመጫን ላይ...' : 'አዲስ የምርት ፎቶ ቀይር (Change Image)'
//             ),
//             editingProduct.imageUrl ? React.createElement('p', { className: 'text-[10px] text-gray-500 mt-1 truncate' }, editingProduct.imageUrl) : null
//           )
//         ),
//         React.createElement(
//           'div',
//           { className: 'flex gap-2 pt-3' },
//           React.createElement('button', { type: 'button', onClick: () => setEditingProduct(null), className: 'flex-1 py-2 text-xs font-bold bg-[#F1F5F2] rounded-xl cursor-pointer' }, 'ተመለስ'),
//           React.createElement('button', { type: 'submit', className: 'flex-1 py-2 text-xs font-black bg-[#0F7B4A] hover:bg-[#0c653d] text-white rounded-xl cursor-pointer' }, 'አስቀምጥ (Save)')
//         )
//       )
//     ) : null,

//     // ==========================================
//     // MODAL: DYNAMIC PERMISSIONS EDIT
//     // ==========================================
//     permModal.open ? React.createElement(
//       'div',
//       { className: 'fixed inset-0 bg-[#0B1F14]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' },
//       React.createElement(
//         'form',
//         { onSubmit: handleSavePermissions, className: 'bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4' },
//         React.createElement(
//           'div',
//           { className: 'flex justify-between items-center' },
//           React.createElement('h3', { className: 'font-black text-sm text-[#12241A]' }, 'የአስተዳዳሪውን ፍቃድ ቀይር'),
//           React.createElement('button', { type: 'button', onClick: () => setPermModal({ open: false, userId: null, shopName: '', allowedTabs: [] }), className: 'text-gray-400 hover:text-black cursor-pointer' }, React.createElement(X, { className: 'h-4 w-4' }))
//         ),
//         React.createElement('p', { className: 'text-xs text-[#62726A]' }, 'አስተዳዳሪ: ', React.createElement('b', { className: 'text-[#12241A]' }, permModal.shopName)),
//         React.createElement(
//           'div',
//           { className: 'space-y-2' },
//           React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block' }, 'የሚፈቀዱ ገጾች ይምረጡ:'),
//           React.createElement(
//             'div',
//             { className: 'grid grid-cols-2 gap-2' },
//             ALL_SYSTEM_TABS.map((t) => {
//               const isChecked = permModal.allowedTabs.includes(t.id);
//               return React.createElement(
//                 'button',
//                 {
//                   key: t.id,
//                   type: 'button',
//                   onClick: () => toggleTabInEdit(t.id),
//                   className: 'flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition cursor-pointer text-left ' +
//                     (isChecked ? 'border-[#0F7B4A] bg-[#E4F2EA] text-[#0F7B4A]' : 'border-[#E6ECE7] bg-white text-[#62726A]')
//                 },
//                 React.createElement('div', {
//                   className: 'w-4 h-4 rounded border flex items-center justify-center ' +
//                     (isChecked ? 'border-[#0F7B4A] bg-[#0F7B4A] text-white' : 'border-gray-300 bg-white')
//                 }, isChecked ? '✓' : ''),
//                 React.createElement('span', null, t.name)
//               );
//             })
//           )
//         ),
//         React.createElement(
//           'div',
//           { className: 'flex gap-2 pt-2' },
//           React.createElement('button', { type: 'button', onClick: () => setPermModal({ open: false, userId: null, shopName: '', allowedTabs: [] }), className: 'flex-1 py-2 text-xs font-bold bg-[#F1F5F2] rounded-xl cursor-pointer' }, 'ተመለስ'),
//           React.createElement('button', { type: 'submit', className: 'flex-1 py-2 text-xs font-black bg-[#0F7B4A] hover:bg-[#0c653d] text-white rounded-xl cursor-pointer' }, 'ፍቃዶችን አድስ (Save)')
//         )
//       )
//     ) : null
//   );
// }
import React, { useEffect, useState, useRef } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  PlusCircle, 
  FolderPlus, 
  Tv, 
  Users, 
  LogOut, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  X,
  CheckCircle,
  Ban,
  Film,
  Image as ImageIcon,
  Menu
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../api/client';

const ALL_SYSTEM_TABS = [
  { id: 'orders', name: 'ትእዛዞች (Orders)', icon: ShoppingBag },
  { id: 'credit', name: 'የብድር ጥያቄዎች (Credit)', icon: CreditCard },
  { id: 'products', name: 'እቃዎችና ክምችት (Products)', icon: PlusCircle },
  { id: 'categories', name: 'ምድቦች (Categories)', icon: FolderPlus },
  { id: 'ads', name: 'ማስታወቂያዎች (Ad Studio)', icon: Tv },
  { id: 'users', name: 'ተጠቃሚዎችና ፍቃድ (Users)', icon: Users },
];

// Shared style tokens (UI only)
const inputBase =
  'w-full p-3 sm:p-2.5 rounded-xl border border-[#DDE4DD] bg-white text-base sm:text-xs outline-none transition-all duration-200 hover:border-[#9CC5AE] focus:border-[#0F7B4A] focus:ring-4 focus:ring-[#0F7B4A]/10';
const primaryBtn =
  'bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] hover:from-[#0F7B4A] hover:to-[#0c653d] text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-[#0F7B4A]/25 hover:shadow-lg hover:shadow-[#0F7B4A]/40 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200';
const panelBase =
  'bg-white rounded-2xl border border-[#E6ECE7] shadow-sm shadow-[#12241A]/[0.04] hover:shadow-md hover:shadow-[#12241A]/[0.07] transition-shadow duration-300';
const modalOverlay =
  'fixed inset-0 bg-[#0B1F14]/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto overscroll-contain';
const noScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export default function Dashboard() {
  const { admin, logout } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [creditOrders, setCreditOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null); // 'prod', 'slot0', 'slot1', 'slot2', 'editProd'
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer (UI only)

  // 3-Slot Media Banner State
  const [adForm, setAdForm] = useState({
    title: '',
    actionLink: '',
    mediaSlots: [
      { url: '', type: 'IMAGE' },
      { url: '', type: 'IMAGE' },
      { url: '', type: 'IMAGE' },
    ],
  });

  const [catForm, setCatForm] = useState({ nameAm: '', nameOm: '', iconUrl: '' });

  // Product Form with 4-Tier Pricing Options
  const [prodForm, setProdForm] = useState({
    nameAm: '',
    nameOm: '',
    categoryId: '',
    pricePerUnit: '',
    actualStock: '50',
    postedStock: '100',
    imageUrl: '',
    allowsHalfCarton: false,
    priceHalfCarton: '',
    allowsHalfDozen: false,
    priceHalfDozen: '',
    allowsPacket: false,
    pricePacket: '',
  });

  const [userForm, setUserForm] = useState({
    phoneNumber: '',
    shopName: '',
    password: '',
    role: 'ADMIN',
    allowedTabs: ['orders', 'products'],
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [restockModal, setRestockModal] = useState({ open: false, productId: null, productName: '', addedStock: '20' });
  const [permModal, setPermModal] = useState({ open: false, userId: null, shopName: '', allowedTabs: [] });

  const isSuperAdmin = admin?.role === 'SUPERADMIN' || admin?.phone === '0911000000' || admin?.phone === '+251911000000' || admin?.phoneNumber === '0911000000';
  const userAllowedTabs = isSuperAdmin
    ? ALL_SYSTEM_TABS.map((t) => t.id)
    : (Array.isArray(admin?.allowedTabs) && admin.allowedTabs.length > 0 ? admin.allowedTabs : ['orders']);

  const visibleNavTabs = ALL_SYSTEM_TABS.filter((tab) => userAllowedTabs.includes(tab.id));
  const [activeTab, setActiveTab] = useState(visibleNavTabs[0]?.id || 'orders');

  useEffect(() => {
    if (!userAllowedTabs.includes(activeTab) && visibleNavTabs.length > 0) {
      setActiveTab(visibleNavTabs[0].id);
    }
  }, [userAllowedTabs, activeTab]);

  // Silent Data Loading / Polling
  const loadData = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const [ordRes, credRes, catRes, prodRes, banRes, usrRes] = await Promise.all([
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/orders/credit-requests').catch(() => ({ data: { creditOrders: [] } })),
        api.get('/admin/categories').catch(() => ({ data: [] })),
        api.get('/admin/products').catch(() => ({ data: [] })),
        api.get('/admin/banners').catch(() => ({ data: [] })),
        api.get('/admin/users').catch(() => ({ data: [] })),
      ]);

      const rawOrders = ordRes.data?.orders || (Array.isArray(ordRes.data) ? ordRes.data : []);
      setOrders(rawOrders.filter((o) => !o.isCreditOrder));
      setCreditOrders(credRes.data?.creditOrders || []);
      setCategories(catRes.data || []);

      const rawProducts = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.products || []);
      setProducts(rawProducts);

      setBanners(banRes.data || []);
      setUsersList(usrRes.data || []);
    } catch (err) {
      console.error('Silent sync error:', err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  };

  // 1. Initial Load & 2. Automatic Live Background Refresh Polling
  useEffect(() => {
    loadData(true);

    // Auto-poll silently every 6 seconds without flickering or browser refreshing
    const timer = setInterval(() => {
      loadData(false);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // Universal Media File Upload Handler
  const handleFileUpload = async (file, slotKey, onSuccess) => {
    if (!file) return;
    setUploadingSlot(slotKey);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(res.data.url, res.data.mediaType || 'IMAGE');
    } catch (err) {
      alert('ስቀቱ አልተሳካም: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingSlot(null);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch('/orders/' + orderId + '/status', { status: newStatus });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleApproveCredit = async (orderId, approved) => {
    try {
      await api.patch('/orders/' + orderId + '/approve-credit', { approved });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSettleCredit = async (orderId) => {
    if (!window.confirm('ይህ ብድር ሙሉ በሙሉ መከፈሉን አረጋግጠዋል? የባለሱቁ የብድር ጣሪያ ይመለሳል።')) return;
    try {
      await api.patch('/orders/' + orderId + '/settle-credit');
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/admin/products/' + restockModal.productId + '/restock', {
        addedStock: Number(restockModal.addedStock),
      });
      alert('ክምችቱ ተሞልቷል!');
      setRestockModal({ open: false, productId: null, productName: '', addedStock: '20' });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  // Safe pre-fill keeping all 4 price tiers strictly separated
  const startEditingProduct = (p) => {
    const rawActual = p.actualStock !== undefined && p.actualStock !== null ? p.actualStock : (p.currentStock ?? 50);
    const rawPosted = p.postedStock !== undefined && p.postedStock !== null ? p.postedStock : (p.currentStock ?? 100);

    setEditingProduct({
      id: p.id,
      categoryId: p.categoryId || p.category?.id || '',
      nameAm: p.nameAm || '',
      nameOm: p.nameOm || '',
      pricePerUnit: String(p.pricePerUnit || ''),
      actualStock: String(rawActual),
      postedStock: String(rawPosted),
      imageUrl: p.imageUrl || '',
      allowsHalfCarton: Boolean(p.allowsHalfCarton),
      priceHalfCarton: p.priceHalfCarton ? String(p.priceHalfCarton) : '',
      allowsHalfDozen: Boolean(p.allowsHalfDozen),
      priceHalfDozen: p.priceHalfDozen ? String(p.priceHalfDozen) : '',
      allowsPacket: Boolean(p.allowsPacket),
      pricePacket: p.pricePacket ? String(p.pricePacket) : '',
    });
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    try {
      const actVal = Number(editingProduct.actualStock);
      const postVal = Number(editingProduct.postedStock);

      const res = await api.put('/admin/products/' + editingProduct.id, {
        categoryId: editingProduct.categoryId,
        nameAm: editingProduct.nameAm,
        nameOm: editingProduct.nameOm,
        imageUrl: editingProduct.imageUrl,
        pricePerUnit: Number(editingProduct.pricePerUnit),
        actualStock: isNaN(actVal) ? 0 : actVal,
        postedStock: isNaN(postVal) ? 0 : postVal,
        allowsHalfCarton: Boolean(editingProduct.allowsHalfCarton),
        priceHalfCarton: editingProduct.priceHalfCarton ? Number(editingProduct.priceHalfCarton) : null,
        allowsHalfDozen: Boolean(editingProduct.allowsHalfDozen),
        priceHalfDozen: editingProduct.priceHalfDozen ? Number(editingProduct.priceHalfDozen) : null,
        allowsPacket: Boolean(editingProduct.allowsPacket),
        pricePacket: editingProduct.pricePacket ? Number(editingProduct.pricePacket) : null,
      });

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? { ...item, ...(res.data?.product || {}), actualStock: actVal, postedStock: postVal }
            : item
        )
      );

      alert('ምርቱ በተሳካ ሁኔታ ተስተካክሏል!');
      setEditingProduct(null);
      loadData(false);
    } catch (err) {
      alert('ማስተካከል አልተቻለም: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (!window.confirm('ምርቱን (' + productName + ') መሰረዝ ይፈልጋሉ?')) return;
    try {
      await api.delete('/admin/products/' + productId);
      alert('ምርቱ ተሰርዟል!');
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', {
        ...prodForm,
        pricePerUnit: Number(prodForm.pricePerUnit),
        actualStock: Number(prodForm.actualStock),
        postedStock: Number(prodForm.postedStock),
        allowsHalfCarton: Boolean(prodForm.allowsHalfCarton),
        priceHalfCarton: prodForm.priceHalfCarton ? Number(prodForm.priceHalfCarton) : null,
        allowsHalfDozen: Boolean(prodForm.allowsHalfDozen),
        priceHalfDozen: prodForm.priceHalfDozen ? Number(prodForm.priceHalfDozen) : null,
        allowsPacket: Boolean(prodForm.allowsPacket),
        pricePacket: prodForm.pricePacket ? Number(prodForm.pricePacket) : null,
      });
      alert('ምርቱ ተመዝግቧል!');
      setProdForm({
        nameAm: '',
        nameOm: '',
        categoryId: '',
        pricePerUnit: '',
        actualStock: '50',
        postedStock: '100',
        imageUrl: '',
        allowsHalfCarton: false,
        priceHalfCarton: '',
        allowsHalfDozen: false,
        priceHalfDozen: '',
        allowsPacket: false,
        pricePacket: '',
      });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', catForm);
      alert('ምድቡ ተመዝግቧል!');
      setCatForm({ nameAm: '', nameOm: '', iconUrl: '' });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm('ይህን ምድብ (' + categoryName + ') ሲሰርዙ በውስጡ ያሉ እቃዎች በሙሉ ይሰረዛሉ። እርግጠኛ ነዎት?')) return;
    try {
      await api.delete('/admin/categories/' + categoryId);
      alert('ምድቡ ተሰርዟል!');
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  // 3-Slot Banner Submission
  const submitBanner = async (e) => {
    e.preventDefault();
    const activeMedia = adForm.mediaSlots.filter((s) => s.url.trim().length > 0);
    if (activeMedia.length === 0) {
      alert('እባክዎ ቢያንስ 1 ምስል ወይም ቪዲዮ ይስቀሉ');
      return;
    }
    try {
      const mediaUrls = activeMedia.map((m) => m.url);
      const mediaTypes = activeMedia.map((m) => m.type);

      await api.post('/admin/banners', {
        title: adForm.title,
        actionLink: adForm.actionLink,
        mediaUrl: mediaUrls[0],
        mediaType: mediaTypes[0],
        mediaUrls,
        mediaTypes,
      });

      alert('ማስታወቂያው ተለቋል!');
      setAdForm({
        title: '',
        actionLink: '',
        mediaSlots: [
          { url: '', type: 'IMAGE' },
          { url: '', type: 'IMAGE' },
          { url: '', type: 'IMAGE' },
        ],
      });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  // Change User Status (Blocks Login When Set to REJECTED)
  const changeUserApproval = async (id, status) => {
    try {
      await api.patch('/admin/users/' + id + '/approval', { status });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const submitUser = async (e) => {
    e.preventDefault();
    if (userForm.allowedTabs.length === 0) {
      alert('እባክዎ ቢያንስ አንድ የሚፈቀድ ገጽ ይምረጡ');
      return;
    }
    try {
      await api.post('/admin/users', userForm);
      alert('አዲሱ አስተዳዳሪ ተመዝግቧል!');
      setUserForm({
        phoneNumber: '',
        shopName: '',
        password: '',
        role: 'ADMIN',
        allowedTabs: ['orders', 'products'],
      });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/admin/users/' + permModal.userId + '/permissions', {
        allowedTabs: permModal.allowedTabs,
      });
      alert('ፍቃዱ ተስተካክሏል!');
      setPermModal({ open: false, userId: null, shopName: '', allowedTabs: [] });
      loadData(false);
    } catch (err) {
      alert('ስህተት: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleTabInCreation = (tabId) => {
    setUserForm((prev) => {
      const exists = prev.allowedTabs.includes(tabId);
      return {
        ...prev,
        allowedTabs: exists ? prev.allowedTabs.filter((id) => id !== tabId) : [...prev.allowedTabs, tabId],
      };
    });
  };

  const toggleTabInEdit = (tabId) => {
    setPermModal((prev) => {
      const exists = prev.allowedTabs.includes(tabId);
      return {
        ...prev,
        allowedTabs: exists ? prev.allowedTabs.filter((id) => id !== tabId) : [...prev.allowedTabs, tabId],
      };
    });
  };

  const lowStockCount = products.filter((p) => {
    const act = p.actualStock !== undefined && p.actualStock !== null ? Number(p.actualStock) : Number(p.currentStock ?? 0);
    return act < 5;
  }).length;

  const pendingCreditCount = creditOrders.filter((c) => c.creditApproved === null).length;

  // ------------------------------------------------------------------
  // Shared render helpers (same content, used by both table and mobile card)
  // ------------------------------------------------------------------
  const renderProductImage = (p, size) =>
    p.imageUrl && p.imageUrl.startsWith('http')
      ? React.createElement('img', { src: p.imageUrl, className: size + ' object-cover rounded-lg ring-1 ring-[#E6ECE7] shadow-sm shrink-0', alt: '' })
      : React.createElement('span', { className: 'text-2xl shrink-0' }, p.imageUrl || '📦');

  const renderPriceLines = (p) =>
    React.createElement(
      'div',
      { className: 'space-y-1' },
      React.createElement('div', { className: 'font-black text-[#0F7B4A]' }, 'ሙሉ: ' + Number(p.pricePerUnit).toLocaleString() + ' ብር'),
      p.allowsHalfCarton && p.priceHalfCarton ? React.createElement('div', { className: 'text-[11px] sm:text-[10px] text-gray-600 font-semibold' }, 'ግማሽ ካርቶን: ' + Number(p.priceHalfCarton).toLocaleString() + ' ብር') : null,
      p.allowsHalfDozen && p.priceHalfDozen ? React.createElement('div', { className: 'text-[11px] sm:text-[10px] text-gray-600 font-semibold' }, 'ግማሽ ደርዘን: ' + Number(p.priceHalfDozen).toLocaleString() + ' ብር') : null,
      p.allowsPacket && p.pricePacket ? React.createElement('div', { className: 'text-[11px] sm:text-[10px] text-gray-600 font-semibold' }, 'ፓኬት: ' + Number(p.pricePacket).toLocaleString() + ' ብር') : null
    );

  const renderStockBadges = (actual, posted, isLow) =>
    React.createElement('div', { className: 'flex flex-wrap sm:flex-col gap-1.5 sm:gap-1' },
      isLow ? React.createElement(
        'span',
        { className: 'px-2 py-0.5 bg-gradient-to-b from-red-500 to-red-600 text-white rounded text-[10px] font-black inline-flex items-center gap-1 w-fit animate-pulse shadow-md shadow-red-500/30' },
        React.createElement(AlertTriangle, { className: 'h-3 w-3' }),
        'መጋዘን: ' + actual + ' (አልቋል!)'
      ) : React.createElement(
        'span',
        { className: 'text-xs font-black text-gray-800' },
        'መጋዘን: ' + actual + ' ካርቶን'
      ),
      React.createElement(
        'span',
        { className: 'text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded w-fit shadow-sm' },
        'አፕ ላይ: ' + posted + ' ካርቶን'
      )
    );

  const renderProductActions = (p, isCard) => {
    const btn = isCard ? 'flex-1 py-2.5 text-xs ' : 'px-2.5 py-1 text-xs ';
    return React.createElement(
      'div',
      { className: isCard ? 'flex items-center gap-2' : 'flex items-center justify-end gap-1.5' },
      React.createElement(
        'button',
        {
          onClick: () => setRestockModal({ open: true, productId: p.id, productName: p.nameAm, addedStock: '20' }),
          className: btn + 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg font-black cursor-pointer shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap'
        },
        '+ ክምችት ሙላ'
      ),
      React.createElement(
        'button',
        {
          onClick: () => startEditingProduct(p),
          className: btn + 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-black cursor-pointer shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap'
        },
        'አስተካክል'
      ),
      React.createElement(
        'button',
        {
          onClick: () => deleteProduct(p.id, p.nameAm),
          className: (isCard ? 'p-2.5' : 'p-1') + ' bg-red-100 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer transition-all duration-200 active:scale-95 shrink-0'
        },
        React.createElement(Trash2, { className: 'h-3.5 w-3.5' })
      )
    );
  };

  const renderUserTabs = (isSuper, activeTabs) =>
    isSuper ? React.createElement('span', { className: 'px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-black text-[10px]' }, 'ሁሉም ገጾች (Full Access)')
    : React.createElement(
      'div',
      { className: 'flex flex-wrap gap-1' },
      activeTabs.map((tid) => {
        const found = ALL_SYSTEM_TABS.find((tab) => tab.id === tid);
        return React.createElement(
          'span',
          { key: tid, className: 'px-1.5 py-0.5 bg-[#F1F5F2] text-[#62726A] rounded-full text-[10px] font-semibold' },
          found ? found.name.split(' ')[0] : tid
        );
      })
    );

  const renderUserStatus = (isRejected) =>
    React.createElement(
      'span',
      { className: 'px-2.5 py-0.5 rounded-full text-[11px] font-black inline-block ' + (isRejected ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200') },
      isRejected ? '🚫 የታገደ (REJECTED)' : '✓ ፈቃድ ያለው (APPROVED)'
    );

  const renderUserActions = (u, isSuper, activeTabs, isCard) => {
    const pad = isCard ? 'px-3 py-2.5 text-[11px] ' : 'px-2.5 py-1 text-[10px] ';
    return React.createElement(
      'div',
      { className: 'flex flex-wrap gap-1.5 ' + (isCard ? '' : 'justify-end') },
      !isSuper ? React.createElement(
        'button',
        {
          onClick: () => setPermModal({ open: true, userId: u.id, shopName: u.shopName, allowedTabs: activeTabs }),
          className: pad + 'bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-black cursor-pointer inline-flex items-center justify-center gap-1 active:scale-95 transition-all duration-200' + (isCard ? ' flex-1' : '')
        },
        React.createElement(ShieldCheck, { className: 'h-3 w-3' }),
        'ፍቃድ ቀይር'
      ) : null,
      u.approvalStatus !== 'APPROVED' ? React.createElement(
        'button',
        {
          onClick: () => changeUserApproval(u.id, 'APPROVED'),
          className: pad + 'bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] hover:from-[#0F7B4A] text-white rounded-lg font-black cursor-pointer active:scale-95 transition-all duration-200' + (isCard ? ' flex-1' : '')
        },
        'ፍቀድ (Approve)'
      ) : null,
      u.approvalStatus !== 'REJECTED' && !isSuper ? React.createElement(
        'button',
        {
          onClick: () => changeUserApproval(u.id, 'REJECTED'),
          className: pad + 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 text-white rounded-lg font-black cursor-pointer inline-flex items-center justify-center gap-1 active:scale-95 transition-all duration-200' + (isCard ? ' flex-1' : '')
        },
        React.createElement(Ban, { className: 'h-3 w-3' }),
        'ከልክል (Block)'
      ) : null
    );
  };

  const thCls = 'p-3 text-[11px] font-black text-[#62726A]';

  return React.createElement(
    'div',
    { className: 'fixed inset-0 flex bg-gradient-to-br from-[#F5F7F3] via-[#F7FAF5] to-[#EBF3EC] overflow-hidden' },

    // Decorative glow (desktop shine, never blocks taps)
    React.createElement('div', { className: 'pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#17A06A]/10 blur-3xl' }),
    React.createElement('div', { className: 'pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl' }),

    // MOBILE OVERLAY
    sidebarOpen ? React.createElement('div', {
      className: 'fixed inset-0 z-30 bg-[#0B1F14]/50 backdrop-blur-sm lg:hidden',
      onClick: () => setSidebarOpen(false)
    }) : null,

    // SIDEBAR (drawer on phones, fixed column on desktop)
    React.createElement(
      'aside',
      { className: 'fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] lg:static lg:z-10 lg:max-w-none border-r border-[#E6ECE7] bg-white/95 backdrop-blur flex flex-col justify-between shrink-0 select-none shadow-[2px_0_24px_rgba(18,36,26,0.08)] transform transition-transform duration-300 ease-out lg:translate-x-0 pt-[env(safe-area-inset-top)] ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full') },
      React.createElement(
        'div',
        { className: 'flex flex-col min-h-0 flex-1' },
        React.createElement(
          'div',
          { className: 'h-16 flex items-center gap-3 px-5 lg:px-6 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] shrink-0' },
          React.createElement('div', { className: 'h-10 w-10 bg-gradient-to-br from-[#17A06A] to-[#0F7B4A] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#0F7B4A]/30 ring-1 ring-white/20 shrink-0' }, 'ቅገ'),
          React.createElement(
            'div',
            { className: 'min-w-0 flex-1' },
            React.createElement('h1', { className: 'text-sm font-black text-[#12241A] tracking-tight truncate' }, 'ቅናሽ ገበያ'),
            React.createElement('p', { className: 'text-[11px] font-bold text-[#62726A] truncate' }, isSuperAdmin ? 'Main Superadmin' : 'Authorized Admin')
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              'aria-label': 'Close menu',
              onClick: () => setSidebarOpen(false),
              className: 'lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-[#F1F5F2] text-[#62726A] hover:bg-[#E4F2EA] hover:text-[#0F7B4A] active:scale-95 transition-all duration-200 shrink-0'
            },
            React.createElement(X, { className: 'h-4 w-4' })
          )
        ),
        React.createElement(
          'nav',
          { className: 'p-3 lg:p-4 space-y-1.5 overflow-y-auto overscroll-contain' },
          visibleNavTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const count = item.id === 'orders' ? orders.length
              : item.id === 'credit' ? creditOrders.length
              : item.id === 'products' ? products.length
              : item.id === 'categories' ? categories.length
              : item.id === 'ads' ? banners.length
              : usersList.length;

            const alertBadge = item.id === 'products' ? lowStockCount
              : item.id === 'credit' ? pendingCreditCount
              : 0;

            return React.createElement(
              'button',
              {
                key: item.id,
                onClick: () => { setActiveTab(item.id); setSidebarOpen(false); },
                className: 'relative w-full flex items-center justify-between gap-2 px-3.5 py-3.5 lg:py-3 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer active:scale-[0.98] ' +
                  (isActive
                    ? 'bg-gradient-to-r from-[#E4F2EA] to-[#F1F9F3] text-[#0F7B4A] shadow-sm shadow-[#0F7B4A]/10 ring-1 ring-[#0F7B4A]/15'
                    : 'text-[#62726A] hover:bg-[#F2F7F3] hover:text-[#0F7B4A] hover:translate-x-0.5')
              },
              isActive ? React.createElement('span', { className: 'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#0F7B4A]' }) : null,
              React.createElement(
                'div',
                { className: 'flex items-center gap-3 min-w-0' },
                React.createElement(Icon, { className: 'h-4 w-4 shrink-0 transition-colors duration-200 ' + (isActive ? 'text-[#0F7B4A] drop-shadow-sm' : 'text-[#8DA396]') }),
                React.createElement('span', { className: 'truncate text-left' }, item.name)
              ),
              React.createElement(
                'div',
                { className: 'flex items-center gap-1.5 shrink-0' },
                alertBadge > 0 ? React.createElement(
                  'span',
                  { className: 'px-1.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-b from-red-500 to-red-600 text-white animate-pulse shadow-md shadow-red-500/40 ring-2 ring-white' },
                  alertBadge
                ) : null,
                React.createElement(
                  'span',
                  { className: 'px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors duration-200 ' + (isActive ? 'bg-gradient-to-b from-[#17A06A] to-[#0F7B4A] text-white shadow-sm shadow-[#0F7B4A]/30' : 'bg-[#F1F5F2] text-[#62726A] ring-1 ring-[#E6ECE7]') },
                  count
                )
              )
            );
          })
        )
      ),
      React.createElement(
        'div',
        { className: 'p-3 lg:p-4 border-t border-[#E6ECE7] bg-gradient-to-t from-[#FAFCFA] to-white shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]' },
        React.createElement(
          'button',
          { onClick: logout, className: 'w-full flex items-center gap-2 px-3 py-3 lg:py-2.5 rounded-xl text-xs font-black text-red-600 ring-1 ring-transparent hover:ring-red-100 hover:bg-red-50 hover:shadow-sm active:scale-[0.98] cursor-pointer transition-all duration-200' },
          React.createElement(LogOut, { className: 'h-4 w-4' }),
          React.createElement('span', null, 'ከአካውንት ውጣ (Sign Out)')
        )
      )
    ),

    // MAIN VIEWPORT
    React.createElement(
      'div',
      { className: 'relative flex-1 flex flex-col min-w-0 overflow-hidden' },
      React.createElement(
        'header',
        { className: 'min-h-[4rem] pt-[env(safe-area-inset-top)] bg-white/80 backdrop-blur-md border-b border-[#E6ECE7] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3 shrink-0 shadow-sm shadow-[#12241A]/[0.03]' },

        // Hamburger (phones / tablets only)
        React.createElement(
          'button',
          {
            type: 'button',
            'aria-label': 'Open menu',
            onClick: () => setSidebarOpen(true),
            className: 'lg:hidden relative h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#E4F2EA] to-[#D8ECDF] text-[#0F7B4A] ring-1 ring-[#0F7B4A]/15 shadow-sm active:scale-95 transition-all duration-200 shrink-0'
          },
          React.createElement(Menu, { className: 'h-5 w-5' }),
          (pendingCreditCount + lowStockCount) > 0 ? React.createElement('span', { className: 'absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white animate-pulse' }) : null
        ),

        React.createElement(
          'div',
          { className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-x-auto ' + noScrollbar },
          React.createElement('div', { className: 'h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/15 shrink-0' }),
          React.createElement('div', { className: 'font-black text-[11px] sm:text-xs text-[#12241A] whitespace-nowrap' }, 'የአዳማ ማዕከል ቀጥታ መስመር (Live Sync)'),
          pendingCreditCount > 0 ? React.createElement(
            'div',
            { className: 'text-[11px] font-black bg-gradient-to-b from-amber-50 to-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-sm shadow-amber-500/15 whitespace-nowrap shrink-0' },
            '💳 ' + pendingCreditCount + ' የብድር ጥያቄዎች'
          ) : null,
          lowStockCount > 0 ? React.createElement(
            'div',
            { className: 'text-[11px] font-black bg-gradient-to-b from-red-50 to-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 shadow-sm shadow-red-500/15 whitespace-nowrap shrink-0' },
            '⚠ ' + lowStockCount + ' እቃዎች መጋዘን አልቀዋል'
          ) : null
        ),

        React.createElement(
          'div',
          { className: 'flex items-center gap-1.5 sm:gap-3 shrink-0' },
          React.createElement(
            'button',
            {
              onClick: () => loadData(true),
              title: 'Manual Sync',
              className: 'p-2 hover:bg-[#E4F2EA] rounded-lg cursor-pointer text-gray-500 hover:text-[#0F7B4A] active:scale-95 transition-all duration-300'
            },
            React.createElement(RefreshCw, { className: 'h-4 w-4 sm:h-3.5 sm:w-3.5 ' + (isRefreshing ? 'animate-spin text-[#0F7B4A]' : '') })
          ),
          React.createElement('div', { className: 'text-[11px] sm:text-xs font-black text-[#0F7B4A] bg-gradient-to-b from-[#E4F2EA] to-[#D8ECDF] px-2.5 sm:px-3 py-1.5 rounded-full ring-1 ring-[#0F7B4A]/15 shadow-sm whitespace-nowrap' }, admin?.phone || admin?.phoneNumber || '0911000000')
        )
      ),

      React.createElement(
        'main',
        { className: 'flex-1 p-3 sm:p-6 lg:p-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain scroll-smooth' },
        React.createElement(
          'div',
          { className: 'max-w-6xl mx-auto space-y-4 sm:space-y-6' },

          // ==========================================
          // TAB: ORDERS
          // ==========================================
          activeTab === 'orders' ? React.createElement(
            'div',
            { className: 'space-y-3 sm:space-y-4' },
            React.createElement(
              'div',
              { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2' },
              React.createElement('h2', { className: 'text-sm sm:text-base font-black text-[#12241A] tracking-tight' }, 'የገቡ ትእዛዞች ዝርዝር (Standard Orders - ' + orders.length + ')'),
              React.createElement('span', { className: 'self-start sm:self-auto text-xs text-[#62726A] font-semibold bg-white border border-[#E6ECE7] px-3 py-1.5 rounded-full shadow-sm' }, 'ጠቅላላ ሽያጭ: ' + orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString() + ' ብር')
            ),
            orders.length === 0 ? React.createElement('div', { className: 'bg-white p-10 sm:p-12 text-center rounded-2xl border border-[#E6ECE7] shadow-sm text-xs text-[#62726A] font-semibold' }, 'ምንም የገባ ትእዛዝ የለም') :
            React.createElement(
              'div',
              { className: 'space-y-3' },
              orders.map((o) => {
                const items = o.items || o.orderItems || [];
                const isPending = o.status === 'PENDING';
                const isApproved = o.status === 'APPROVED' || o.status === 'CONFIRMED';
                const isDispatched = o.status === 'DISPATCHED';

                return React.createElement(
                  'div',
                  { key: o.id, className: 'bg-gradient-to-b from-white to-[#FCFDFB] p-4 sm:p-5 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-lg hover:shadow-[#12241A]/[0.07] hover:border-[#CFE7D9] transition-all duration-300 flex flex-col md:flex-row justify-between md:items-center gap-4' },
                  React.createElement(
                    'div',
                    { className: 'space-y-2 flex-1 min-w-0' },
                    React.createElement(
                      'div',
                      { className: 'flex items-center gap-x-3 gap-y-1.5 flex-wrap' },
                      React.createElement('span', { className: 'font-black text-sm text-[#12241A] break-words' }, o.user?.shopName || 'ሱቅ'),
                      React.createElement('span', { className: 'text-xs text-[#62726A] font-semibold' }, '📞 ' + (o.user?.phoneNumber || '')),
                      React.createElement('span', { className: 'text-[11px] px-2.5 py-0.5 rounded-full font-bold ring-1 shadow-sm ' + 
                        (isApproved ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 
                         isDispatched ? 'bg-blue-100 text-blue-700 ring-blue-200' : 
                         o.status === 'CANCELLED' ? 'bg-red-100 text-red-700 ring-red-200' : 'bg-amber-100 text-amber-700 ring-amber-200')
                      }, isPending ? '⏳ በመጠባበቅ ላይ' : isApproved ? '✅ የጸደቀ' : isDispatched ? '🚚 በመንገድ ላይ' : o.status)
                    ),
                    React.createElement(
                      'div',
                      { className: 'text-xs text-[#62726A] flex flex-wrap gap-x-4 gap-y-1 font-semibold' },
                      React.createElement('span', null, 'የማድረሻ ሰዓት: ' + (o.deliverySlot === 'BATCH_6AM' ? '🌅 ጠዋት 6:00' : '☀️ ቀትር 12:00')),
                      React.createElement('span', null, 'ቀን: ' + new Date(o.createdAt).toLocaleDateString('am-ET'))
                    ),
                    React.createElement(
                      'div',
                      { className: 'text-xs bg-gradient-to-b from-[#F9FBF8] to-[#F4F8F4] p-2.5 rounded-xl border border-[#EEF2EE] space-y-1.5' },
                      items.map((it, idx) => React.createElement(
                        'div',
                        { key: idx, className: 'flex justify-between gap-3 text-[#334155]' },
                        React.createElement('span', { className: 'min-w-0 break-words' }, '• ' + (it.product?.nameAm || 'እቃ') + ' (' + it.quantity + ' ' + (it.selectedUnit || it.unitType || 'ካርቶን') + ')'),
                        React.createElement('span', { className: 'font-bold shrink-0 whitespace-nowrap' }, (Number(it.unitPrice) * Number(it.quantity)).toLocaleString() + ' ብር')
                      ))
                    )
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex flex-col md:items-end gap-3 md:gap-2 w-full md:w-auto shrink-0 border-t border-[#EEF2EE] pt-3 md:border-0 md:pt-0' },
                    React.createElement('div', { className: 'font-black text-lg text-[#0F7B4A] drop-shadow-sm' }, Number(o.totalAmount || 0).toLocaleString() + ' ብር'),
                    React.createElement(
                      'div',
                      { className: 'flex gap-2 w-full md:w-auto' },
                      isPending ? React.createElement(
                        'button',
                        {
                          onClick: () => updateOrderStatus(o.id, 'APPROVED'),
                          className: 'flex-1 md:flex-none px-3.5 py-2.5 md:py-1.5 text-center ' + primaryBtn
                        },
                        'አጽድቅ (Approve)'
                      ) : null,
                      isApproved ? React.createElement(
                        'button',
                        {
                          onClick: () => updateOrderStatus(o.id, 'DISPATCHED'),
                          className: 'flex-1 md:flex-none px-3.5 py-2.5 md:py-1.5 text-center bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200'
                        },
                        'ላክ (Dispatch)'
                      ) : null,
                      isPending || isApproved ? React.createElement(
                        'button',
                        {
                          onClick: () => updateOrderStatus(o.id, 'CANCELLED'),
                          className: 'flex-1 md:flex-none px-2.5 py-2.5 md:py-1.5 text-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold cursor-pointer ring-1 ring-red-100 hover:ring-red-200 active:scale-[0.98] transition-all duration-200'
                        },
                        'ሰርዝ (Cancel)'
                      ) : null
                    )
                  )
                );
              })
            )
          ) : null,

          // ==========================================
          // TAB: CREDIT REQUESTS
          // ==========================================
          activeTab === 'credit' ? React.createElement(
            'div',
            { className: 'space-y-3 sm:space-y-4' },
            React.createElement(
              'div',
              { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-1.5' },
              React.createElement('h2', { className: 'text-sm sm:text-base font-black text-[#12241A] tracking-tight' }, 'የብድር ጥያቄዎችና ሂሳብ መዝገብ (Credit Ledger - ' + creditOrders.length + ')'),
              React.createElement('span', { className: 'text-xs text-amber-700 font-bold' }, '*ፈቃድ የተሰጠው ብድር ሲከፈል "ተከፍሏል" የሚለውን ይጫኑ')
            ),
            creditOrders.length === 0 ? React.createElement('div', { className: 'bg-white p-10 sm:p-12 text-center rounded-2xl border border-[#E6ECE7] shadow-sm text-xs text-[#62726A] font-semibold' }, 'ምንም የብድር ጥያቄ የለም') :
            React.createElement(
              'div',
              { className: 'space-y-3' },
              creditOrders.map((co) => {
                const items = co.items || co.orderItems || [];
                const isPaid = co.isCreditSettled === true;
                const isApproved = co.creditApproved === true && !isPaid;
                const isRejected = co.creditApproved === false;
                const isWaiting = co.creditApproved === null;

                const limit = Number(co.user?.creditLimit || 20000);
                const used = Number(co.user?.usedCredit || 0);
                const remaining = limit - used;

                return React.createElement(
                  'div',
                  { key: co.id, className: 'bg-gradient-to-b from-white to-[#FCFDFB] p-4 sm:p-5 rounded-2xl border border-[#E6ECE7] shadow-sm hover:shadow-lg hover:shadow-[#12241A]/[0.07] hover:border-[#CFE7D9] transition-all duration-300 flex flex-col md:flex-row justify-between md:items-center gap-4' },
                  React.createElement(
                    'div',
                    { className: 'space-y-2 flex-1 min-w-0' },
                    React.createElement(
                      'div',
                      { className: 'flex items-center gap-x-3 gap-y-1.5 flex-wrap' },
                      React.createElement('span', { className: 'font-black text-sm text-[#12241A] break-words' }, co.user?.shopName || 'ሱቅ'),
                      React.createElement('span', { className: 'text-xs text-[#62726A] font-semibold' }, '📞 ' + (co.user?.phoneNumber || '')),
                      React.createElement('span', { className: 'text-[11px] px-2.5 py-0.5 rounded-full font-black ring-1 shadow-sm ' +
                        (isPaid ? 'bg-blue-100 text-blue-800 ring-blue-200' :
                         isApproved ? 'bg-emerald-100 text-emerald-800 ring-emerald-200' :
                         isRejected ? 'bg-red-100 text-red-700 ring-red-200' : 'bg-amber-100 text-amber-800 ring-amber-200 animate-pulse')
                      }, isPaid ? '✅ ተከፍሏል (Paid)' : isApproved ? '✔ ተፈቅዷል (Allowed)' : isRejected ? '❌ ውድቅ የተደረገ' : '⏳ ፈቃድ በመጠባበቅ ላይ')
                    ),
                    React.createElement(
                      'div',
                      { className: 'text-xs flex gap-x-6 gap-y-1 text-[#62726A] flex-wrap' },
                      React.createElement('span', null, 'የብድር ጣሪያ: ' + limit.toLocaleString() + ' ብር'),
                      React.createElement('span', null, 'የተወሰደ: ' + used.toLocaleString() + ' ብር'),
                      React.createElement('span', { className: 'font-bold text-[#0F7B4A]' }, 'የቀረ ጣሪያ: ' + remaining.toLocaleString() + ' ብር')
                    ),
                    React.createElement(
                      'div',
                      { className: 'text-xs bg-gradient-to-b from-[#F9FBF8] to-[#F4F8F4] p-2.5 rounded-xl border border-[#EEF2EE] space-y-1.5' },
                      items.map((it, idx) => React.createElement(
                        'div',
                        { key: idx, className: 'flex justify-between gap-3 text-[#334155]' },
                        React.createElement('span', { className: 'min-w-0 break-words' }, '• ' + (it.product?.nameAm || 'እቃ') + ' (' + it.quantity + ' ' + (it.selectedUnit || it.unitType || 'ካርቶን') + ')'),
                        React.createElement('span', { className: 'font-bold shrink-0 whitespace-nowrap' }, (Number(it.unitPrice) * Number(it.quantity)).toLocaleString() + ' ብር')
                      ))
                    )
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex flex-col md:items-end gap-3 md:gap-2 w-full md:w-auto shrink-0 border-t border-[#EEF2EE] pt-3 md:border-0 md:pt-0' },
                    React.createElement('div', { className: 'font-black text-lg drop-shadow-sm ' + (isPaid ? 'text-blue-700' : 'text-amber-700') },
                      Number(co.totalAmount || 0).toLocaleString() + ' ብር ' + (isPaid ? '(የተከፈለ)' : '(በብድር)')
                    ),
                    isWaiting ? React.createElement(
                      'div',
                      { className: 'flex gap-2 w-full md:w-auto' },
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleApproveCredit(co.id, true),
                          className: 'flex-1 md:flex-none px-3.5 py-2.5 md:py-1.5 text-center ' + primaryBtn
                        },
                        'ፍቀድ (Approve)'
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleApproveCredit(co.id, false),
                          className: 'flex-1 md:flex-none px-3 py-2.5 md:py-1.5 text-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold cursor-pointer ring-1 ring-red-100 hover:ring-red-200 active:scale-[0.98] transition-all duration-200'
                        },
                        'ከልክል (Reject)'
                      )
                    ) : isApproved ? React.createElement(
                      'button',
                      {
                        onClick: () => handleSettleCredit(co.id),
                        className: 'w-full md:w-auto px-3.5 py-2.5 md:py-1.5 text-center bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/45 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200'
                      },
                      'ተከፍሏል (Mark as Paid)'
                    ) : React.createElement(
                      'span',
                      { className: 'text-xs font-black ' + (isPaid ? 'text-blue-600' : 'text-gray-400') },
                      isPaid ? 'ክፍያው ተጠናቋል ✔' : 'ውድቅ ተደርጓል ✕'
                    )
                  )
                );
              })
            )
          ) : null,

          // ==========================================
          // TAB: PRODUCTS (With 4-Tier Breakdown Pricing)
          // ==========================================
          activeTab === 'products' ? React.createElement(
            'div',
            { className: 'space-y-4 sm:space-y-6' },
            React.createElement(
              'form',
              { onSubmit: submitProduct, className: panelBase + ' p-4 sm:p-6 space-y-4' },
              React.createElement('h2', { className: 'text-sm sm:text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ እቃ ወደ መጋዘን መመዝገቢያ (Add Product with Tiered Pricing)'),
              React.createElement(
                'div',
                { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
                React.createElement(
                  'select',
                  {
                    value: prodForm.categoryId,
                    required: true,
                    onChange: (e) => setProdForm({ ...prodForm, categoryId: e.target.value }),
                    className: inputBase + ' font-semibold'
                  },
                  React.createElement('option', { value: '' }, '-- ምድብ ይምረጡ (Select Category) --'),
                  categories.map((c) => React.createElement('option', { key: c.id, value: c.id }, c.nameAm))
                ),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'የእቃው ስም (አማርኛ)',
                  value: prodForm.nameAm,
                  required: true,
                  onChange: (e) => setProdForm({ ...prodForm, nameAm: e.target.value }),
                  className: inputBase
                }),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'የእቃው ስም (ኦሮምኛ)',
                  value: prodForm.nameOm,
                  onChange: (e) => setProdForm({ ...prodForm, nameOm: e.target.value }),
                  className: inputBase
                }),
                React.createElement('input', {
                  type: 'number',
                  inputMode: 'decimal',
                  placeholder: 'ሙሉ የካርቶን / ደርዘን ዋጋ (ብር)',
                  value: prodForm.pricePerUnit,
                  required: true,
                  onChange: (e) => setProdForm({ ...prodForm, pricePerUnit: e.target.value }),
                  className: inputBase + ' font-bold text-[#0F7B4A]'
                }),
                React.createElement('input', {
                  type: 'number',
                  inputMode: 'decimal',
                  placeholder: 'እውነተኛ የመጋዘን ክምችት (Actual Stock - Admin Only)',
                  value: prodForm.actualStock,
                  required: true,
                  onChange: (e) => setProdForm({ ...prodForm, actualStock: e.target.value }),
                  className: inputBase + ' font-bold text-gray-800'
                }),
                React.createElement('input', {
                  type: 'number',
                  inputMode: 'decimal',
                  placeholder: 'በመተግበሪያው የሚታይ ክምችት (Posted Stock - App Display)',
                  value: prodForm.postedStock,
                  required: true,
                  onChange: (e) => setProdForm({ ...prodForm, postedStock: e.target.value }),
                  className: inputBase + ' font-bold text-[#0F7B4A]'
                })
              ),

              // Breakdown Pricing Sub-Grid (Half Carton, Half Dozen, Packet)
              React.createElement(
                'div',
                { className: 'p-3 sm:p-4 rounded-xl border border-[#DDE4DD] bg-[#FAFCFA] space-y-3' },
                React.createElement('p', { className: 'text-xs font-black text-[#12241A]' }, 'የችርቻሮ መሸጫ ደረጃዎችና ዋጋዎች (Breakdown Pricing Options):'),
                React.createElement(
                  'div',
                  { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
                  // Half Carton Tier
                  React.createElement(
                    'div',
                    { className: 'p-3 sm:p-2.5 rounded-lg border border-[#E6ECE7] bg-white space-y-2' },
                    React.createElement(
                      'label',
                      { className: 'flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12241A]' },
                      React.createElement('input', {
                        type: 'checkbox',
                        checked: prodForm.allowsHalfCarton,
                        onChange: (e) => setProdForm({ ...prodForm, allowsHalfCarton: e.target.checked }),
                        className: 'h-4 w-4 rounded text-[#0F7B4A] focus:ring-[#0F7B4A]'
                      }),
                      React.createElement('span', null, 'ግማሽ ካርቶን (Half Carton)')
                    ),
                    prodForm.allowsHalfCarton ? React.createElement('input', {
                      type: 'number',
                      inputMode: 'decimal',
                      placeholder: 'የግማሽ ካርቶን ዋጋ (ብር)',
                      value: prodForm.priceHalfCarton,
                      onChange: (e) => setProdForm({ ...prodForm, priceHalfCarton: e.target.value }),
                      className: inputBase + ' font-bold'
                    }) : null
                  ),
                  // Half Dozen Tier
                  React.createElement(
                    'div',
                    { className: 'p-3 sm:p-2.5 rounded-lg border border-[#E6ECE7] bg-white space-y-2' },
                    React.createElement(
                      'label',
                      { className: 'flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12241A]' },
                      React.createElement('input', {
                        type: 'checkbox',
                        checked: prodForm.allowsHalfDozen,
                        onChange: (e) => setProdForm({ ...prodForm, allowsHalfDozen: e.target.checked }),
                        className: 'h-4 w-4 rounded text-[#0F7B4A] focus:ring-[#0F7B4A]'
                      }),
                      React.createElement('span', null, 'ግማሽ ደርዘን (Half Dozen)')
                    ),
                    prodForm.allowsHalfDozen ? React.createElement('input', {
                      type: 'number',
                      inputMode: 'decimal',
                      placeholder: 'የግማሽ ደርዘን ዋጋ (ብር)',
                      value: prodForm.priceHalfDozen,
                      onChange: (e) => setProdForm({ ...prodForm, priceHalfDozen: e.target.value }),
                      className: inputBase + ' font-bold'
                    }) : null
                  ),
                  // Packet Tier
                  React.createElement(
                    'div',
                    { className: 'p-3 sm:p-2.5 rounded-lg border border-[#E6ECE7] bg-white space-y-2' },
                    React.createElement(
                      'label',
                      { className: 'flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12241A]' },
                      React.createElement('input', {
                        type: 'checkbox',
                        checked: prodForm.allowsPacket,
                        onChange: (e) => setProdForm({ ...prodForm, allowsPacket: e.target.checked }),
                        className: 'h-4 w-4 rounded text-[#0F7B4A] focus:ring-[#0F7B4A]'
                      }),
                      React.createElement('span', null, 'ፓኬት / ቁራጭ (Packet / Piece)')
                    ),
                    prodForm.allowsPacket ? React.createElement('input', {
                      type: 'number',
                      inputMode: 'decimal',
                      placeholder: 'የአንድ ፓኬት ዋጋ (ብር)',
                      value: prodForm.pricePacket,
                      onChange: (e) => setProdForm({ ...prodForm, pricePacket: e.target.value }),
                      className: inputBase + ' font-bold'
                    }) : null
                  )
                )
              ),

              // Product Image Uploader
              React.createElement(
                'div',
                { className: 'p-4 sm:p-3 border-2 border-dashed border-[#DDE4DD] rounded-xl text-center md:col-span-2 hover:border-[#0F7B4A]/50 hover:bg-[#F5FAF7] transition-colors duration-200' },
                React.createElement('input', {
                  type: 'file',
                  accept: 'image/*',
                  id: 'prodImgInput',
                  className: 'hidden',
                  onChange: (e) => handleFileUpload(e.target.files[0], 'prod', (url) => setProdForm({ ...prodForm, imageUrl: url }))
                }),
                React.createElement(
                  'label',
                  { htmlFor: 'prodImgInput', className: 'cursor-pointer text-xs font-black text-[#0F7B4A] inline-flex items-center gap-2' },
                  React.createElement(Upload, { className: 'h-4 w-4' }),
                  React.createElement('span', null, uploadingSlot === 'prod' ? 'በመጫን ላይ...' : prodForm.imageUrl ? 'የምርት ፎቶ ተመርጧል ✔' : 'የምርት ፎቶ ስቀል (Upload Image)')
                ),
                prodForm.imageUrl ? React.createElement(
                  'div',
                  { className: 'mt-2 flex items-center justify-center gap-2' },
                  React.createElement('img', { src: prodForm.imageUrl, className: 'h-10 w-10 object-cover rounded-lg border', alt: '' }),
                  React.createElement('span', { className: 'text-[10px] text-gray-500 font-mono truncate max-w-[160px] sm:max-w-xs' }, prodForm.imageUrl)
                ) : null
              ),
              React.createElement('button', { type: 'submit', className: 'w-full sm:w-auto py-3 sm:py-2.5 px-6 ' + primaryBtn }, 'ምርቱን መዝግብ')
            ),

            // Products list
            React.createElement(
              'div',
              { className: panelBase + ' overflow-hidden' },
              React.createElement(
                'div',
                { className: 'p-4 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1' },
                React.createElement('div', { className: 'font-black text-xs text-[#12241A]' }, 'የመጋዘን እቃዎችና ዝርዝር ዋጋዎች (' + products.length + ')'),
                React.createElement('div', { className: 'text-[11px] text-[#62726A]' }, '*ቀይ ማስጠንቀቂያ እውነተኛ የመጋዘን ክምችት ከ 5 በታች ሲሆን ብቻ ይበራል')
              ),

              // Mobile cards
              React.createElement(
                'div',
                { className: 'md:hidden p-3 space-y-3' },
                products.map((p) => {
                  const actual = p.actualStock !== undefined && p.actualStock !== null ? Number(p.actualStock) : Number(p.currentStock ?? 0);
                  const posted = p.postedStock !== undefined && p.postedStock !== null ? Number(p.postedStock) : Number(p.currentStock ?? 0);
                  const isLow = actual < 5;
                  return React.createElement(
                    'div',
                    { key: p.id, className: 'p-3.5 rounded-2xl border shadow-sm space-y-3 ' + (isLow ? 'border-red-200 bg-red-50/40' : 'border-[#E6ECE7] bg-white') },
                    React.createElement(
                      'div',
                      { className: 'flex items-start gap-3' },
                      renderProductImage(p, 'w-14 h-14'),
                      React.createElement(
                        'div',
                        { className: 'min-w-0 flex-1' },
                        React.createElement('div', { className: 'font-black text-sm text-[#12241A] break-words' }, p.nameAm),
                        React.createElement('div', { className: 'text-[11px] text-[#62726A]' }, p.nameOm || '-'),
                        React.createElement('span', { className: 'inline-block mt-1 px-2 py-0.5 rounded-full bg-[#F1F5F2] text-[#62726A] text-[10px] font-bold' }, p.category?.nameAm || '-')
                      )
                    ),
                    React.createElement('div', { className: 'text-xs p-2.5 rounded-xl bg-[#F9FBF8] border border-[#EEF2EE]' }, renderPriceLines(p)),
                    renderStockBadges(actual, posted, isLow),
                    renderProductActions(p, true)
                  );
                })
              ),

              // Desktop table
              React.createElement(
                'div',
                { className: 'hidden md:block overflow-x-auto' },
                React.createElement(
                  'table',
                  { className: 'w-full text-left text-xs min-w-[720px]' },
                  React.createElement(
                    'thead',
                    { className: 'bg-gradient-to-b from-[#F8FAF7] to-[#F3F7F3] border-b border-[#E6ECE7]' },
                    React.createElement('tr', null,
                      React.createElement('th', { className: thCls }, 'ፎቶ'),
                      React.createElement('th', { className: thCls }, 'የእቃው ስም'),
                      React.createElement('th', { className: thCls }, 'ምድብ'),
                      React.createElement('th', { className: thCls }, 'የካርቶን / ዝርዝር ዋጋዎች'),
                      React.createElement('th', { className: thCls }, 'መጋዘን / አፕ ላይ'),
                      React.createElement('th', { className: thCls + ' text-right' }, 'እርምጃዎች')
                    )
                  ),
                  React.createElement(
                    'tbody',
                    { className: 'divide-y divide-[#E6ECE7]' },
                    products.map((p) => {
                      const actual = p.actualStock !== undefined && p.actualStock !== null ? Number(p.actualStock) : Number(p.currentStock ?? 0);
                      const posted = p.postedStock !== undefined && p.postedStock !== null ? Number(p.postedStock) : Number(p.currentStock ?? 0);
                      const isLow = actual < 5;

                      return React.createElement(
                        'tr',
                        { key: p.id, className: (isLow ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-[#F8FAF7]') + ' transition-colors duration-150' },
                        React.createElement('td', { className: 'p-3' }, renderProductImage(p, 'w-10 h-10')),
                        React.createElement('td', { className: 'p-3' },
                          React.createElement('div', { className: 'font-black text-[#12241A]' }, p.nameAm),
                          React.createElement('div', { className: 'text-[11px] text-[#62726A]' }, p.nameOm || '-')
                        ),
                        React.createElement('td', { className: 'p-3 text-[#62726A] font-semibold' }, p.category?.nameAm || '-'),
                        React.createElement('td', { className: 'p-3' }, renderPriceLines(p)),
                        React.createElement('td', { className: 'p-3' }, renderStockBadges(actual, posted, isLow)),
                        React.createElement('td', { className: 'p-3' }, renderProductActions(p, false))
                      );
                    })
                  )
                )
              )
            )
          ) : null,

          // ==========================================
          // TAB: CATEGORIES
          // ==========================================
          activeTab === 'categories' ? React.createElement(
            'div',
            { className: 'space-y-4 sm:space-y-6' },
            React.createElement(
              'form',
              { onSubmit: submitCategory, className: panelBase + ' p-4 sm:p-6 space-y-3' },
              React.createElement('h2', { className: 'text-sm sm:text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ የምርት ምድብ መመዝገቢያ (Add Category)'),
              React.createElement(
                'div',
                { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'የምድብ ስም በአማርኛ',
                  value: catForm.nameAm,
                  required: true,
                  onChange: (e) => setCatForm({ ...catForm, nameAm: e.target.value }),
                  className: inputBase
                }),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'የምድብ ስም በኦሮምኛ',
                  value: catForm.nameOm,
                  onChange: (e) => setCatForm({ ...catForm, nameOm: e.target.value }),
                  className: inputBase
                }),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'ኢሞጂ ወይም ምስል',
                  value: catForm.iconUrl,
                  onChange: (e) => setCatForm({ ...catForm, iconUrl: e.target.value }),
                  className: inputBase
                })
              ),
              React.createElement('button', { type: 'submit', className: 'w-full sm:w-auto py-3 sm:py-2 px-6 ' + primaryBtn }, 'ምድቡን መዝግብ')
            ),
            React.createElement(
              'div',
              { className: panelBase + ' overflow-hidden' },
              React.createElement('div', { className: 'p-4 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] font-black text-xs text-[#12241A]' }, 'ነባር ምድቦች (' + categories.length + ')'),

              // Mobile list
              React.createElement(
                'div',
                { className: 'md:hidden divide-y divide-[#E6ECE7]' },
                categories.map((c) => React.createElement(
                  'div',
                  { key: c.id, className: 'flex items-center gap-3 p-3.5' },
                  React.createElement('div', { className: 'h-11 w-11 rounded-xl bg-[#F1F7F3] flex items-center justify-center text-2xl shrink-0' }, c.iconUrl || '📦'),
                  React.createElement(
                    'div',
                    { className: 'min-w-0 flex-1' },
                    React.createElement('div', { className: 'font-black text-sm text-[#12241A] break-words' }, c.nameAm),
                    React.createElement('div', { className: 'text-[11px] text-[#62726A] font-semibold' }, c.nameOm || '-')
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => deleteCategory(c.id, c.nameAm),
                      className: 'px-2.5 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-all duration-200 shrink-0'
                    },
                    React.createElement(Trash2, { className: 'h-3.5 w-3.5' }),
                    React.createElement('span', null, 'ምድቡን ሰርዝ')
                  )
                ))
              ),

              // Desktop table
              React.createElement(
                'div',
                { className: 'hidden md:block overflow-x-auto' },
                React.createElement(
                  'table',
                  { className: 'w-full text-left text-xs' },
                  React.createElement(
                    'thead',
                    { className: 'bg-gradient-to-b from-[#F8FAF7] to-[#F3F7F3] border-b border-[#E6ECE7]' },
                    React.createElement('tr', null,
                      React.createElement('th', { className: thCls }, 'አይኮን'),
                      React.createElement('th', { className: thCls }, 'ስም (አማርኛ)'),
                      React.createElement('th', { className: thCls }, 'ስም (ኦሮምኛ)'),
                      React.createElement('th', { className: thCls + ' text-right' }, 'እርምጃ')
                    )
                  ),
                  React.createElement(
                    'tbody',
                    { className: 'divide-y divide-[#E6ECE7]' },
                    categories.map((c) => React.createElement(
                      'tr',
                      { key: c.id, className: 'hover:bg-[#F8FAF7] transition-colors duration-150' },
                      React.createElement('td', { className: 'p-3 text-xl' }, c.iconUrl || '📦'),
                      React.createElement('td', { className: 'p-3 font-black text-[#12241A]' }, c.nameAm),
                      React.createElement('td', { className: 'p-3 text-[#62726A] font-semibold' }, c.nameOm || '-'),
                      React.createElement(
                        'td',
                        { className: 'p-3 text-right' },
                        React.createElement(
                          'button',
                          {
                            onClick: () => deleteCategory(c.id, c.nameAm),
                            className: 'p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer inline-flex items-center gap-1 font-bold'
                          },
                          React.createElement(Trash2, { className: 'h-3.5 w-3.5' }),
                          React.createElement('span', null, 'ምድቡን ሰርዝ')
                        )
                      )
                    ))
                  )
                )
              )
            )
          ) : null,

          // ==========================================
          // TAB: ADVERTISEMENTS (Up to 3 Images or MP4 Videos)
          // ==========================================
          activeTab === 'ads' ? React.createElement(
            'div',
            { className: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6' },
            React.createElement(
              'form',
              { onSubmit: submitBanner, className: panelBase + ' p-4 sm:p-6 space-y-4' },
              React.createElement('h2', { className: 'text-sm sm:text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ ማስታወቂያ ስቀል (3-Slot Image & Video Studio)'),
              React.createElement('input', {
                type: 'text',
                placeholder: 'የማስታወቂያ ርዕስ (Title)',
                value: adForm.title,
                required: true,
                onChange: (e) => setAdForm({ ...adForm, title: e.target.value }),
                className: inputBase
              }),

              // 3 Distinct Media Upload Slots
              React.createElement(
                'div',
                { className: 'space-y-2.5' },
                React.createElement('p', { className: 'text-[11px] font-black text-[#62726A]' }, 'እስከ 3 የሚደርሱ ምስሎች ወይም 15 ሰከንድ ቪዲዮዎች ይስቀሉ:'),
                [0, 1, 2].map((slotIdx) => {
                  const slot = adForm.mediaSlots[slotIdx];
                  const slotKey = 'slot' + slotIdx;
                  const isUploading = uploadingSlot === slotKey;

                  return React.createElement(
                    'div',
                    { key: slotIdx, className: 'p-3 border rounded-xl bg-[#FAFCFA] border-[#DDE4DD] flex items-center justify-between gap-3 hover:border-[#BFDCCB] transition-colors duration-200' },
                    React.createElement(
                      'div',
                      { className: 'flex items-center gap-2.5 overflow-hidden flex-1 min-w-0' },
                      slot.url ? (
                        slot.type === 'VIDEO'
                          ? React.createElement('div', { className: 'w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0' }, '▶')
                          : React.createElement('img', { src: slot.url, className: 'w-10 h-10 object-cover rounded-lg border shrink-0', alt: '' })
                      ) : React.createElement(
                        'div',
                        { className: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs shrink-0' },
                        slotIdx + 1
                      ),
                      React.createElement(
                        'div',
                        { className: 'overflow-hidden flex-1 min-w-0' },
                        React.createElement('p', { className: 'text-xs font-bold text-[#12241A]' }, 'ማስታወቂያ ክፍል ' + (slotIdx + 1)),
                        React.createElement('p', { className: 'text-[10px] text-[#62726A] truncate' }, slot.url || 'ፋይል አልተመረጠም')
                      )
                    ),
                    React.createElement(
                      'div',
                      { className: 'shrink-0' },
                      React.createElement('input', {
                        type: 'file',
                        accept: 'image/*,video/mp4',
                        id: 'mediaInput' + slotIdx,
                        className: 'hidden',
                        onChange: (e) => handleFileUpload(e.target.files[0], slotKey, (url, type) => {
                          const updated = [...adForm.mediaSlots];
                          updated[slotIdx] = { url, type };
                          setAdForm({ ...adForm, mediaSlots: updated });
                        })
                      }),
                      React.createElement(
                        'label',
                        {
                          htmlFor: 'mediaInput' + slotIdx,
                          className: 'px-3.5 py-2 sm:px-3 sm:py-1.5 bg-[#E4F2EA] text-[#0F7B4A] hover:bg-[#d5ebde] rounded-lg text-xs font-black cursor-pointer inline-flex items-center gap-1 active:scale-95 transition-all duration-200'
                        },
                        React.createElement(Upload, { className: 'h-3.5 w-3.5' }),
                        React.createElement('span', null, isUploading ? '...' : slot.url ? 'ቀይር' : 'ስቀል')
                      )
                    )
                  );
                })
              ),

              React.createElement('button', { type: 'submit', className: 'w-full py-3 sm:py-2.5 ' + primaryBtn }, 'ማስታወቂያውን በሞባይል ላይ ልቀቅ')
            ),

            // Active Ads List with Media Counters
            React.createElement(
              'div',
              { className: panelBase + ' p-4 sm:p-6 space-y-3' },
              React.createElement('h3', { className: 'text-sm font-black text-[#12241A] tracking-tight' }, 'በአሁኑ ሰዓት የሚሰሩ ማስታወቂያዎች (' + banners.length + ')'),
              banners.map((b) => {
                const totalMedia = Array.isArray(b.mediaUrls) && b.mediaUrls.length > 0 ? b.mediaUrls.length : (b.mediaUrl ? 1 : 0);
                const isVideo = b.mediaType === 'VIDEO';

                return React.createElement(
                  'div',
                  { key: b.id, className: 'p-3 border border-[#E6ECE7] rounded-xl text-xs flex gap-3 items-center bg-gradient-to-r from-white to-[#FCFDFB] hover:border-[#CFE7D9] hover:shadow-sm transition-all duration-200' },
                  isVideo
                    ? React.createElement('div', { className: 'w-14 h-14 bg-gradient-to-br from-[#12241A] to-black text-white flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 ring-1 ring-white/10' }, '▶ ቪዲዮ')
                    : React.createElement('img', { src: b.mediaUrl || b.mediaUrls?.[0], className: 'w-14 h-14 rounded-lg object-cover shrink-0 ring-1 ring-[#E6ECE7] shadow-sm', alt: '' }),
                  React.createElement(
                    'div',
                    { className: 'overflow-hidden flex-1 min-w-0' },
                    React.createElement('p', { className: 'font-black truncate text-[#12241A]' }, b.title),
                    React.createElement('p', { className: 'text-[11px] text-[#62726A] font-semibold' }, isVideo ? 'የቪዲዮ ማስታወቂያ' : 'የምስል ማስታወቂያ'),
                    React.createElement('span', { className: 'text-[10px] text-[#0F7B4A] font-bold bg-[#E4F2EA] px-2 py-0.5 rounded-full inline-block mt-1' }, totalMedia + ' ሚዲያ ፋይሎች (Files)')
                  )
                );
              })
            )
          ) : null,

          // ==========================================
          // TAB: USERS & RBAC (With Deny/Block Login Action)
          // ==========================================
          activeTab === 'users' ? React.createElement(
            'div',
            { className: 'space-y-4 sm:space-y-6' },
            React.createElement(
              'form',
              { onSubmit: submitUser, className: panelBase + ' p-4 sm:p-6 space-y-4' },
              React.createElement('h2', { className: 'text-sm sm:text-base font-black text-[#12241A] tracking-tight' }, 'አዲስ አስተዳዳሪና የተፈቀዱ ገጾች መመዝገቢያ'),
              React.createElement(
                'div',
                { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
                React.createElement('input', {
                  type: 'text',
                  inputMode: 'tel',
                  placeholder: 'ስልክ ቁጥር (09...)',
                  value: userForm.phoneNumber,
                  required: true,
                  onChange: (e) => setUserForm({ ...userForm, phoneNumber: e.target.value }),
                  className: inputBase
                }),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'የአስተዳዳሪው ስም / የስራ ክፍል',
                  value: userForm.shopName,
                  required: true,
                  onChange: (e) => setUserForm({ ...userForm, shopName: e.target.value }),
                  className: inputBase
                }),
                React.createElement('input', {
                  type: 'password',
                  placeholder: 'የይለፍ ቃል (Password)',
                  value: userForm.password,
                  required: true,
                  onChange: (e) => setUserForm({ ...userForm, password: e.target.value }),
                  className: inputBase
                })
              ),
              React.createElement(
                'div',
                { className: 'space-y-2 pt-2' },
                React.createElement('label', { className: 'text-xs font-black text-[#12241A] block' }, 'ለዚህ አስተዳዳሪ የሚፈቀዱ የሳይድባር ገጾች:'),
                React.createElement(
                  'div',
                  { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5' },
                  ALL_SYSTEM_TABS.map((t) => {
                    const isChecked = userForm.allowedTabs.includes(t.id);
                    return React.createElement(
                      'button',
                      {
                        key: t.id,
                        type: 'button',
                        onClick: () => toggleTabInCreation(t.id),
                        className: 'flex items-center gap-2.5 p-3 sm:p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer text-left active:scale-[0.98] ' +
                          (isChecked ? 'border-[#0F7B4A] bg-[#E4F2EA] text-[#0F7B4A] shadow-sm' : 'border-[#E6ECE7] bg-white text-[#62726A] hover:border-[#BFDCCB]')
                      },
                      React.createElement('div', {
                        className: 'w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 shrink-0 ' +
                          (isChecked ? 'border-[#0F7B4A] bg-[#0F7B4A] text-white' : 'border-gray-300 bg-white')
                      }, isChecked ? '✓' : ''),
                      React.createElement('span', null, t.name)
                    );
                  })
                )
              ),
              React.createElement('button', { type: 'submit', className: 'w-full sm:w-auto py-3 sm:py-2.5 px-6 ' + primaryBtn }, 'አዲሱን Admin መዝግብ')
            ),

            React.createElement(
              'div',
              { className: panelBase + ' overflow-hidden' },
              React.createElement('div', { className: 'p-4 border-b border-[#E6ECE7] bg-gradient-to-b from-white to-[#FAFCFA] font-black text-xs text-[#12241A]' }, 'የተጠቃሚዎች ዝርዝርና የመግቢያ ፍቃድ ሁኔታ (' + usersList.length + ')'),

              // Mobile cards
              React.createElement(
                'div',
                { className: 'md:hidden p-3 space-y-3' },
                usersList.map((u) => {
                  const isSuper = u.role === 'SUPERADMIN' || u.phoneNumber === '0911000000';
                  const activeTabs = u.allowedTabs || ['orders'];
                  const isRejected = u.approvalStatus === 'REJECTED' || u.approvalStatus === 'SUSPENDED';
                  return React.createElement(
                    'div',
                    { key: u.id, className: 'p-3.5 rounded-2xl border border-[#E6ECE7] bg-white shadow-sm space-y-3' },
                    React.createElement(
                      'div',
                      { className: 'flex items-start justify-between gap-2' },
                      React.createElement(
                        'div',
                        { className: 'min-w-0' },
                        React.createElement('div', { className: 'font-black text-sm text-[#12241A] break-words' }, u.shopName),
                        React.createElement('div', { className: 'text-[11px] text-[#62726A] font-semibold' }, u.phoneNumber)
                      ),
                      React.createElement('span', { className: 'px-2 py-0.5 rounded-full bg-[#F1F5F2] text-[#62726A] text-[10px] font-black shrink-0' }, u.role)
                    ),
                    React.createElement(
                      'div',
                      { className: 'space-y-1.5' },
                      React.createElement('div', { className: 'text-[10px] font-black text-[#62726A]' }, 'የተፈቀዱ ገጾች'),
                      renderUserTabs(isSuper, activeTabs)
                    ),
                    renderUserStatus(isRejected),
                    renderUserActions(u, isSuper, activeTabs, true)
                  );
                })
              ),

              // Desktop table
              React.createElement(
                'div',
                { className: 'hidden md:block overflow-x-auto' },
                React.createElement(
                  'table',
                  { className: 'w-full text-left text-xs min-w-[720px]' },
                  React.createElement(
                    'thead',
                    { className: 'bg-gradient-to-b from-[#F8FAF7] to-[#F3F7F3] border-b border-[#E6ECE7]' },
                    React.createElement('tr', null,
                      React.createElement('th', { className: thCls }, 'ስልክ / ሱቅ'),
                      React.createElement('th', { className: thCls }, 'ሚና'),
                      React.createElement('th', { className: thCls }, 'የተፈቀዱ ገጾች'),
                      React.createElement('th', { className: thCls }, 'የፍቃድ ሁኔታ (Status)'),
                      React.createElement('th', { className: thCls + ' text-right' }, 'እርምጃ (Actions)')
                    )
                  ),
                  React.createElement(
                    'tbody',
                    { className: 'divide-y divide-[#E6ECE7]' },
                    usersList.map((u) => {
                      const isSuper = u.role === 'SUPERADMIN' || u.phoneNumber === '0911000000';
                      const activeTabs = u.allowedTabs || ['orders'];
                      const isRejected = u.approvalStatus === 'REJECTED' || u.approvalStatus === 'SUSPENDED';

                      return React.createElement(
                        'tr',
                        { key: u.id, className: 'hover:bg-[#F8FAF7] transition-colors duration-150' },
                        React.createElement('td', { className: 'p-3 font-black text-[#12241A]' }, u.shopName, React.createElement('div', { className: 'text-[11px] text-[#62726A] font-semibold' }, u.phoneNumber)),
                        React.createElement('td', { className: 'p-3 font-bold' },
                          React.createElement('span', { className: 'px-2 py-0.5 rounded-full bg-[#F1F5F2] text-[#62726A] text-[10px] font-black' }, u.role)
                        ),
                        React.createElement('td', { className: 'p-3' }, renderUserTabs(isSuper, activeTabs)),
                        React.createElement('td', { className: 'p-3' }, renderUserStatus(isRejected)),
                        React.createElement('td', { className: 'p-3' }, renderUserActions(u, isSuper, activeTabs, false))
                      );
                    })
                  )
                )
              )
            )
          ) : null
        )
      )
    ),

    // ==========================================
    // MODAL: RESTOCK QUANTITY DIALOG
    // ==========================================
    restockModal.open ? React.createElement(
      'div',
      { className: modalOverlay },
      React.createElement(
        'form',
        { onSubmit: handleRestockSubmit, className: 'bg-white max-w-sm w-full p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center' },
          React.createElement('h3', { className: 'font-black text-sm text-[#12241A]' }, 'ክምችት ሙላ (Restock Product)'),
          React.createElement('button', { type: 'button', onClick: () => setRestockModal({ ...restockModal, open: false }), className: 'p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-[#F1F5F2] cursor-pointer' }, React.createElement(X, { className: 'h-4 w-4' }))
        ),
        React.createElement('p', { className: 'text-xs text-[#62726A]' }, 'ለምርቱ: ', React.createElement('b', { className: 'text-[#12241A]' }, restockModal.productName)),
        React.createElement(
          'div',
          null,
          React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የሚጨመረው የካርቶን ብዛት (+ Quantity)'),
          React.createElement('input', {
            type: 'number',
            inputMode: 'decimal',
            min: '1',
            value: restockModal.addedStock,
            required: true,
            onChange: (e) => setRestockModal({ ...restockModal, addedStock: e.target.value }),
            className: inputBase + ' font-black text-[#0F7B4A]'
          })
        ),
        React.createElement(
          'div',
          { className: 'flex gap-2 pt-2' },
          React.createElement('button', { type: 'button', onClick: () => setRestockModal({ ...restockModal, open: false }), className: 'flex-1 py-3 sm:py-2 text-xs font-bold bg-[#F1F5F2] hover:bg-[#E6EDE8] rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-200' }, 'ተመለስ'),
          React.createElement('button', { type: 'submit', className: 'flex-1 py-3 sm:py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer shadow-md shadow-amber-500/25 active:scale-[0.98] transition-all duration-200' }, 'አድስ (Restock)')
        )
      )
    ) : null,

    // ==========================================
    // MODAL: EDIT PRODUCT (4-TIER PRICING & DUAL STOCK)
    // ==========================================
    editingProduct ? React.createElement(
      'div',
      { className: modalOverlay },
      React.createElement(
        'form',
        { onSubmit: handleSaveEditProduct, className: 'bg-white max-w-lg w-full p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto overscroll-contain' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center' },
          React.createElement('h3', { className: 'font-black text-sm text-[#12241A]' }, 'ምርቱን አስተካክል (Edit Product)'),
          React.createElement('button', { type: 'button', onClick: () => setEditingProduct(null), className: 'p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-[#F1F5F2] cursor-pointer' }, React.createElement(X, { className: 'h-4 w-4' }))
        ),
        React.createElement(
          'div',
          { className: 'space-y-3' },
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የምርት ምድብ (Category)'),
            React.createElement(
              'select',
              {
                value: editingProduct.categoryId,
                required: true,
                onChange: (e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value }),
                className: inputBase
              },
              categories.map((c) => React.createElement('option', { key: c.id, value: c.id }, c.nameAm))
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የእቃው ስም (አማርኛ)'),
            React.createElement('input', {
              type: 'text',
              value: editingProduct.nameAm,
              required: true,
              onChange: (e) => setEditingProduct({ ...editingProduct, nameAm: e.target.value }),
              className: inputBase
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'የእቃው ስም (ኦሮምኛ)'),
            React.createElement('input', {
              type: 'text',
              value: editingProduct.nameOm || '',
              onChange: (e) => setEditingProduct({ ...editingProduct, nameOm: e.target.value }),
              className: inputBase
            })
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-1 sm:grid-cols-3 gap-2.5' },
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'ሙሉ ካርቶን (ብር)'),
              React.createElement('input', {
                type: 'number',
                inputMode: 'decimal',
                value: editingProduct.pricePerUnit,
                required: true,
                onChange: (e) => setEditingProduct({ ...editingProduct, pricePerUnit: e.target.value }),
                className: inputBase + ' font-bold'
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'መጋዘን (Actual)'),
              React.createElement('input', {
                type: 'number',
                inputMode: 'decimal',
                value: editingProduct.actualStock,
                required: true,
                onChange: (e) => setEditingProduct({ ...editingProduct, actualStock: e.target.value }),
                className: inputBase + ' font-bold text-gray-800'
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block mb-1' }, 'አፕ ላይ (Posted)'),
              React.createElement('input', {
                type: 'number',
                inputMode: 'decimal',
                value: editingProduct.postedStock,
                required: true,
                onChange: (e) => setEditingProduct({ ...editingProduct, postedStock: e.target.value }),
                className: inputBase + ' font-bold text-[#0F7B4A]'
              })
            )
          ),

          // Breakdown Pricing Tiers in Edit
          React.createElement(
            'div',
            { className: 'p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3' },
            React.createElement('p', { className: 'text-xs font-black text-gray-800' }, 'የችርቻሮ መሸጫ ደረጃዎች (Edit Tiers):'),
            // Half Carton
            React.createElement(
              'div',
              { className: 'flex items-center gap-2.5 sm:gap-3' },
              React.createElement('input', {
                type: 'checkbox',
                className: 'h-4 w-4 shrink-0',
                checked: editingProduct.allowsHalfCarton,
                onChange: (e) => setEditingProduct({ ...editingProduct, allowsHalfCarton: e.target.checked })
              }),
              React.createElement('span', { className: 'text-xs font-bold w-24 sm:w-28 shrink-0' }, 'ግማሽ ካርቶን'),
              React.createElement('input', {
                type: 'number',
                inputMode: 'decimal',
                placeholder: 'ዋጋ (ብር)',
                disabled: !editingProduct.allowsHalfCarton,
                value: editingProduct.priceHalfCarton,
                onChange: (e) => setEditingProduct({ ...editingProduct, priceHalfCarton: e.target.value }),
                className: inputBase + ' flex-1 min-w-0 disabled:opacity-50 disabled:bg-gray-100'
              })
            ),
            // Half Dozen
            React.createElement(
              'div',
              { className: 'flex items-center gap-2.5 sm:gap-3' },
              React.createElement('input', {
                type: 'checkbox',
                className: 'h-4 w-4 shrink-0',
                checked: editingProduct.allowsHalfDozen,
                onChange: (e) => setEditingProduct({ ...editingProduct, allowsHalfDozen: e.target.checked })
              }),
              React.createElement('span', { className: 'text-xs font-bold w-24 sm:w-28 shrink-0' }, 'ግማሽ ደርዘን'),
              React.createElement('input', {
                type: 'number',
                inputMode: 'decimal',
                placeholder: 'ዋጋ (ብር)',
                disabled: !editingProduct.allowsHalfDozen,
                value: editingProduct.priceHalfDozen,
                onChange: (e) => setEditingProduct({ ...editingProduct, priceHalfDozen: e.target.value }),
                className: inputBase + ' flex-1 min-w-0 disabled:opacity-50 disabled:bg-gray-100'
              })
            ),
            // Packet
            React.createElement(
              'div',
              { className: 'flex items-center gap-2.5 sm:gap-3' },
              React.createElement('input', {
                type: 'checkbox',
                className: 'h-4 w-4 shrink-0',
                checked: editingProduct.allowsPacket,
                onChange: (e) => setEditingProduct({ ...editingProduct, allowsPacket: e.target.checked })
              }),
              React.createElement('span', { className: 'text-xs font-bold w-24 sm:w-28 shrink-0' }, 'ፓኬት / ቁራጭ'),
              React.createElement('input', {
                type: 'number',
                inputMode: 'decimal',
                placeholder: 'ዋጋ (ብር)',
                disabled: !editingProduct.allowsPacket,
                value: editingProduct.pricePacket,
                onChange: (e) => setEditingProduct({ ...editingProduct, pricePacket: e.target.value }),
                className: inputBase + ' flex-1 min-w-0 disabled:opacity-50 disabled:bg-gray-100'
              })
            )
          ),

          // Edit Image Uploader
          React.createElement(
            'div',
            { className: 'p-4 sm:p-3 border-2 border-dashed border-[#DDE4DD] rounded-xl text-center hover:border-[#0F7B4A]/50 hover:bg-[#F5FAF7] transition-colors duration-200' },
            React.createElement('input', {
              type: 'file',
              accept: 'image/*',
              id: 'editProdImg',
              className: 'hidden',
              onChange: (e) => handleFileUpload(e.target.files[0], 'editProd', (url) => setEditingProduct({ ...editingProduct, imageUrl: url }))
            }),
            React.createElement(
              'label',
              { htmlFor: 'editProdImg', className: 'cursor-pointer text-xs font-black text-[#0F7B4A]' },
              uploadingSlot === 'editProd' ? 'በመጫን ላይ...' : 'አዲስ የምርት ፎቶ ቀይር (Change Image)'
            ),
            editingProduct.imageUrl ? React.createElement('p', { className: 'text-[10px] text-gray-500 mt-1 truncate' }, editingProduct.imageUrl) : null
          )
        ),
        React.createElement(
          'div',
          { className: 'flex gap-2 pt-3' },
          React.createElement('button', { type: 'button', onClick: () => setEditingProduct(null), className: 'flex-1 py-3 sm:py-2 text-xs font-bold bg-[#F1F5F2] hover:bg-[#E6EDE8] rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-200' }, 'ተመለስ'),
          React.createElement('button', { type: 'submit', className: 'flex-1 py-3 sm:py-2 text-xs font-black bg-[#0F7B4A] hover:bg-[#0c653d] text-white rounded-xl cursor-pointer shadow-md shadow-[#0F7B4A]/25 active:scale-[0.98] transition-all duration-200' }, 'አስቀምጥ (Save)')
        )
      )
    ) : null,

    // ==========================================
    // MODAL: DYNAMIC PERMISSIONS EDIT
    // ==========================================
    permModal.open ? React.createElement(
      'div',
      { className: modalOverlay },
      React.createElement(
        'form',
        { onSubmit: handleSavePermissions, className: 'bg-white max-w-md w-full p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center' },
          React.createElement('h3', { className: 'font-black text-sm text-[#12241A]' }, 'የአስተዳዳሪውን ፍቃድ ቀይር'),
          React.createElement('button', { type: 'button', onClick: () => setPermModal({ open: false, userId: null, shopName: '', allowedTabs: [] }), className: 'p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-[#F1F5F2] cursor-pointer' }, React.createElement(X, { className: 'h-4 w-4' }))
        ),
        React.createElement('p', { className: 'text-xs text-[#62726A]' }, 'አስተዳዳሪ: ', React.createElement('b', { className: 'text-[#12241A]' }, permModal.shopName)),
        React.createElement(
          'div',
          { className: 'space-y-2' },
          React.createElement('label', { className: 'text-[11px] font-bold text-[#62726A] block' }, 'የሚፈቀዱ ገጾች ይምረጡ:'),
          React.createElement(
            'div',
            { className: 'grid grid-cols-1 sm:grid-cols-2 gap-2' },
            ALL_SYSTEM_TABS.map((t) => {
              const isChecked = permModal.allowedTabs.includes(t.id);
              return React.createElement(
                'button',
                {
                  key: t.id,
                  type: 'button',
                  onClick: () => toggleTabInEdit(t.id),
                  className: 'flex items-center gap-2 p-3 sm:p-2 rounded-xl border text-xs font-bold transition cursor-pointer text-left active:scale-[0.98] ' +
                    (isChecked ? 'border-[#0F7B4A] bg-[#E4F2EA] text-[#0F7B4A] shadow-sm' : 'border-[#E6ECE7] bg-white text-[#62726A]')
                },
                React.createElement('div', {
                  className: 'w-4 h-4 rounded border flex items-center justify-center shrink-0 ' +
                    (isChecked ? 'border-[#0F7B4A] bg-[#0F7B4A] text-white' : 'border-gray-300 bg-white')
                }, isChecked ? '✓' : ''),
                React.createElement('span', null, t.name)
              );
            })
          )
        ),
        React.createElement(
          'div',
          { className: 'flex gap-2 pt-2' },
          React.createElement('button', { type: 'button', onClick: () => setPermModal({ open: false, userId: null, shopName: '', allowedTabs: [] }), className: 'flex-1 py-3 sm:py-2 text-xs font-bold bg-[#F1F5F2] hover:bg-[#E6EDE8] rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-200' }, 'ተመለስ'),
          React.createElement('button', { type: 'submit', className: 'flex-1 py-3 sm:py-2 text-xs font-black bg-[#0F7B4A] hover:bg-[#0c653d] text-white rounded-xl cursor-pointer shadow-md shadow-[#0F7B4A]/25 active:scale-[0.98] transition-all duration-200' }, 'ፍቃዶችን አድስ (Save)')
        )
      )
    ) : null
  );
}