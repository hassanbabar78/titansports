import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { contactSchema, friendlyError } from '@/lib/validation';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      contactSchema.parse({ name: form.name, email: form.email, message: form.message });
      toast.success("Message sent! We'll respond within 24–48 business hours.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(friendlyError(err, 'Please check the form and try again.'));
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3">Contact <span className="text-gold">Us</span></h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Questions about gear, sizing, shipping, or your order? Our team is ready to help.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold uppercase mb-6 text-gold">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <Input type="email" placeholder="Your Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <Input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              <Textarea placeholder="Your Message" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase tracking-wide w-full">
                Send Message
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase mb-2 text-gold">Get In Touch</h2>
            <div className="flex items-start gap-3">
              <div className="bg-gold/10 p-3 rounded-full"><Mail className="h-5 w-5 text-gold" /></div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-muted-foreground">support@titansports.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gold/10 p-3 rounded-full"><Clock className="h-5 w-5 text-gold" /></div>
              <div>
                <p className="font-semibold">Response Time</p>
                <p className="text-sm text-muted-foreground">Within 24–48 business hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gold/10 p-3 rounded-full"><Clock className="h-5 w-5 text-gold" /></div>
              <div>
                <p className="font-semibold">Business Hours</p>
                <p className="text-sm text-muted-foreground">Monday–Friday, 9am–6pm PKT</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gold/10 p-3 rounded-full"><Globe className="h-5 w-5 text-gold" /></div>
              <div>
                <p className="font-semibold">International Shipping</p>
                <p className="text-sm text-muted-foreground">We are an international physical-goods business serving customers worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
