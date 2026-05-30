
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Globe, Package, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect, useCallback } from 'react';

const categoryList = [
  { name: 'Boxing Gloves', slug: 'boxing-gloves' },
  { name: 'Boxing Sets', slug: 'boxing-sets' },
  { name: 'Kids Corner', slug: 'kids-corner' },
  { name: 'Horse Hair Gloves', slug: 'horse-hair-gloves' },
];

const testimonials = [
  { name: 'Marcus R.', text: 'Best gloves I\'ve ever used. The padding is incredible and the fit is perfect.', rating: 5 },
  { name: 'Sarah K.', text: 'Quality craftsmanship. These gloves have lasted through months of heavy training.', rating: 5 },
  { name: 'James T.', text: 'Premium feel at a competitive price. My hands stay protected every session.', rating: 4 },
  { name: 'Aisha M.', text: 'The wrist support is outstanding. No more soreness after sparring sessions.', rating: 5 },
];

const whyApex = [
  { icon: Package, title: 'Premium Gloves', desc: 'Genuine leather construction built to last' },
  { icon: Globe, title: 'Ships Worldwide', desc: 'We deliver to 50+ countries internationally' },
  { icon: Lock, title: 'Secure Checkout', desc: '256-bit SSL encrypted payments' },
  { icon: Truck, title: 'Real Products, Real Delivery', desc: 'Every order physically packaged & shipped' },
];

