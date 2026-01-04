
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Project, 
  Purchase, 
  User, 
  PurchaseStatus, 
  ProjectType,
  MarketplaceConfig,
  Notification
} from './types';
import { INITIAL_PROJECTS, ADMIN_EMAIL, Icons } from './constants';
import { generateProjectPitch } from './services/geminiService';

// --- Helpers ---
const calculatePrice = (price: number, config: MarketplaceConfig) => {
  if (config.isBlackFriday) {
    return price * (1 - config.discountPercentage / 100);
  }
  return price;
};

// --- Components ---

const Navbar: React.FC<{ user: User | null; onLogout: () => void; config: MarketplaceConfig; unreadCount: number }> = ({ user, onLogout, config, unreadCount }) => (
  <nav className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
    <Link to="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: config.accentColor }}>
      <div className="text-white p-1 rounded" style={{ backgroundColor: config.accentColor }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </div>
      <span>{config.siteName}</span>
    </Link>
    <div className="flex items-center gap-6">
      <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Marketplace</Link>
      {user && (
        <Link to="/my-purchases" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">My Orders</Link>
      )}
      {user?.isAdmin && (
        <Link to="/admin" className="px-3 py-1.5 rounded-lg border transition-colors font-semibold relative" style={{ backgroundColor: `${config.accentColor}10`, color: config.accentColor, borderColor: `${config.accentColor}20` }}>
          Admin Dashboard
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </Link>
      )}
      {user ? (
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border shadow-sm" />
          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">Welcome,</p>
            <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      ) : (
        <Link 
          to="/login"
          className="text-white px-5 py-2 rounded-lg transition-all font-medium shadow-md"
          style={{ backgroundColor: config.accentColor }}
        >
          Sign In
        </Link>
      )}
    </div>
  </nav>
);

const ProjectCard: React.FC<{ project: Project; config: MarketplaceConfig }> = ({ project, config }) => {
  const finalPrice = calculatePrice(project.price, config);
  const isDiscounted = config.isBlackFriday;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={project.imageUrl} 
          alt={project.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1 shadow-sm ${project.type === 'PYTHON' ? 'bg-blue-600' : 'bg-orange-600'}`}>
            {project.type === 'PYTHON' ? <Icons.Python /> : <Icons.Html />}
            {project.type}
          </span>
          {isDiscounted && (
            <span className="bg-black text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse">
              BLACK FRIDAY
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors" style={{ color: 'inherit' }}>{project.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
          {project.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            {isDiscounted && (
              <span className="text-xs text-gray-400 line-through">${project.price.toFixed(2)}</span>
            )}
            <span className={`text-xl font-extrabold ${isDiscounted ? 'text-red-600' : 'text-gray-900'}`}>
              ${finalPrice.toFixed(2)}
            </span>
          </div>
          <Link 
            to={`/project/${project.id}`}
            className="text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: config.accentColor }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const LandingPage: React.FC<{ projects: Project[], config: MarketplaceConfig }> = ({ projects, config }) => {
  const [filter, setFilter] = useState<'ALL' | ProjectType>('ALL');
  const filtered = projects.filter(p => filter === 'ALL' || p.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {config.isBlackFriday && (
        <div className="bg-black text-white py-3 px-6 rounded-2xl mb-12 flex items-center justify-between shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-indigo-600/20 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-black uppercase tracking-tighter">🔥 Black Friday Live!</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Get {config.discountPercentage}% OFF everything in store</p>
          </div>
          <div className="relative z-10 text-right">
            <span className="text-3xl font-black text-red-500">-{config.discountPercentage}%</span>
          </div>
        </div>
      )}

      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
          {config.heroTitle.split(' ').slice(0, -1).join(' ')} <span style={{ color: config.accentColor }}>{config.heroTitle.split(' ').pop()}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          {config.heroSubtitle}
        </p>
        <div className="flex justify-center gap-3">
          {(['ALL', 'PYTHON', 'HTML'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-full font-semibold transition-all border ${
                filter === type 
                ? 'text-white shadow-lg' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
              style={filter === type ? { backgroundColor: config.accentColor, borderColor: config.accentColor, boxShadow: `0 10px 15px -3px ${config.accentColor}40` } : {}}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <ProjectCard key={p.id} project={p} config={config} />
        ))}
      </div>
    </div>
  );
};

const LoginPage: React.FC<{ onLogin: (user: User) => void; config: MarketplaceConfig }> = ({ onLogin, config }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${email}&background=random`,
      isAdmin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    };
    onLogin(mockUser);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl border w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: `${config.accentColor}10` }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: config.accentColor }}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sign in to Marketplace</h2>
          <p className="text-gray-500 mt-2">Access your purchases and manage orders.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 outline-none transition-all"
              style={{ '--tw-ring-color': config.accentColor } as any}
            />
          </div>
          <button 
            type="submit"
            className="w-full text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: config.accentColor }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

