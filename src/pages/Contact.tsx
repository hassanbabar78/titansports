// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Mail, Clock, Globe, Loader2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { contactSchema, friendlyError } from '@/lib/validation';
// import { useAuth } from '@/contexts/AuthContext';
// import { supabase } from '@/integrations/supabase/client';
// import { Link } from 'react-router-dom';

// const Contact = () => {
//   const { user } = useAuth();
//   const [form, setForm] = useState({ name: '', subject: '', message: '' });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) {
//       toast.error('You must be signed in to send a message.');
//       return;
//     }
//     setLoading(true);
//     try {
//       contactSchema.parse({ name: form.name, email: user.email!, message: form.message });
//       const { error } = await supabase.from('contact_messages').insert({
//         user_id: user.id,
//         name: form.name,
//         email: user.email!,
//         subject: form.subject,
//         message: form.message,
//         status: 'unread',
//       });
//       if (error) {
//         console.error('Supabase error:', error);
//         throw error;
//       }
//       toast.success("Message sent! We'll respond within 24–48 business hours.");
//       setForm({ name: '', subject: '', message: '' });
//     } catch (err) {
//       console.error('Submit error:', err);
//       toast.error(friendlyError(err, 'Failed to send message. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-background">
//       <div className="container mx-auto px-4 py-16 max-w-5xl">
//         <div className="text-center mb-12">
//           <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3">
//             Contact <span className="text-gold">Us</span>
//           </h1>
//           <p className="text-muted-foreground max-w-xl mx-auto">
//             Questions about sizing, shipping or your orders? Our team is ready to help.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-12">
//           <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
//             <h2 className="text-xl font-bold uppercase mb-6 text-gold">Send a Message</h2>

//             {!user ? (
//               <div className="text-center py-8 space-y-4">
//                 <p className="text-muted-foreground">You need to be signed in to send a message.</p>
//                 <Link to="/login">
//                   <Button className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase tracking-wide">
//                     Sign In to Contact Us
//                   </Button>
//                 </Link>
//               </div>
//             ) : (
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium mb-1 block">Name</label>
//                   <Input
//                     placeholder="Your Name"
//                     value={form.name}
//                     onChange={e => setForm({ ...form, name: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-1 block">Email</label>
//                   <Input
//                     type="email"
//                     value={user.email ?? ''}
//                     disabled
//                     className="bg-muted text-muted-foreground cursor-not-allowed opacity-70"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-1 block">Subject</label>
//                   <Input
//                     placeholder="Subject"
//                     value={form.subject}
//                     onChange={e => setForm({ ...form, subject: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-1 block">Message</label>
//                   <Textarea
//                     placeholder="Your Message"
//                     rows={5}
//                     value={form.message}
//                     onChange={e => setForm({ ...form, message: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   disabled={loading}
//                   className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase tracking-wide w-full"
//                 >
//                   {loading ? (
//                     <div className="flex items-center gap-2">
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       <span>Sending...</span>
//                     </div>
//                   ) : 'Send Message'}
//                 </Button>
//               </form>
//             )}
//           </div>

//           <div className="space-y-6">
//             <h2 className="text-xl font-bold uppercase mb-2 text-gold">Get In Touch</h2>
//             <div className="flex items-start gap-3">
//               <div className="bg-gold/10 p-3 rounded-full">
//                 <Mail className="h-5 w-5 text-gold" />
//               </div>
//               <div>
//                 <p className="font-semibold">Email</p>
//                 <p className="text-sm text-muted-foreground">support@titansports.com</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="bg-gold/10 p-3 rounded-full">
//                 <Clock className="h-5 w-5 text-gold" />
//               </div>
//               <div>
//                 <p className="font-semibold">Response Time</p>
//                 <p className="text-sm text-muted-foreground">Within 2 working days</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="bg-gold/10 p-3 rounded-full">
//                 <Clock className="h-5 w-5 text-gold" />
//               </div>
//               <div>
//                 <p className="font-semibold">Business Hours</p>
//                 <p className="text-sm text-muted-foreground">Monday – Friday</p>
//                 <p className="text-sm text-muted-foreground">9am – 6pm PKT</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="bg-gold/10 p-3 rounded-full">
//                 <Globe className="h-5 w-5 text-gold" />
//               </div>
//               <div>
//                 <p className="font-semibold">International Shipping</p>
//                 <p className="text-sm text-muted-foreground">We ship worldwide to all major countries.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Contact;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Clock, Globe, LockKeyhole, MessageCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { contactSchema, friendlyError } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to send a message.');
      return;
    }
    setLoading(true);
    try {
      contactSchema.parse({ name: form.name, email: user.email!, message: form.message });
      const { error } = await supabase.from('contact_messages').insert({
        user_id: user.id,
        name: form.name,
        email: user.email!,
        subject: form.subject,
        message: form.message,
        status: 'unread',
      });
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      toast.success("Message sent! We'll respond within 24–48 business hours.");
      setForm({ name: '', subject: '', message: '' });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(friendlyError(err, 'Failed to send message. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3">
            Contact <span className="text-gold">Us</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Questions about sizing, shipping or your orders? Our team is ready to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Send Message Box */}
          <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold uppercase mb-6 text-gold">Send a Message</h2>

            {!user ? (
              <div className="text-center py-8">
                {/* Lock Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <LockKeyhole className="h-10 w-10 text-gold" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                  Please sign in to your account to send us a message. Our team typically responds within 24 business hours.
                </p>
                
                <Link to="/login">
                  <Button className="bg-gold text-black hover:bg-gold/90 font-bold uppercase tracking-wide px-8">
                    Sign In to Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/login" className="text-gold hover:underline" onClick={(e) => {
                      e.preventDefault();
                      const signUpTab = document.querySelector('[value="signup"]') as HTMLButtonElement;
                      if (signUpTab) signUpTab.click();
                      window.location.href = '/login';
                    }}>
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    placeholder="Your Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    className="focus:border-gold focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={user.email ?? ''}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <Input
                    placeholder="Subject"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                    className="focus:border-gold focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message</label>
                  <Textarea
                    placeholder="Your Message"
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                    className="focus:border-gold focus:ring-gold resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gold text-black hover:bg-gold/90 font-bold uppercase tracking-wide w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <>
                      Send Message
                      <MessageCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase mb-2 text-gold">Get In Touch</h2>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className="bg-gold/10 p-3 rounded-full shrink-0">
                <Mail className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-muted-foreground">support@titansports.com</p>
                <p className="text-xs text-muted-foreground/60 mt-1">We reply within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className="bg-gold/10 p-3 rounded-full shrink-0">
                <Clock className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold">Business Hours</p>
                <p className="text-sm text-muted-foreground">Monday – Friday</p>
                <p className="text-sm text-muted-foreground">9am – 6pm PKT</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Closed on weekends & public holidays</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className="bg-gold/10 p-3 rounded-full shrink-0">
                <Globe className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold">International Shipping</p>
                <p className="text-sm text-muted-foreground">We ship worldwide to 50+ countries</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Free shipping on orders over $75</p>
              </div>
            </div>

            {/* Quick Tip Box */}
            <div className="mt-8 p-4 rounded-xl border border-gold/20 bg-gold/5">
              <p className="text-xs text-center text-muted-foreground">
                <span className="text-gold font-semibold">Quick Tip:</span> Before sending a message, check our 
                <Link to="/shipping" className="text-gold hover:underline mx-1">Shipping Policy</Link>
                and
                <Link to="/refunds" className="text-gold hover:underline ml-1">Returns Policy </Link>
                 so that your question might already be answered there!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;