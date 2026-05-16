import { Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  rating: number;
  review_count: number;
  weight: string;
  category: string;
}

const ProductCard = ({ id, name, price, sale_price, image_url, rating, review_count, weight, category }: ProductCardProps) => {
  const { addItem } = useCart();
  const displayRating = rating && rating > 0 ? rating : 4.7;
  const displayReviews = review_count && review_count > 0 ? review_count : 0;

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300">
      <Link to={`/product/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          <img
            src={image_url || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {sale_price && (
            <Badge className="absolute top-3 left-3 bg-red-accent text-primary-foreground font-bold">SALE</Badge>
          )}
          <Badge variant="secondary" className="absolute top-3 right-3 text-xs">{category}</Badge>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-sm mb-1 hover:text-gold transition-colors line-clamp-2">{name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.round(displayRating) ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
          ))}
          {displayReviews > 0 && <span className="text-xs text-muted-foreground ml-1">({displayReviews})</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sale_price ? (
              <>
                <span className="font-bold text-red-accent">${sale_price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">${price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-bold">${price.toFixed(2)}</span>
            )}
          </div>
          <Button
            size="sm"
            className="bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={(e) => {
              e.preventDefault();
              addItem({ id, name, price: sale_price || price, weight, image_url });
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
