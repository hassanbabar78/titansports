const Privacy = () => (
  <div className="container mx-auto px-4 py-16 max-w-3xl">
    <h1 className="text-3xl font-bold uppercase tracking-tight mb-6">Privacy Policy</h1>
    <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

    <div className="space-y-6 text-sm leading-relaxed">
      <section>
        <h2 className="text-xl font-bold text-gold mb-2">1. Information We Collect</h2>
        <p>When you shop at Titan Sports we collect: your name, email address, shipping/billing address, phone number, and payment information necessary to process and ship physical boxing equipment to you.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gold mb-2">2. How We Use Your Information</h2>
        <p>We use your data only to process orders, ship products, provide customer support, send order updates, and (with consent) marketing emails. We never sell or rent your personal data to third parties.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gold mb-2">3. Payment Security</h2>
        <p>All payments are processed by our PCI-DSS compliant payment processor over 256-bit SSL/TLS encryption. We do not store your full card number on our servers.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gold mb-2">4. Cookies</h2>
        <p>We use essential cookies for cart functionality, authentication, and analytics to improve site performance. You may disable cookies in your browser settings.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gold mb-2">5. Data Retention & Your Rights</h2>
        <p>You may request access, correction, or deletion of your personal data at any time. Contact us at <span className="text-gold">support@titansports.com</span>.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gold mb-2">6. Contact</h2>
        <p>For privacy questions, email <span className="text-gold">support@titansports.com</span>.</p>
      </section>
    </div>
  </div>
);
export default Privacy;
