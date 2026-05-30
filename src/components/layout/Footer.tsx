import { Link } from 'react-router-dom';
import { Mail, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Subscribed! You'll receive 10% off your first order.");
    setEmail('');
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            {/* <img src="/logo.jpeg" alt="Titan Sports" className="h-10 w-10 rounded-full" /> */}
            <img src="/logo.jpeg" alt="Ring Storm Sports" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-bold tracking-tight">Ring Storm Sports</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Premium boxing equipment shipped worldwide. Real products, real delivery.</p>
          <div className="flex gap-3">
            <a href="https://instagram.com/titan_sports_1" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-primary-foreground/10 p-2 rounded-full hover:bg-gold hover:text-primary-foreground transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-primary-foreground/10 p-2 rounded-full hover:bg-gold hover:text-primary-foreground transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="bg-primary-foreground/10 p-2 rounded-full hover:bg-gold hover:text-primary-foreground transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wide mb-4 text-gold text-sm">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-gold transition-colors">Shop All</Link>
            <Link to="/about" className="hover:text-gold transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          </div>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wide mb-4 text-gold text-sm">Customer Service</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/shipping" className="hover:text-gold transition-colors">Shipping Policy</Link>
            <Link to="/refunds" className="hover:text-gold transition-colors">Returns & Refunds</Link>
            <Link to="/contact" className="hover:text-gold transition-colors">Help Center</Link>
          </div>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wide mb-4 text-gold text-sm">Legal</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link>
            <Link to="/refunds" className="hover:text-gold transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
          <Input type="email" placeholder="Subscribe for 10% off your first order" value={email} onChange={e => setEmail(e.target.value)}
            className="bg-secondary/10 border-border/30 text-primary-foreground placeholder:text-muted-foreground" required />
          <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90 shrink-0">
            <Mail className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="border-t border-border/20 py-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Ring Storm Sports. All rights reserved. | SSL Secured | Visa • Mastercard</p>
      </div>
    </footer>
  );
};

export default Footer;
