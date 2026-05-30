
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const weights = ['4oz', '6oz', '8oz', '10oz', '12oz', '14oz', '16oz', '18oz', '20oz'];
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState('');


const sizeGuide = [
  { hand: '6"-7"', weight: '8oz-10oz', use: 'Speed work, cardio' },
  { hand: '7"-8"', weight: '12oz', use: 'All-around training' },
  { hand: '8"-9"', weight: '14oz', use: 'Sparring, heavy bag' },
  { hand: '9"+', weight: '16oz+', use: 'Sparring, competition' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('12oz');
  const [selectedImage, setSelectedImage] = useState(0);
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('reviews').insert({
        product_id: id,
        user_id: user?.id,
        rating: reviewRating,
        comment: reviewComment,
        author_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] }); // in case trigger updates product
    },
    onError: (err: any) => toast.error(err.message || 'Failed to submit review')
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      return data;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ['related', product?.category],
    enabled: !!product,
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('category', product!.category).neq('id', id!).limit(4);
      return data || [];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data } = await supabase.from('reviews').select('*').eq('product_id', id!).order('created_at', { ascending: false });
      return data || [];
    },
  });

  // if (isLoading) return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;
  if (isLoading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
  if (!product) return <div className="container mx-auto px-4 py-20 text-center">Product not found</div>;

  const images = [product.image_url, ...(product.images || [])].filter(Boolean);
  const price = product.sale_price || product.price;

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Ring Storm Sports`;
    }
    return () => {
      document.title = 'Ring Storm Sports | Premium Boxing Gloves & Equipment';
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.image_url,
      "brand": { "@type": "Brand", "name": "Ring Storm Sports" },
      "offers": {
        "@type": "Offer",
        "price": product.sale_price || product.price,
        "priceCurrency": "USD",
        "availability": product.in_stock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "url": `https://www.ringstormsports.com/product/${product.id}`
      },
      "aggregateRating": product.review_count > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.review_count
      } : undefined
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [product]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Images — sleek carousel, no thumbnails */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30 group shadow-lg">
          {/* Image with smooth fade transition */}
          <img
            key={selectedImage}
            src={images[selectedImage] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {images.length > 1 && (
            <>
              {/* Previous button */}
              <button
                onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Next button */}
              <button
                onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Image counter top-right */}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </div>

              {/* Dot indicators bottom */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 items-center">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === selectedImage
                        ? 'bg-white w-5 h-2'
                        : 'bg-white/50 hover:bg-white/80 w-2 h-2'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gold uppercase tracking-wide font-medium mb-1">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(product.rating)) ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            {product.sale_price ? (
              <>
                <span className="text-3xl font-bold text-red-accent">${Number(product.sale_price).toFixed(2)}</span>
                <span className="text-xl text-muted-foreground line-through">${Number(product.price).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-3xl font-bold">${Number(product.price).toFixed(2)}</span>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold block mb-2">Weight / Size</label>
              <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                <SelectTrigger className="w-40 bg-background text-foreground border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background text-foreground border-border">
                  {weights.map(w => <SelectItem key={w} value={w} className="focus:bg-gold focus:text-primary-foreground">{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="font-medium w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase tracking-wide py-6 mb-4"
            onClick={() => {
              addItem({ id: product.id, name: product.name, price: Number(price), weight: selectedWeight, image_url: product.image_url || '' }, quantity);
            }}
          >
            <ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart
          </Button>

          {/* Trust badges */}
          <div className="border rounded-lg p-3 mb-3 text-center text-xs text-muted-foreground bg-secondary/20">
            🔒 Secure Checkout · 📦 Physical Product · 🌍 Ships Worldwide · ↺ 30-Day Returns
          </div>
          <p className="text-xs text-muted-foreground mb-1">📦 Estimated delivery: <strong>7–14 business days</strong> internationally</p>
          <p className="text-xs text-muted-foreground mb-6">All prices in USD. International customers may see prices converted at checkout.</p>

          {/* Sticky mobile add-to-cart */}
          <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t p-3 z-40 flex gap-2">
            <div className="flex-1">
              <p className="font-bold text-lg">${Number(price).toFixed(2)}</p>
            </div>
            <Button
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase"
              onClick={() => addItem({ id: product.id, name: product.name, price: Number(price), weight: selectedWeight, image_url: product.image_url || '' }, quantity)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs - Dark themed section */}
      <div className="bg-primary rounded-xl p-6 md:p-8 mb-16">
        <Tabs defaultValue="description">
          <TabsList className="bg-primary-foreground/10 border border-primary-foreground/20">
            <TabsTrigger value="description" className="text-primary-foreground data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Description</TabsTrigger>
            <TabsTrigger value="size-guide" className="text-primary-foreground data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Size Guide</TabsTrigger>
            <TabsTrigger value="reviews" className="text-primary-foreground data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping" className="text-primary-foreground data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-primary-foreground py-6">
            <p className="mb-4">{product.description || 'Premium boxing gloves designed for optimal performance and protection. Features multi-layered foam padding, reinforced wrist support, and genuine leather construction for durability.'}</p>
            <ul className="list-disc list-inside space-y-2 text-primary-foreground/80 mb-4">
              <li><strong>Material:</strong> Genuine leather (synthetic leather options available)</li>
              <li><strong>Weight options:</strong> 4oz, 6oz, 8oz, 10oz, 12oz, 14oz, 16oz, 18oz, 20oz</li>
              <li><strong>Recommended use:</strong> Training, sparring, bag work, or competition</li>
              <li>Multi-layer foam padding for superior shock absorption</li>
              <li>Reinforced wrist support with secure closure</li>
              <li>Breathable mesh palm for ventilation</li>
              <li>Thumb-lock design for injury prevention</li>
            </ul>
            <p className="text-sm text-gold">📦 This is a physical product shipped to your door — not a digital item.</p>
          </TabsContent>
          <TabsContent value="size-guide" className="py-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-primary-foreground">
                <thead><tr className="border-b border-primary-foreground/20"><th className="text-left p-3 text-gold">Hand Circumference</th><th className="text-left p-3 text-gold">Recommended Weight</th><th className="text-left p-3 text-gold">Best For</th></tr></thead>
                <tbody>
                  {sizeGuide.map((row, i) => (
                    <tr key={i} className="border-b border-primary-foreground/10"><td className="p-3">{row.hand}</td><td className="p-3 font-semibold">{row.weight}</td><td className="p-3">{row.use}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-6 space-y-6">
            {/* Review Form */}
            <div className="bg-primary-foreground/5 p-6 rounded-lg border border-primary-foreground/10 mb-8">
              <h3 className="text-lg font-bold text-gold mb-4">Write a Review</h3>
              {user ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-primary-foreground/80 block mb-2">Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                          <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-gold text-gold' : 'text-primary-foreground/30'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-primary-foreground/80 block mb-2">Comment</Label>
                    <Textarea 
                      value={reviewComment} 
                      onChange={e => setReviewComment(e.target.value)} 
                      placeholder="Share your experience with this product..."
                      className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground ring-offset-0 focus-visible:ring-gold focus-visible:ring-2"
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={() => submitReview.mutate()} 
                    disabled={submitReview.isPending || !reviewComment.trim()} 
                    className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold"
                  >
                    {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-primary-foreground/60 mb-4">Please sign in to leave a review.</p>
                  <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Review List */}
            <h3 className="text-lg font-bold text-gold mb-4">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-primary-foreground/60">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((r: any) => (
                <div key={r.id} className="border-b border-primary-foreground/10 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-gold text-gold' : 'text-primary-foreground/30'}`} />)}</div>
                    <span className="font-semibold text-sm text-primary-foreground">{r.author_name}</span>
                  </div>
                  <p className="text-sm text-primary-foreground/80">{r.comment}</p>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="shipping" className="text-primary-foreground py-6">
            <h3 className="text-lg font-bold text-gold mb-3">Shipping</h3>
            <ul className="list-disc list-inside space-y-2 text-primary-foreground/80 mb-6">
              <li><strong>Standard Shipping:</strong> 5-7 business days — Free on orders over $75</li>
              <li><strong>Express Shipping:</strong> 2-3 business days — $12.99</li>
            </ul>
            <h3 className="text-lg font-bold text-gold mb-3">Returns</h3>
            <p className="text-primary-foreground/80">We accept returns within 30 days of purchase. Items must be unused and in original packaging.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p: any) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;