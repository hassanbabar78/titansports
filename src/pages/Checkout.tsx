import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, Lock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';

const FREE_SHIPPING_THRESHOLD = 75;

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState('standard');
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: user?.email || '', address: '', city: '', state: '', zip: '', country: 'US',
    cardNumber: '', cardExpiry: '', cardCvc: '',
  });

  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : shipping === 'express' ? 12.99 : 5.99;
  const grandTotal = total + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to place an order'); navigate('/login'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setProcessing(true);
    try {
      // Client-side validation
      const { checkoutSchema, friendlyError } = await import('@/lib/validation');
      checkoutSchema.parse(form);

      // Server-side: edge function re-prices, validates and writes the order.
      // The client never determines the authoritative total.
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: items.map(i => ({ product_id: i.id, quantity: i.quantity, weight: i.weight })),
          shipping_address: {
            firstName: form.firstName, lastName: form.lastName, email: form.email,
            address: form.address, city: form.city, state: form.state, zip: form.zip, country: form.country,
          },
          shipping_method: shipping,
        },
      });

      if (error || !data?.order_id) {
        throw new Error(data?.error || 'Unable to process order');
      }

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${data.order_id}`);
    } catch (err) {
      const { friendlyError } = await import('@/lib/validation');
      toast.error(friendlyError(err, 'Failed to place order'));
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Titan Sports" className="h-8 w-8 rounded-full" />
            <h1 className="text-2xl font-bold uppercase tracking-tight">Checkout</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" /> Secure Checkout
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            {/* Shipping Address */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="font-bold uppercase text-sm mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First Name</Label><Input required value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} /></div>
                <div><Label>Last Name</Label><Input required value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} /></div>
                <div className="col-span-2"><Label>Email</Label><Input type="email" required value={form.email} onChange={e => updateForm('email', e.target.value)} /></div>
                <div className="col-span-2"><Label>Address</Label><Input required value={form.address} onChange={e => updateForm('address', e.target.value)} /></div>
                <div><Label>City</Label><Input required value={form.city} onChange={e => updateForm('city', e.target.value)} /></div>
                <div><Label>State</Label><Input required value={form.state} onChange={e => updateForm('state', e.target.value)} /></div>
                <div><Label>ZIP Code</Label><Input required value={form.zip} onChange={e => updateForm('zip', e.target.value)} /></div>
                <div><Label>Country</Label><Input value={form.country} onChange={e => updateForm('country', e.target.value)} /></div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="font-bold uppercase text-sm mb-4">Shipping Method</h2>
              <RadioGroup value={shipping} onValueChange={setShipping} className="space-y-3">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard (5-7 days)</Label>
                  </div>
                  <span className="font-semibold">{total >= FREE_SHIPPING_THRESHOLD ? 'FREE' : '$5.99'}</span>
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express">Express (2-3 days)</Label>
                  </div>
                  <span className="font-semibold">$12.99</span>
                </div>
              </RadioGroup>
            </div>

            {/* Payment - Stripe Test Mode */}
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold uppercase text-sm">Payment</h2>
                <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded font-semibold">STRIPE TEST MODE</span>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Card Number</Label>
                  <div className="relative">
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={form.cardNumber}
                      onChange={e => updateForm('cardNumber', e.target.value)}
                      className="pl-10"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Expiry</Label><Input placeholder="MM/YY" value={form.cardExpiry} onChange={e => updateForm('cardExpiry', e.target.value)} /></div>
                  <div><Label>CVC</Label><Input placeholder="123" value={form.cardCvc} onChange={e => updateForm('cardCvc', e.target.value)} /></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Test mode — no real charges. Use card 4242 4242 4242 4242.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-card p-6 rounded-lg border sticky top-24">
              <h2 className="font-bold uppercase text-sm mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                    <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
              </div>
              <Button type="submit" disabled={processing} className="w-full mt-4 bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase tracking-wide py-6">
                {processing ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
              </Button>
              <Link to="/shop" className="block text-center text-sm text-gold mt-3 hover:underline">← Back to Shop</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
