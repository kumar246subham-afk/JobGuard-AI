import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileSearch, 
  FileText, 
  History, 
  BarChart2, 
  Info, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { to: '/scanner', label: t.navScanner, icon: FileSearch },
    { to: '/pdf-scanner', label: t.navPdfScanner, icon: FileText },
    { to: '/history', label: t.navHistory, icon: History },
    { to: '/model-insights', label: t.navModelInsights, icon: BarChart2 },
    { to: '/about', label: t.navAbout, icon: Info },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-brand-yellow shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-brand-navy flex items-center gap-1.5">
                JobGuard <span className="text-amber-500 font-black">AI</span>
              </div>
              <div className="text-[10px] text-slate-500 -mt-1 font-medium tracking-wide">
                Fraud & Scam Detection
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Language toggle + User auth */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title={t.navLogout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-yellow hover:bg-brand-yellow-dark text-brand-navy shadow-sm transition-colors"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex sm:hidden items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? 'bg-amber-50 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </div>
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-600 font-medium truncate">
                  Signed in as: {user.displayName || user.email}
                </span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  {t.navLogout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-brand-navy bg-brand-yellow rounded-lg"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
