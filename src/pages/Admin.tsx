

import { useState, useRef } from 'react';
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
import { Pencil, Trash2, Plus, Package, DollarSign, ShoppingCart, MessageSquare, Upload, X, ImagePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const defaultProduct = {
  name: '', description: '', price: 0, sale_price: null as number | null,
  category: 'boxing-gloves', gender: 'unisex', type: 'velcro', weight: '12oz', brand: '', color: '',
  image_url: '', images: [] as string[], in_stock: true, featured: false, bestseller: false,
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const name = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(name, file);
    if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const newUrls = await Promise.all(files.map(f => uploadFile(f)));
      const currentImages = [...(form.image_url ? [form.image_url] : []), ...(form.images || [])];
      const allImages = [...currentImages, ...newUrls].slice(0, 5);
      
      updateForm('image_url', allImages[0] || '');
      updateForm('images', allImages.slice(1));
      toast.success(`${newUrls.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const currentImages = [...(form.image_url ? [form.image_url] : []), ...(form.images || [])];
    currentImages.splice(index, 1);
    
    if (currentImages.length === 0) {
      updateForm('image_url', '');
      updateForm('images', []);
    } else {
      updateForm('image_url', currentImages[0]);
      updateForm('images', currentImages.slice(1));
    }
  };

  const openOrder = async (order: any) => {
    setSelectedOrder(order);
    setOrderItemsLoading(true);
    const { data } = await supabase.from('order_items').select('*, products(name, image_url)').eq('order_id', order.id);
    setOrderItems(data || []);
    setOrderItemsLoading(false);
  };

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

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const saveMutation = useMutation({
    mutationFn: async (product: any) => {
      const payload = { ...product };
      delete payload.id; delete payload.created_at; delete payload.updated_at;
      delete payload.rating; delete payload.review_count;
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
      category: product.category, gender: product.gender || 'unisex', type: product.type || 'velcro', weight: product.weight || '12oz',
      brand: product.brand || '', color: product.color || '', image_url: product.image_url || '',
      images: product.images || [],
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
  const unreadCount = messages.filter((m: any) => m.status === 'unread').length;

  const allImages = [
    ...(form.image_url ? [{ url: form.image_url }] : []),
    ...(form.images || []).map(url => ({ url }))
  ];

  const inputStyle = "w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm px-4 py-2.5 transition-all duration-200 focus:border-gold focus:outline-none";
  const selectTriggerStyle = "h-11 w-full rounded-lg border border-white/10 bg-white/5 text-white text-sm px-4 transition-all duration-200 focus:border-gold focus:outline-none data-[state=open]:border-gold";

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-8 animate-fade-in">
          Admin <span className="text-gold">Dashboard</span>
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Package, label: 'Products', value: products.length },
            { icon: ShoppingCart, label: 'Orders', value: orders.length },
            { icon: DollarSign, label: 'Revenue', value: `$${revenue.toFixed(2)}` },
            { icon: MessageSquare, label: 'Unread Messages', value: unreadCount },
          ].map((stat, i) => (
            <div key={i} className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6 text-center hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-[1.02] animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-gold" />
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
              <Button onClick={openNew} className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    {editProduct ? 'Update product information' : 'Fill in the details below'}
                  </p>
                </div>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-5 custom-scroll" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <div>
                  <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Product Name</Label>
                  <input
                    value={form.name}
                    onChange={e => updateForm('name', e.target.value)}
                    placeholder="e.g. Professional Pure Leather Boxing Gloves"
                    className={inputStyle}
                  />
                </div>

                {/* <div>
                  <Label className="text-white/50 text-xs scroll-x  uppercase tracking-wider mb-1.5 block">Description</Label>
                  <textarea
                    value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    placeholder="Describe this product — materials, use-case, key features..."
                    rows={6}
                    className={`${inputStyle} resize-y min-h-[140px]`}
                  />
                </div> */}
                <div>
                  <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Description</Label>
                  <textarea
                    value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    placeholder="Describe this product — materials, use-case, key features..."
                    rows={6}
                    className={`${inputStyle} resize-y min-h-[140px] overflow-hidden-auto custom-scroll`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Price </Label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={e => updateForm('price', parseFloat(e.target.value))}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Sale Price</Label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.sale_price || ''}
                      placeholder="—"
                      onChange={e => updateForm('sale_price', e.target.value ? parseFloat(e.target.value) : null)}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Category</Label>
                    <Select value={form.category} onValueChange={v => updateForm('category', v)}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] text-white border-white/10">
                        <SelectItem value="boxing-gloves">Boxing Gloves</SelectItem>
                        <SelectItem value="boxing-sets">Boxing Sets</SelectItem>
                        <SelectItem value="kids-corner">Kids Corner</SelectItem>
                        <SelectItem value="horse-hair-gloves">Horse Hair Gloves</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Gender</Label>
                    <Select value={form.gender} onValueChange={v => updateForm('gender', v)}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] text-white border-white/10">
                        <SelectItem value="unisex">Unisex</SelectItem>
                        <SelectItem value="men">Men's</SelectItem>
                        <SelectItem value="women">Women's</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Closure Type</Label>
                    <Select value={form.type} onValueChange={v => updateForm('type', v)}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] text-white border-white/10">
                        <SelectItem value="velcro">Velcro Strap</SelectItem>
                        <SelectItem value="lace-up">Lace-Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Default Weight</Label>
                    <Select value={form.weight} onValueChange={v => updateForm('weight', v)}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] text-white border-white/10">
                        {['4oz','6oz','8oz','10oz','12oz','14oz','16oz','18oz','20oz'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Brand</Label>
                    <input
                      value={form.brand}
                      onChange={e => updateForm('brand', e.target.value)}
                      placeholder="e.g. Titan Sports"
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Color</Label>
                    <input
                      value={form.color}
                      onChange={e => updateForm('color', e.target.value)}
                      placeholder="e.g. Black / Gold"
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2 pb-2">
                  {[
                    { key: 'in_stock', label: 'In Stock' },
                    { key: 'featured', label: 'Featured' },
                    { key: 'bestseller', label: 'Bestseller' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={(form as any)[key]}
                        onCheckedChange={v => updateForm(key, v)}
                        className="border-white/30 rounded data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                      />
                      <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-5 mt-2">
                  <Label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Product Images</Label>
                  <p className="text-white/25 text-xs mb-3">Upload up to 5 images. First image becomes the main product image.</p>
                  
                  {allImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                      {allImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5">
                          <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-white" />
                            </button>
                          </div>
                          {idx === 0 && (
                            <div className="absolute top-1 left-1">
                              <span className="text-[8px] font-bold bg-gold text-black px-1.5 py-0.5 rounded tracking-wide">MAIN</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {allImages.length < 5 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-gold/50 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 group">
                          {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gold" />
                          ) : (
                            <>
                              <ImagePlus className="h-5 w-5 text-white/30 group-hover:text-gold/70 transition-colors" />
                              <span className="text-[9px] text-white/30 group-hover:text-gold/70">Add</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {allImages.length === 0 && (
                    <label className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed border-white/20 hover:border-gold/50 bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-200 group">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-gold" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-white/30 group-hover:text-gold/70 transition-colors" />
                            <p className="text-xs text-white/40 group-hover:text-gold/70">Click to upload images</p>
                            <p className="text-[10px] text-white/20">PNG, JPG, WEBP — up to 5 images</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        ref={fileInputRef}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-white/10 px-6 py-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-white/20 text-white/60 hover:text-white hover:border-white/30 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending || !form.name.trim()}
                  className="flex-1 bg-gold text-black hover:bg-gold/90 font-semibold"
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                  ) : (
                    <>{editProduct ? 'Update Product' : 'Create Product'}</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products table */}
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
              {products.map((p: any) => (
                <tr key={p.id} className="border-b border-primary-foreground/5 hover:bg-primary-foreground/5 transition-colors">
                  <td className="p-4"><img src={p.image_url || '/placeholder.svg'} className="w-12 h-12 object-cover rounded-lg" alt="" /></td>
                  <td className="p-4 font-medium max-w-xs truncate">{p.name}</td>
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
                  <div><p className="text-primary-foreground/60 text-xs uppercase">Order ID</p><p className="font-mono text-xs break-all">{selectedOrder.id}</p></div>
                  <div><p className="text-primary-foreground/60 text-xs uppercase">Date</p><p>{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
                  <div><p className="text-primary-foreground/60 text-xs uppercase">Status</p><span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full capitalize inline-block mt-1">{selectedOrder.status}</span></div>
                  <div><p className="text-primary-foreground/60 text-xs uppercase">Payment</p><span className="bg-primary-foreground/10 text-primary-foreground/80 text-xs px-2 py-1 rounded-full capitalize inline-block mt-1">{selectedOrder.payment_status}</span></div>
                  <div><p className="text-primary-foreground/60 text-xs uppercase">Method</p><p className="capitalize">{selectedOrder.payment_method}</p></div>
                  <div><p className="text-primary-foreground/60 text-xs uppercase">Shipping</p><p className="capitalize">{selectedOrder.shipping_method}</p></div>
                </div>
                {selectedOrder.shipping_address && Object.keys(selectedOrder.shipping_address).length > 0 && (
                  <div className="border-t border-primary-foreground/10 pt-3">
                    <p className="text-gold text-xs uppercase font-semibold mb-2">Shipping Address</p>
                    <div className="text-primary-foreground/80 space-y-0.5">
                      {selectedOrder.shipping_address.full_name && <p>{selectedOrder.shipping_address.full_name}</p>}
                      {selectedOrder.shipping_address.address && <p>{selectedOrder.shipping_address.address}</p>}
                      {(selectedOrder.shipping_address.city || selectedOrder.shipping_address.zip) && <p>{selectedOrder.shipping_address.city} {selectedOrder.shipping_address.zip}</p>}
                      {selectedOrder.shipping_address.country && <p>{selectedOrder.shipping_address.country}</p>}
                    </div>
                  </div>
                )}
                <div className="border-t border-primary-foreground/10 pt-3">
                  <p className="text-gold text-xs uppercase font-semibold mb-2">Items</p>
                  {orderItemsLoading ? (
                    <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-lg shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-4 w-12" /></div>)}</div>
                  ) : orderItems.length === 0 ? <p className="text-primary-foreground/60">No items found.</p> : (
                    <div className="space-y-2">
                      {orderItems.map((it: any) => (
                        <div key={it.id} className="flex items-center gap-3 bg-primary-foreground/5 rounded-lg p-2">
                          <img src={it.products?.image_url || '/placeholder.svg'} alt="" className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0"><p className="font-medium truncate">{it.products?.name || 'Product'}</p><p className="text-xs text-primary-foreground/60">Qty: {it.quantity}{it.weight ? ` · ${it.weight}` : ''}</p></div>
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

        {/* Messages */}
        <h2 className="text-xl font-bold uppercase mt-12 mb-6 tracking-wide">Contact <span className="text-gold">Messages</span></h2>
        <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl overflow-x-auto animate-fade-in">
          {messages.length === 0 ? (
            <p className="text-center text-primary-foreground/50 py-10">No messages yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-foreground/10">
                  <th className="text-left p-4 text-gold font-semibold">Name</th>
                  <th className="text-left p-4 text-gold font-semibold">Email</th>
                  <th className="text-left p-4 text-gold font-semibold">Subject</th>
                  <th className="text-left p-4 text-gold font-semibold">Message</th>
                  <th className="text-left p-4 text-gold font-semibold">Date</th>
                  <th className="text-left p-4 text-gold font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m: any) => (
                  <tr key={m.id} onClick={() => { if (m.status === 'unread') markReadMutation.mutate(m.id); }}
                    className="border-b border-primary-foreground/5 hover:bg-primary-foreground/5 transition-colors cursor-pointer">
                    <td className="p-4 font-medium">{m.name}</td>
                    <td className="p-4 text-primary-foreground/70">{m.email}</td>
                    <td className="p-4 text-primary-foreground/70">{m.subject || '—'}</td>
                    <td className="p-4 text-primary-foreground/70 max-w-xs truncate">{m.message}</td>
                    <td className="p-4 text-primary-foreground/60">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="p-4">{m.status === 'unread' ? <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full">Unread</span> : <span className="bg-primary-foreground/10 text-primary-foreground/50 text-xs px-2 py-1 rounded-full">Read</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;