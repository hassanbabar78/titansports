

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const GENDER_FILTERS = ['men', 'women'];

 
const Shop = () => {

 
   useEffect(() => {
    document.title = "Shop Boxing Gloves | Ring Storm Sports";
  }, []);

  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [sortBy, setSortBy] = useState('newest');

  const isGenderFilter = GENDER_FILTERS.includes(initialCategory);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*');
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    let result = [...products] as any[];
    if (initialCategory) {
      if (isGenderFilter) {
        // result = result.filter(p => p.gender === initialCategory || p.gender === 'unisex');
        result = result.filter(p => p.gender === initialCategory);
      } else {
        result = result.filter(p => p.category === initialCategory);
      }
    }
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'popularity': result.sort((a, b) => b.review_count - a.review_count); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [products, initialCategory, sortBy, isGenderFilter]);

  const pageTitle = isGenderFilter
    ? `${initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)}'s Boxing Gloves`
    : initialCategory
      ? initialCategory.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Shop All Products';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-center mb-8">{pageTitle}</h1>
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-muted-foreground">{filtered.length} Products</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 bg-background text-foreground border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-border">
            <SelectItem value="newest" className="focus:bg-gold focus:text-primary-foreground">Newest</SelectItem>
            <SelectItem value="popularity" className="focus:bg-gold focus:text-primary-foreground">Popularity</SelectItem>
            <SelectItem value="price-asc" className="focus:bg-gold focus:text-primary-foreground">Price: Low to High</SelectItem>
            <SelectItem value="price-desc" className="focus:bg-gold focus:text-primary-foreground">Price: High to Low</SelectItem>
            <SelectItem value="rating" className="focus:bg-gold focus:text-primary-foreground">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p: any) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