const ProjectDetail: React.FC<{ 
  projects: Project[], 
  user: User | null, 
  config: MarketplaceConfig,
  onPurchase: (proj: Project, price: number) => void 
}> = ({ projects, user, config, onPurchase }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  const [pitch, setPitch] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      generateProjectPitch(project.name, project.description).then(setPitch);
    }
  }, [project]);

  if (!project) return <div className="p-20 text-center text-gray-500 font-bold">Project not found.</div>;

  const finalPrice = calculatePrice(project.price, config);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
            <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
          </div>
          <div className="border p-6 rounded-2xl relative overflow-hidden" style={{ backgroundColor: `${config.accentColor}10`, borderColor: `${config.accentColor}20` }}>
             <div className="absolute top-0 right-0 p-2 opacity-10" style={{ color: config.accentColor }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.38 0 2.628.533 3.553 1.401C12.01 3.533 13.25 3 14.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001z"/></svg>
             </div>
             <p className="italic font-medium relative z-10" style={{ color: config.accentColor }}>
               "{pitch || 'Loading AI highlight...'}"
             </p>
             <p className="text-xs mt-2 uppercase font-bold tracking-widest opacity-60" style={{ color: config.accentColor }}>Marketplace AI Review</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block ${project.type === 'PYTHON' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
              {project.type} PROJECT
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{project.name}</h1>
            <p className="text-gray-600 leading-relaxed text-lg">
              {project.longDescription}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            {config.isBlackFriday && (
              <div className="absolute top-0 right-0 bg-black text-white px-8 py-1 transform rotate-45 translate-x-1/4 -translate-y-1/4 text-[10px] font-black tracking-widest uppercase">
                BF Deal
              </div>
            )}
            <div className="flex items-end gap-3 mb-6">
              <div className="flex flex-col">
                {config.isBlackFriday && (
                  <span className="text-sm text-gray-400 line-through font-bold">${project.price.toFixed(2)}</span>
                )}
                <span className={`text-4xl font-black ${config.isBlackFriday ? 'text-red-600' : 'text-gray-900'}`}>
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
              <span className="text-gray-400 text-sm mb-1 font-medium">One-time payment</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {project.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-3 text-gray-700 font-medium">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                Instant digital delivery
              </li>
            </ul>

            {user ? (
              <button 
                onClick={() => {
                  onPurchase(project, finalPrice);
                  navigate('/my-purchases');
                }}
                className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg transform active:scale-[0.98]"
                style={{ backgroundColor: config.accentColor, boxShadow: `0 10px 15px -3px ${config.accentColor}40` }}
              >
                Buy Now
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-500 font-medium bg-gray-50 py-3 rounded-lg border border-dashed border-gray-200">
                  Please sign in to purchase this project.
                </p>
                <Link 
                  to="/login"
                  className="block text-center w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all"
                >
                  Sign In to Purchase
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserPurchases: React.FC<{ purchases: Purchase[]; config: MarketplaceConfig }> = ({ purchases, config }) => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">{purchases.length} Total</span>
    </div>

    {purchases.length > 0 && (
      <div className="text-white p-6 rounded-2xl mb-8 flex items-center gap-6 shadow-xl relative overflow-hidden" style={{ backgroundColor: config.accentColor }}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black uppercase tracking-tight mb-1">Need your files?</h2>
          <p className="text-indigo-100 text-sm font-medium">
            After purchasing, please send a message to <span className="font-black underline decoration-white decoration-2 underline-offset-2">{config.contactEmail}</span> to receive your source code and activation instructions.
          </p>
        </div>
      </div>
    )}

    {purchases.length === 0 ? (
      <div className="bg-white p-20 text-center rounded-2xl border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <p className="text-gray-400 text-lg">You haven't made any purchases yet.</p>
        <Link to="/" className="font-bold mt-4 inline-block hover:underline" style={{ color: config.accentColor }}>Browse the Marketplace</Link>
      </div>
    ) : (
      <div className="space-y-4">
        {purchases.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Project Name</p>
              <h3 className="font-bold text-lg text-gray-900">{p.projectName}</h3>
              <p className="text-xs text-gray-500">{new Date(p.timestamp).toLocaleDateString()}</p>
            </div>
            <div className="text-center w-24">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Paid</p>
              <p className="font-black text-gray-900">${p.priceAtPurchase.toFixed(2)}</p>
            </div>
            <div className="text-center w-32">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Order Status</p>
              <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-tight ${
                p.status === PurchaseStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                p.status === PurchaseStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {p.status}
              </span>
            </div>
            <div className="w-32 text-right">
              {p.status === PurchaseStatus.COMPLETED ? (
                <div className="flex flex-col items-end">
                   <button className="text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-md" style={{ backgroundColor: config.accentColor }}>
                    Download
                  </button>
                  <p className="text-[8px] text-gray-400 mt-1 uppercase font-black">Email support for help</p>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Awaiting Approval</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AdminDashboard: React.FC<{ 
  projects: Project[], 
  purchases: Purchase[],
  notifications: Notification[],
  config: MarketplaceConfig,
  onUpdateStatus: (purchaseId: string, status: PurchaseStatus) => void,
  onUpdateProject: (proj: Project) => void,
  onDeleteProject: (id: string) => void,
  onUpdateConfig: (config: MarketplaceConfig) => void,
  onAddProject: (proj: Partial<Project>) => void,
  onMarkNotificationAsRead: (id: string) => void,
  onClearNotifications: () => void
}> = ({ projects, purchases, notifications, config, onUpdateStatus, onUpdateProject, onDeleteProject, onUpdateConfig, onAddProject, onMarkNotificationAsRead, onClearNotifications }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'customization' | 'inbox'>('orders');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const [newProj, setNewProj] = useState<Partial<Project>>({
    name: '', type: 'PYTHON', price: 0, description: '', longDescription: '', imageUrl: '', features: ['Instant Access', 'Support included']
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingProject) {
          setEditingProject({ ...editingProject, imageUrl: reader.result as string });
        } else {
          setNewProj(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.imageUrl) { alert("Please upload a project image."); return; }
    onAddProject(newProj);
    setShowAddForm(false);
    setNewProj({ name: '', type: 'PYTHON', price: 0, description: '', longDescription: '', imageUrl: '', features: ['Instant Access', 'Support included'] });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      onUpdateProject(editingProject);
      setEditingProject(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Admin Control</h1>
          <p className="text-gray-500 mt-1">Full marketplace customization and order management.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Gross Revenue</span>
            <span className="text-2xl font-black" style={{ color: config.accentColor }}>
              ${purchases.filter(p => p.status === PurchaseStatus.COMPLETED).reduce((acc, p) => acc + p.priceAtPurchase, 0).toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="text-white px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg"
            style={{ backgroundColor: config.accentColor, boxShadow: `0 10px 15px -3px ${config.accentColor}40` }}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'orders' ? 'text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`} style={activeTab === 'orders' ? { borderBottomColor: config.accentColor, color: config.accentColor } : {}}>Orders</button>
        <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`} style={activeTab === 'inventory' ? { borderBottomColor: config.accentColor, color: config.accentColor } : {}}>Inventory</button>
        <button onClick={() => setActiveTab('inbox')} className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'inbox' ? 'text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`} style={activeTab === 'inbox' ? { borderBottomColor: config.accentColor, color: config.accentColor } : {}}>
          Inbox
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('customization')} className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'customization' ? 'text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`} style={activeTab === 'customization' ? { borderBottomColor: config.accentColor, color: config.accentColor } : {}}>Customize</button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Order Fulfillment
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{purchases.length}</span>
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No orders yet.</td></tr>
                  )}
                  {purchases.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{p.projectName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold tracking-tight uppercase">${p.priceAtPurchase.toFixed(2)} • {new Date(p.timestamp).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-gray-700">{p.userEmail}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                          p.status === PurchaseStatus.COMPLETED ? 'bg-green-50 text-green-600' :
                          p.status === PurchaseStatus.PENDING ? 'bg-yellow-50 text-yellow-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => onUpdateStatus(p.id, PurchaseStatus.COMPLETED)} disabled={p.status === PurchaseStatus.COMPLETED} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-20 border border-green-100"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>
                          <button onClick={() => onUpdateStatus(p.id, PurchaseStatus.DECLINED)} disabled={p.status === PurchaseStatus.DECLINED} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-20 border border-red-100"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900">Project Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(proj => (
                <div key={proj.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden border">
                        <img src={proj.imageUrl} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <p className="font-bold text-gray-900 leading-none mb-1">{proj.name}</p>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.accentColor }}>{proj.type}</span>
                         <span className="text-[10px] text-gray-400 font-bold">${proj.price.toFixed(2)}</span>
                       </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingProject(proj)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onClick={() => onDeleteProject(proj.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inbox' && (
          <div className="space-y-8 animate-fadeIn max-w-5xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Simulated Email Alerts
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{notifications.length}</span>
              </h2>
              <button onClick={onClearNotifications} className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline">Clear All</button>
            </div>
            <div className="space-y-4">
              {notifications.length === 0 && (
                <div className="bg-white p-20 text-center rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Inbox is empty.</p>
                </div>
              )}
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onMouseEnter={() => !n.isRead && onMarkNotificationAsRead(n.id)}
                  className={`bg-white p-6 rounded-2xl border transition-all shadow-sm relative group ${!n.isRead ? 'border-l-4' : 'opacity-75'}`}
                  style={{ borderLeftColor: !n.isRead ? config.accentColor : 'transparent' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {!n.isRead && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.accentColor }} />}
                        <h4 className="font-bold text-gray-900 text-lg">{n.subject}</h4>
                      </div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">To: {n.recipient} • {new Date(n.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {n.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customization' && (
          <div className="space-y-12 animate-fadeIn max-w-4xl">
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: config.accentColor }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Marketplace Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Site Name</label>
                    <input value={config.siteName} onChange={e => onUpdateConfig({...config, siteName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Contact Email</label>
                    <input value={config.contactEmail} onChange={e => onUpdateConfig({...config, contactEmail: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Accent Brand Color</label>
                    <div className="flex gap-4 items-center">
                      <input type="color" value={config.accentColor} onChange={e => onUpdateConfig({...config, accentColor: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer p-1 bg-white border" />
                      <span className="font-mono text-xs font-bold text-gray-500">{config.accentColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Hero Title</label>
                    <input value={config.heroTitle} onChange={e => onUpdateConfig({...config, heroTitle: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Hero Subtitle</label>
                    <textarea value={config.heroSubtitle} onChange={e => onUpdateConfig({...config, heroSubtitle: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-medium h-24" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border">
                  <span className="text-xs font-black uppercase text-gray-500">Black Friday Sale</span>
                  <button onClick={() => onUpdateConfig({ ...config, isBlackFriday: !config.isBlackFriday })} className={`w-12 h-6 rounded-full relative transition-all ${config.isBlackFriday ? 'bg-red-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isBlackFriday ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                {config.isBlackFriday && (
                   <div className="flex items-center gap-3">
                    <label className="text-xs font-black uppercase text-gray-400">Discount %</label>
                    <input type="number" value={config.discountPercentage} onChange={e => onUpdateConfig({...config, discountPercentage: parseInt(e.target.value) || 0})} className="w-20 px-3 py-1 border rounded-lg font-black text-center" />
                   </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">New Project</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-black transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmitNew} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Project Name</label>
                    <input required value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold" placeholder="E.g. Automation Bot" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Type</label>
                    <select value={newProj.type} onChange={e => setNewProj({...newProj, type: e.target.value as ProjectType})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold">
                      <option value="PYTHON">PYTHON</option>
                      <option value="HTML">HTML</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Base Price ($)</label>
                    <input type="number" step="0.01" required value={newProj.price} onChange={e => setNewProj({...newProj, price: parseFloat(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold" placeholder="29.99" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Project Image</label>
                  <div onClick={() => fileInputRef.current?.click()} className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${newProj.imageUrl ? 'border-indigo-400' : 'border-gray-200 hover:border-indigo-300 bg-gray-50'}`}>
                    {newProj.imageUrl ? <img src={newProj.imageUrl} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload Photo</span>}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, false)} accept="image/*" className="hidden" />
                </div>
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Full Description</label>
              <textarea required value={newProj.longDescription} onChange={e => setNewProj({...newProj, longDescription: e.target.value, description: e.target.value.substring(0, 100)})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-medium h-24" placeholder="Full technical details..." /></div>
              <button type="submit" className="w-full text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all" style={{ backgroundColor: config.accentColor }}>Create Project</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Edit Project</h2>
              <button onClick={() => setEditingProject(null)} className="text-gray-400 hover:text-black transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmitEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Project Name</label>
                    <input required value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Type</label>
                    <select value={editingProject.type} onChange={e => setEditingProject({...editingProject, type: e.target.value as ProjectType})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold">
                      <option value="PYTHON">PYTHON</option>
                      <option value="HTML">HTML</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Base Price ($)</label>
                    <input type="number" step="0.01" required value={editingProject.price} onChange={e => setEditingProject({...editingProject, price: parseFloat(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-bold" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Project Image</label>
                  <div onClick={() => editFileInputRef.current?.click()} className="aspect-video rounded-2xl border-2 border-indigo-200 overflow-hidden cursor-pointer">
                    <img src={editingProject.imageUrl} className="w-full h-full object-cover" />
                  </div>
                  <input type="file" ref={editFileInputRef} onChange={(e) => handleImageUpload(e, true)} accept="image/*" className="hidden" />
                </div>
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Full Description</label>
              <textarea required value={editingProject.longDescription} onChange={e => setEditingProject({...editingProject, longDescription: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none font-medium h-24" /></div>
              <button type="submit" className="w-full text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all" style={{ backgroundColor: config.accentColor }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('marketplace_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('marketplace_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('marketplace_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('marketplace_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState<MarketplaceConfig>(() => {
    const saved = localStorage.getItem('marketplace_config');
    return saved ? JSON.parse(saved) : { 
      isBlackFriday: false, 
      discountPercentage: 50,
      siteName: 'PyHtml Marketplace',
      heroTitle: 'Level up your Workflow',
      heroSubtitle: 'Professional grade Python scripts and pixel-perfect HTML templates for developers and entrepreneurs.',
      accentColor: '#4f46e5',
      contactEmail: ADMIN_EMAIL
    };
  });

  useEffect(() => {
    localStorage.setItem('marketplace_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('marketplace_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('marketplace_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('marketplace_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('marketplace_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleLogin = (newUser: User) => setUser(newUser);
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('marketplace_user');
  };

  const handlePurchase = (proj: Project, priceAtPurchase: number) => {
    if (!user) return;
    const newPurchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: proj.id,
      userId: user.id,
      userEmail: user.email,
      priceAtPurchase: priceAtPurchase,
      status: PurchaseStatus.PENDING,
      timestamp: Date.now(),
      projectName: proj.name
    };

    // Simulate sending an email notification to admin
    const emailNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      subject: `🚨 New Purchase: ${proj.name}`,
      recipient: config.contactEmail,
      timestamp: Date.now(),
      isRead: false,
      body: `Hello Admin,\n\nA new purchase has been recorded on ${config.siteName}.\n\n--- Order Summary ---\nProject: ${proj.name}\nBuyer: ${user.email} (${user.name})\nAmount Paid: $${priceAtPurchase.toFixed(2)}\nOrder ID: ${newPurchase.id}\n\nPlease review the purchase in the admin dashboard.\n\nBest regards,\n${config.siteName} System`
    };

    setPurchases(prev => [newPurchase, ...prev]);
    setNotifications(prev => [emailNotification, ...prev]);
  };

  const updatePurchaseStatus = (id: string, status: PurchaseStatus) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const updateProject = (proj: Project) => {
    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
  };

  const deleteProject = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    if (window.confirm("Clear all notifications?")) {
      setNotifications([]);
    }
  };

  const addProject = (proj: Partial<Project>) => {
    const newProj: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: proj.name || 'Unnamed Project',
      type: proj.type || 'PYTHON',
      price: proj.price || 0,
      description: proj.description || '',
      longDescription: proj.longDescription || '',
      imageUrl: proj.imageUrl || 'https://picsum.photos/seed/new/800/600',
      features: proj.features || ['Digital delivery', 'Support included'],
      demoUrl: proj.demoUrl
    };
    setProjects(prev => [newProj, ...prev]);
  };

  const userPurchases = useMemo(() => {
    if (!user) return [];
    return purchases.filter(p => p.userId === user.id);
  }, [purchases, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans selection:bg-gray-200">
        <Navbar user={user} onLogout={handleLogout} config={config} unreadCount={unreadCount} />
        
        <main className="flex-1 bg-[#fbfbfd]">
          <Routes>
            <Route path="/" element={<LandingPage projects={projects} config={config} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} config={config} />} />
            <Route path="/project/:id" element={<ProjectDetail projects={projects} user={user} config={config} onPurchase={handlePurchase} />} />
            <Route path="/my-purchases" element={<UserPurchases purchases={userPurchases} config={config} />} />
            
            {user?.isAdmin && (
              <Route 
                path="/admin" 
                element={
                  <AdminDashboard 
                    projects={projects} 
                    purchases={purchases} 
                    notifications={notifications}
                    config={config}
                    onUpdateStatus={updatePurchaseStatus} 
                    onUpdateProject={updateProject}
                    onDeleteProject={deleteProject}
                    onUpdateConfig={setConfig}
                    onAddProject={addProject}
                    onMarkNotificationAsRead={markNotificationAsRead}
                    onClearNotifications={clearNotifications}
                  />
                } 
              />
            )}
            
            <Route path="*" element={<div className="p-20 text-center font-bold text-gray-400 text-xl">404 - Marketplace Page Not Found</div>} />
          </Routes>
        </main>

        <footer className="bg-white border-t py-12 px-4 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl mb-4" style={{ color: config.accentColor }}>
                <div className="text-white p-1 rounded" style={{ backgroundColor: config.accentColor }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <span>{config.siteName}</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs font-medium">
                Premium digital assets for modern developers. Secure checkout and instant access to top-tier Python and HTML projects.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="font-black text-gray-900 mb-4 text-[10px] uppercase tracking-[0.2em]">Shop Inventory</h4>
                <ul className="space-y-2 text-gray-500 text-sm font-medium">
                  <li><Link to="/" className="hover:text-indigo-600 transition-colors">Python Projects</Link></li>
                  <li><Link to="/" className="hover:text-indigo-600 transition-colors">HTML Templates</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-4 text-[10px] uppercase tracking-[0.2em]">Platform Support</h4>
                <ul className="space-y-2 text-gray-500 text-sm font-medium">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Knowledge Base</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-gray-100 mt-12 pt-8 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]">
            © 2024 {config.siteName}. Designed for Developers.
          </div>
        </footer>
      </div>
    </Router>
  );
}
