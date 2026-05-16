import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const FREE_SHIPPING_THRESHOLD = 75;

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - total;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col pointer-events-auto animate-scale-in border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-bold uppercase tracking-wide">Your Cart ({itemCount})</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Shipping progress */}
          <div className="px-5 py-3 bg-primary/5">
            {remaining > 0 ? (
              <p className="text-sm text-muted-foreground mb-2">Add <span className="font-bold text-gold">${remaining.toFixed(2)}</span> more for free shipping!</p>
            ) : (
              <p className="text-sm font-bold text-gold mb-2">You've earned free shipping!</p>
            )}
            <Progress value={shippingProgress} className="h-2" />
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-3 bg-secondary/30 rounded-xl p-3">
                  <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.weight}</p>
                    <p className="font-bold text-sm mt-1">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive rounded-full" onClick={() => removeItem(item.cartItemId)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase tracking-wide py-6 rounded-xl"
                onClick={() => { setIsOpen(false); navigate('/checkout'); }}
              >
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
