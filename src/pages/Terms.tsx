const Terms = () => (
  <div className="container mx-auto px-4 py-16 max-w-3xl">
    <h1 className="text-3xl font-bold uppercase tracking-tight mb-6">Terms & Conditions</h1>
    <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
    <div className="space-y-6 text-sm leading-relaxed">
      <section><h2 className="text-xl font-bold text-gold mb-2">1. About Ring Storm Sports</h2>
        <p>Ring Storm Sports sells <strong>physical boxing equipment</strong> only — including training, sparring, bag work, and competition gloves. We do not sell digital goods, services, or subscriptions.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">2. Order Acceptance</h2>
        <p>Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel orders due to stock issues, pricing errors, or suspected fraud. Confirmed orders are dispatched within 1–3 business days.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">3. Pricing & Currency</h2>
        <p>All prices are listed in <strong>USD</strong>. International customers may see currency conversion at checkout based on their card issuer's rate.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">4. International Shipping & Duties</h2>
        <p>We ship worldwide via DHL, FedEx, and partner postal services. Customers are responsible for any import duties, customs fees, or local taxes imposed by their country of delivery.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">5. Intellectual Property</h2>
        <p>All content on this site — including the Ring Storm Sports name, logo, product images, and copy — is owned by Ring Storm Sports and protected by copyright and trademark laws.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">6. Dispute Resolution</h2>
        <p>Disputes will first be addressed via good-faith communication with our support team. Unresolved disputes are subject to the jurisdiction of the courts where Ring Storm Sports is registered.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">7. Contact</h2>
        <p><span className="text-gold">support@ringstormsports.com</span></p></section>
    </div>
  </div>
);
export default Terms;
