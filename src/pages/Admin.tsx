import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const defaultProduct = {
  name: '', description: '', price: 0, sale_price: null as number | null,
  category: 'training', type: 'velcro', weight: '12oz', brand: '', color: '',
  image_url: '', in_stock: true, featured: false, bestseller: false,
};

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultProduct);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      updateForm('image_url', data.publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const openOrder = async (order: any) => {
    setSelectedOrder(order);
    setOrderItemsLoading(true);
    const { data } = await supabase
      .from('order_items')
      .select('*, products(name, image_url)')
      .eq('order_id', order.id);
    setOrderItems(data || []);
    setOrderItemsLoading(false);
  };

  // Shared dark-themed input class: removes white ring offset, keeps gold focus ring only
  const darkInput = "bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground ring-offset-0 focus-visible:ring-gold focus-visible:ring-2 focus-visible:ring-offset-0";

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (product: any) => {
      const payload = { ...product };
      delete payload.id; delete payload.created_at; delete payload.updated_at;
      delete payload.rating; delete payload.review_count; delete payload.images;
      if (editProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editProduct ? 'Product updated!' : 'Product added!');
      setIsDialogOpen(false);
      setEditProduct(null);
      setForm(defaultProduct);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  // if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center"><div className="text-primary-foreground text-lg">Loading...</div></div>;
  if (loading) return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-gold" />
    </div>
  );
  if (!isAdmin) return <Navigate to="/" replace />;

  const openEdit = (product: any) => {
    setEditProduct(product);
    setForm({
      name: product.name, description: product.description || '', price: Number(product.price),
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      category: product.category, type: product.type, weight: product.weight,
      brand: product.brand || '', color: product.color || '', image_url: product.image_url || '',
      in_stock: product.in_stock, featured: product.featured, bestseller: product.bestseller,
    });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditProduct(null);
    setForm(defaultProduct);
    setIsDialogOpen(true);
  };

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const revenue = orders.reduce((s: number, o: any) => s + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-8 animate-fade-in">
          Admin <span className="text-gold">Dashboard</span>
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Package, label: 'Products', value: products.length, color: 'text-gold' },
            { icon: ShoppingCart, label: 'Orders', value: orders.length, color: 'text-gold' },
            { icon: DollarSign, label: 'Revenue', value: `$${revenue.toFixed(2)}`, color: 'text-gold' },
          ].map((stat, i) => (
            <div key={i} className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6 text-center hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-[1.02] animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-primary-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Products section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wide">Products</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-gold text-gold-foreground hover:bg-gold/90"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-primary text-primary-foreground border-primary-foreground/20">
              <DialogHeader><DialogTitle className="text-gold">{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-primary-foreground/80">Name</Label><Input required value={form.name} onChange={e => updateForm('name', e.target.value)} className={darkInput} /></div>
                <div><Label className="text-primary-foreground/80">Description</Label><Textarea value={form.description} onChange={e => updateForm('description', e.target.value)} className={darkInput} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-primary-foreground/80">Price</Label><Input type="number" step="0.01" required value={form.price} onChange={e => updateForm('price', parseFloat(e.target.value))} className={darkInput} /></div>
                  <div><Label className="text-primary-foreground/80">Sale Price</Label><Input type="number" step="0.01" value={form.sale_price || ''} onChange={e => updateForm('sale_price', e.target.value ? parseFloat(e.target.value) : null)} className={darkInput} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-primary-foreground/80">Category</Label>
                    <Select value={form.category} onValueChange={v => updateForm('category', v)}>
                      <SelectTrigger className={darkInput}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-primary text-primary-foreground border-primary-foreground/20">
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="bag">Bag Gloves</SelectItem>
                        <SelectItem value="sparring">Sparring</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-primary-foreground/80">Type</Label>
                    <Select value={form.type} onValueChange={v => updateForm('type', v)}>
                      <SelectTrigger className={darkInput}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-primary text-primary-foreground border-primary-foreground/20"><SelectItem value="velcro">Velcro</SelectItem><SelectItem value="lace-up">Lace-up</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-primary-foreground/80">Weight</Label><Input value={form.weight} onChange={e => updateForm('weight', e.target.value)} className={darkInput} /></div>
                  <div><Label className="text-primary-foreground/80">Brand</Label><Input value={form.brand} onChange={e => updateForm('brand', e.target.value)} className={darkInput} /></div>
                  <div><Label className="text-primary-foreground/80">Color</Label><Input value={form.color} onChange={e => updateForm('color', e.target.value)} className={darkInput} /></div>
                </div>
                <div>
                  <Label className="text-primary-foreground/80">Image Upload / URL</Label>
                  <div className="flex gap-2">
                    <Input type="file" onChange={handleImageUpload} disabled={uploadingImage} className={`${darkInput} flex-1`} />
                    <Input value={form.image_url} onChange={e => updateForm('image_url', e.target.value)} placeholder="/products/product-1.jpeg" className={`${darkInput} flex-1`} />
                  </div>
                  {uploadingImage && 
                    // <p className="text-xs text-gold mt-1">Uploading...</p>
                    (
                      <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="h-3 w-3 animate-spin text-gold" />
                        <p className="text-xs text-gold">Uploading...</p>
                      </div>
                    )
                  }
                </div>
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 text-primary-foreground/80 cursor-pointer"><Checkbox checked={form.in_stock} onCheckedChange={v => updateForm('in_stock', v)} className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-gold-foreground" /> In Stock</label>
                  <label className="flex items-center gap-2 text-primary-foreground/80 cursor-pointer"><Checkbox checked={form.featured} onCheckedChange={v => updateForm('featured', v)} className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-gold-foreground" /> Featured</label>
                  <label className="flex items-center gap-2 text-primary-foreground/80 cursor-pointer"><Checkbox checked={form.bestseller} onCheckedChange={v => updateForm('bestseller', v)} className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-gold-foreground" /> Bestseller</label>
                </div>
                <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
                  {saveMutation.isPending ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl overflow-x-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-foreground/10">
                <th className="text-left p-4 text-gold font-semibold">Image</th>
                <th className="text-left p-4 text-gold font-semibold">Name</th>
                <th className="text-left p-4 text-gold font-semibold">Price</th>
                <th className="text-left p-4 text-gold font-semibold">Category</th>
                <th className="text-left p-4 text-gold font-semibold">Stock</th>
                <th className="p-4 text-gold font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, i: number) => (
                <tr key={p.id} className="border-b border-primary-foreground/5 hover:bg-primary-foreground/5 transition-colors">
                  <td className="p-4"><img src={p.image_url || '/placeholder.svg'} className="w-12 h-12 object-cover rounded-lg" alt="" /></td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">${Number(p.price).toFixed(2)}{p.sale_price && <span className="text-gold ml-2">${Number(p.sale_price).toFixed(2)}</span>}</td>
                  <td className="p-4 capitalize">{p.category}</td>
                  <td className="p-4">{p.in_stock ? <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full">In Stock</span> : <span className="bg-destructive/20 text-destructive text-xs px-2 py-1 rounded-full">Out</span>}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="hover:bg-gold hover:text-gold-foreground text-primary-foreground transition-colors"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="hover:bg-gold hover:text-gold-foreground text-destructive transition-colors" onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders */}
        <h2 className="text-xl font-bold uppercase mt-12 mb-6 tracking-wide">Recent <span className="text-gold">Orders</span></h2>
        <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl overflow-x-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-foreground/10">
                <th className="text-left p-4 text-gold font-semibold">Order ID</th>
                <th className="text-left p-4 text-gold font-semibold">Total</th>
                <th className="text-left p-4 text-gold font-semibold">Status</th>
                <th className="text-left p-4 text-gold font-semibold">Payment</th>
                <th className="text-left p-4 text-gold font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} onClick={() => openOrder(o)} className="border-b border-primary-foreground/5 hover:bg-gold/10 transition-colors cursor-pointer">
                  <td className="p-4 font-mono text-xs text-primary-foreground/60">{o.id.slice(0, 8)}</td>
                  <td className="p-4 font-semibold">${Number(o.total).toFixed(2)}</td>
                  <td className="p-4"><span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full capitalize">{o.status}</span></td>
                  <td className="p-4"><span className="bg-primary-foreground/10 text-primary-foreground/70 text-xs px-2 py-1 rounded-full capitalize">{o.payment_status}</span></td>
                  <td className="p-4 text-primary-foreground/60">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order details dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) { setSelectedOrder(null); setOrderItems([]); } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-primary text-primary-foreground border-primary-foreground/20">
            <DialogHeader>
              <DialogTitle className="text-gold">Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-primary-foreground/60 text-xs uppercase">Order ID</p>
                    <p className="font-mono text-xs break-all">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60 text-xs uppercase">Date</p>
                    <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60 text-xs uppercase">Status</p>
                    <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full capitalize inline-block mt-1">{selectedOrder.status}</span>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60 text-xs uppercase">Payment</p>
                    <span className="bg-primary-foreground/10 text-primary-foreground/80 text-xs px-2 py-1 rounded-full capitalize inline-block mt-1">{selectedOrder.payment_status}</span>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60 text-xs uppercase">Method</p>
                    <p className="capitalize">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60 text-xs uppercase">Shipping</p>
                    <p className="capitalize">{selectedOrder.shipping_method}</p>
                  </div>
                </div>

                {selectedOrder.shipping_address && Object.keys(selectedOrder.shipping_address).length > 0 && (
                  <div className="border-t border-primary-foreground/10 pt-3">
                    <p className="text-gold text-xs uppercase font-semibold mb-2">Shipping Address</p>
                    <div className="text-primary-foreground/80 space-y-0.5">
                      {selectedOrder.shipping_address.full_name && <p>{selectedOrder.shipping_address.full_name}</p>}
                      {selectedOrder.shipping_address.address && <p>{selectedOrder.shipping_address.address}</p>}
                      {(selectedOrder.shipping_address.city || selectedOrder.shipping_address.zip) && (
                        <p>{selectedOrder.shipping_address.city} {selectedOrder.shipping_address.zip}</p>
                      )}
                      {selectedOrder.shipping_address.country && <p>{selectedOrder.shipping_address.country}</p>}
                    </div>
                  </div>
                )}

                <div className="border-t border-primary-foreground/10 pt-3">
                  <p className="text-gold text-xs uppercase font-semibold mb-2">Items</p>
                  {orderItemsLoading ? (
                    // <p className="text-primary-foreground/60">Loading items...</p>
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  ) : orderItems.length === 0 ? (
                    <p className="text-primary-foreground/60">No items found.</p>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((it: any) => (
                        <div key={it.id} className="flex items-center gap-3 bg-primary-foreground/5 rounded-lg p-2">
                          <img src={it.products?.image_url || '/placeholder.svg'} alt="" className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{it.products?.name || 'Product'}</p>
                            <p className="text-xs text-primary-foreground/60">Qty: {it.quantity}{it.weight ? ` · ${it.weight}` : ''}</p>
                          </div>
                          <p className="font-semibold text-gold">${Number(it.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-primary-foreground/10 pt-3 flex justify-between items-center">
                  <span className="text-primary-foreground/70 uppercase text-xs">Total</span>
                  <span className="text-gold text-xl font-bold">${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
