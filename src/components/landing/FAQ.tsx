import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Wibookly?',
    answer: 'Wibookly is an AI-powered email assistant that organizes your inbox, drafts smart replies, and manages your calendar — all from one platform. It connects securely to your Outlook or Gmail account and automates repetitive email tasks so you can focus on what matters.',
  },
  {
    question: 'How does Wibookly organize my emails?',
    answer: 'Wibookly uses custom categories and intelligent rules to automatically sort incoming emails. You define the categories (e.g., Clients, Newsletters, Invoices) and set rules based on sender, domain, subject, or keywords. Wibookly does the rest automatically.',
  },
  {
    question: 'Is my email data secure?',
    answer: 'Absolutely. We use industry-standard OAuth 2.0 for authentication — we never see or store your email password. All data is encrypted with AES-256 at rest and TLS 1.3 in transit. We are SOC 2 Type II certified and GDPR compliant.',
  },
  {
    question: 'Which email providers does Wibookly support?',
    answer: 'Wibookly currently supports Microsoft Outlook (including Microsoft 365 and Exchange Online). Gmail support is coming soon. We connect via secure OAuth — no passwords required.',
  },
  {
    question: 'Can I control the AI-generated drafts?',
    answer: "Yes, you're always in control. Wibookly generates draft replies based on your writing style and preferences, but nothing is sent without your review and approval. You can edit, approve, or discard any draft.",
  },
  {
    question: 'How much does Wibookly cost?',
    answer: "Wibookly starts at $25/month which includes AI drafts, smart categories, rule-based sorting, and calendar management. That's less than what you'd pay for 4 separate tools. We also offer a free trial so you can try it risk-free.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 text-primary text-sm font-medium mb-4 border border-primary/20 shadow-sm animate-fade-in">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in text-foreground" style={{ animationDelay: '100ms' }}>
              Frequently Asked Questions
            </h2>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions */}
          <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p className="text-muted-foreground">
              Still have a question?{' '}
              <a href="mailto:hello@wibookly.ai" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
