import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<{ id: string; total: number; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !id) {
      setDenied(true);
      setLoading(false);
      return;
    }
    (async () => {
      // RLS ensures users only see their own confirmed orders.
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, payment_status')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error || !data || data.payment_status !== 'completed') {
        setDenied(true);
      } else {
        setOrder({ id: data.id, total: Number(data.total), status: data.status });
      }
      setLoading(false);
    })();
  }, [id, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" />
      </div>
    );
  }

  if (denied) return <Navigate to="/" replace />;

  return (
    <div className="container mx-auto px-4 py-20 max-w-xl text-center">
      <CheckCircle2 className="h-16 w-16 text-gold mx-auto mb-6" />
      <h1 className="text-3xl font-bold uppercase tracking-tight mb-3">Order Confirmed</h1>
      <p className="text-muted-foreground mb-2">Thank you for your purchase.</p>
      <p className="font-mono text-sm text-muted-foreground mb-6">Order #{order!.id.slice(0, 8)}</p>
      <p className="text-2xl font-bold mb-8">${order!.total.toFixed(2)}</p>
      <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase">
        <Link to="/shop">Continue Shopping</Link>
      </Button>
    </div>
  );
};

export default OrderConfirmation;
