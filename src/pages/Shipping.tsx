const Shipping = () => (
  <div className="container mx-auto px-4 py-16 max-w-3xl">
    <h1 className="text-3xl font-bold uppercase tracking-tight mb-6">Shipping Policy</h1>
    <div className="space-y-6 text-sm leading-relaxed">
      <p>Titan Sports ships <strong>physical boxing gloves and equipment</strong> worldwide. Every order is carefully packaged and dispatched from our warehouse.</p>
      <section><h2 className="text-xl font-bold text-gold mb-2">Delivery Times</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Standard International:</strong> 7–14 business days</li>
          <li><strong>Express International:</strong> 3–5 business days</li>
          <li><strong>Free standard shipping</strong> on all orders over <strong>$75</strong></li>
        </ul></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">Carriers</h2>
        <p>We ship via <strong>DHL, FedEx</strong>, and trusted local postal services depending on your destination.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">Tracking</h2>
        <p>A tracking number is emailed to you as soon as your order is dispatched, typically within 1–3 business days of payment.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">Customs & Duties</h2>
        <p>International customers are responsible for any customs, import duties, or VAT charged by their country. These fees are not included in the order total.</p></section>
      <section><h2 className="text-xl font-bold text-gold mb-2">Countries We Ship To</h2>
        <p>We deliver to over 50 countries including the <strong>USA, UK, Canada, Australia, UAE, all of Europe</strong>, and most worldwide destinations. Contact us if your country is not listed at checkout.</p></section>
    </div>
  </div>
);
export default Shipping;
