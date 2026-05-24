import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setIsOpen, itemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', scrollTo: null },
    { to: '/about', label: 'About Us', scrollTo: null },
    { to: '/', label: 'Services', scrollTo: 'services' },
    { to: '/', label: 'Why Us', scrollTo: 'why-us' },
    // { to: '/', label: 'Contact', scrollTo: 'contact' },
    { to: '/contact', label: 'Contact', scrollTo: null },
  ];

  const handleNavClick = (e: React.MouseEvent, to: string, scrollTo: string | null) => {
    setMobileOpen(false);
    if (scrollTo) {
      e.preventDefault();
      const doScroll = () => {
        const el = document.getElementById(scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(doScroll, 100);
      } else {
        doScroll();
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          {/* <img src="/logo.jpeg" alt="Titan Sports" className="h-10 w-10 rounded-full object-cover" /> */}
          <img src="/logo.jpeg" alt="Titan Sports" className="h-12 w-12 rounded-full object-cover" />
          <span className="text-xl font-bold tracking-tight">Titan Sports</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.to + l.label} to={l.to} onClick={(e) => handleNavClick(e, l.to, l.scrollTo)} className="text-sm font-medium uppercase tracking-wide hover:text-gold transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary-foreground hover:bg-gold hover:text-primary-foreground gap-1 px-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-primary text-primary-foreground border-primary-foreground/20 shadow-xl">
                <div className="px-3 py-2.5 border-b border-primary-foreground/10">
                  <p className="text-sm font-semibold truncate">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-primary-foreground/60 truncate">{user.email}</p>
                </div>
                {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer focus:bg-gold focus:text-primary-foreground mt-1">
                    <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-primary-foreground/10" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 focus:bg-gold focus:text-primary-foreground">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-gold hover:text-primary-foreground uppercase text-xs tracking-wide font-semibold">
                Sign In
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-gold hover:text-primary-foreground" onClick={() => setIsOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-gold-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden bg-primary border-t border-border/20 px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.to + l.label} to={l.to} className="block text-sm font-medium uppercase tracking-wide hover:text-gold" onClick={(e) => { handleNavClick(e, l.to, l.scrollTo); setMobileOpen(false); }}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="block text-sm font-medium uppercase tracking-wide hover:text-gold" onClick={() => setMobileOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
              <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block text-sm font-medium uppercase tracking-wide hover:text-gold">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="block text-sm font-medium uppercase tracking-wide hover:text-gold" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