const Index = () => {
  const [reviewIndex, setReviewIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch random product images for hero slider
  const { data: heroImages = [] } = useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('image_url, name')
        .eq('in_stock', true)
        .not('image_url', 'is', null);
      
      if (!data || data.length === 0) {
        return [
          { image: '/products/product-1.jpeg', name: 'Ring Storm Sports' },
          { image: '/products/product-2.jpeg', name: 'Ring Storm Sports' },
          { image: '/products/product-3.jpeg', name: 'Ring Storm Sports' },
          { image: '/products/product-5.jpeg', name: 'Ring Storm Sports' },
          { image: '/products/product-7.jpeg', name: 'Ring Storm Sports' },
        ];
      }
      
      const shuffled = [...data];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      const selected = shuffled.slice(0, 7);
      return selected.map(product => ({
        image: product.image_url,
        name: product.name,
      }));
    },
    refetchInterval: 3600000,
  });

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % Math.max(heroImages.length, 1));
  }, [heroImages.length]);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, heroImages.length]);

  // Reset current slide if it exceeds image count
  useEffect(() => {
    if (currentSlide >= heroImages.length && heroImages.length > 0) {
      setCurrentSlide(0);
    }
  }, [heroImages.length, currentSlide]);

  // Fetch random product image per category
  const { data: categoryImages = {} } = useQuery({
    queryKey: ['category-images'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('category, image_url')
        .eq('in_stock', true)
        .not('image_url', 'is', null);
      
      const grouped: Record<string, string[]> = {};
      if (data) {
        for (const p of data) {
          if (p.category && p.image_url) {
            if (!grouped[p.category]) grouped[p.category] = [];
            grouped[p.category].push(p.image_url);
          }
        }
      }
      
      const randomImages: Record<string, string> = {};
      for (const [category, images] of Object.entries(grouped)) {
        if (images.length > 0) {
          const randomIndex = Math.floor(Math.random() * images.length);
          randomImages[category] = images[randomIndex];
        }
      }
      
      return randomImages;
    },
  });

  const { data: bestsellers = [] } = useQuery({
    queryKey: ['bestsellers'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('bestseller', true).limit(4);
      return data || [];
    },
  });

  const { data: featured = [] } = useQuery({
    queryKey: ['featured'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('featured', true).limit(8);
      return data || [];
    },
  });

  const displayProducts = bestsellers.length > 0 ? bestsellers : featured.slice(0, 4);

  return (
    <div>
      {/* Hero section fetches Dynamic Product Images from Database */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {heroImages.map((slide, index) => (
          <div 
            key={index} 
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out" 
            style={{ opacity: currentSlide === index ? 1 : 0 }}
          >
            <div className="hero-image-wrapper absolute inset-0">
              
              <img 
                src={slide.image} 
                alt={slide.name} 
                className="w-full h-full object-cover"
                style={{
                  filter: "brightness(0.8) contrast(1.08) saturate(1.12)",
                  transform: currentSlide === index ? "scale(1.06)" : "scale(1)",
                  transition: "transform 12s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s ease"
                }}
                loading="lazy"
              />
            </div>
          </div>
        ))}
        
        {heroImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
        )}
        
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[1]" />
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-4 animate-fade-in text-white">
            Precision.<br />
            <span className="text-gold">Protection.</span><br />
            Performance.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-lg mb-8">
            Premium boxing gloves engineered for champions. Built to protect. Designed to dominate.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-gold text-black hover:bg-gold/90 font-bold uppercase tracking-wide px-8 py-6 text-base group">
              <Link to="/shop?category=men" className="inline-flex items-center gap-2">
                Shop Men's
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-3">→</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black font-bold uppercase tracking-wide px-8 py-6 text-base transition-colors group">
              <Link to="/shop?category=women" className="inline-flex items-center gap-2">
                Shop Women's
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-3">→</span>
              </Link>
            </Button>
          </div>
          
         
         
        </div>
         {heroImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`rounded-full transition-all duration-500 ${
                    currentSlide === i
                      ? 'bg-gold w-8 h-2'
                      : 'bg-white/50 w-2 h-2 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryList.map(c => {
              const img = categoryImages[c.slug];
              return (
                <Link key={c.slug} to={`/shop?category=${c.slug}`} className="group relative aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="text-white text-lg md:text-2xl font-bold uppercase tracking-wide text-center px-2">{c.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      {displayProducts.length > 0 && (
        <section id="services" className="py-16 bg-secondary/30 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-10">Bestsellers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((p: any) => <ProductCard key={p.id} {...p} />)}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black uppercase tracking-wide transition-colors">
                <Link to="/shop">View All Products →</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Why Ring Storm Sports */}
      <section id="why-us" className="py-16 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-3">Why Ring Storm Sports?</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">A boxing brand built on quality, transparency, and worldwide delivery.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyApex.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-gold/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-bold uppercase text-sm mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-10">What Fighters Say</h2>
          <div className="relative max-w-2xl mx-auto">
            <div className="text-center px-8">
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: testimonials[reviewIndex].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-lg italic mb-4">"{testimonials[reviewIndex].text}"</p>
              <p className="font-bold text-gold">{testimonials[reviewIndex].name}</p>
            </div>
            <button onClick={() => setReviewIndex((reviewIndex - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:text-gold transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => setReviewIndex((reviewIndex + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:text-gold transition-colors">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-background scroll-mt-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-3">Get In Touch</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">Questions about our gloves, sizing, or shipping? We're here to help.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-gold/10 p-3 rounded-full"><Mail className="h-5 w-5 text-gold" /></div>
                <div>
                  <h3 className="font-semibold uppercase text-sm mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">support@ringstormsports.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gold/10 p-3 rounded-full"><Phone className="h-5 w-5 text-gold" /></div>
                <div>
                  <h3 className="font-semibold uppercase text-sm mb-1">Phone</h3>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gold/10 p-3 rounded-full"><MapPin className="h-5 w-5 text-gold" /></div>
                <div>
                  <h3 className="font-semibold uppercase text-sm mb-1">Address</h3>
                  <p className="text-sm text-muted-foreground">123 Champion Ave<br/>Las Vegas, NV 89101, USA</p>
                </div>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="Your Name" required />
              <Input type="email" placeholder="Your Email" required />
              <Input placeholder="Subject" />
              <Textarea placeholder="Your Message" rows={5} required />
              <Button type="submit" className="w-full bg-gold text-black hover:bg-gold/90 font-bold uppercase tracking-wide">Send Message</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;