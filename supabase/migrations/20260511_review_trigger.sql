-- Trigger function to update product rating and review count
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating NUMERIC(2,1);
  total_reviews INTEGER;
BEGIN
  -- Calculate new average and count
  SELECT 
    COALESCE(ROUND(AVG(rating), 1), 0),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM public.reviews
  WHERE product_id = NEW.product_id;

  -- Update the product table
  UPDATE public.products
  SET 
    rating = avg_rating,
    review_count = total_reviews,
    updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_review_added ON public.reviews;
CREATE TRIGGER on_review_added
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();
