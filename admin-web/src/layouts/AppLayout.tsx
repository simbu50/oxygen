import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users / KYC', icon: Users, end: false },
];

export function AppLayout() {
  const admin = useAuthStore((s) => s.admin);
  const clear = useAuthStore((s) => s.clear);
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-60 bg-navy-700 text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="block">
            <div className="font-serif text-2xl font-bold tracking-wider">OXYGEN</div>
            <div className="text-[10px] uppercase tracking-widest text-gold-500 mt-1">Admin</div>
          </Link>
        </div>
        <nav className="p-3 flex-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mb-1 transition ${
                  isActive ? 'bg-navy-600 text-gold-500' : 'text-slate-300 hover:bg-navy-600/50 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-sm text-slate-300">
            <div className="font-medium text-white truncate">{admin?.fullName}</div>
            <div className="text-xs text-slate-400">{admin?.role}</div>
          </div>
          <button
            onClick={() => { clear(); nav('/login'); }}
            className="mt-1 flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-navy-600/50 hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
