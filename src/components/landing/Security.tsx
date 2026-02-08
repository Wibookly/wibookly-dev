import { CheckCircle2 } from 'lucide-react';

const securityChecks = [
  'SOC 2 Type II Compliant',
  'GDPR Compliant',
  '256-bit AES Encryption',
  'Regular Security Audits'
];

export function Security() {
  return (
    <section id="security" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-foreground text-background px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Bank-level{' '}
              <span className="text-primary">security</span>{' '}
              for
              <br />
              your peace of mind
            </h2>

            <p className="mt-6 text-background/70 max-w-xl mx-auto text-lg leading-relaxed">
              Your data stays yours. We use OAuth-based access, enterprise-grade encryption, and never store your password.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {securityChecks.map((check) => (
                <div
                  key={check}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-background/10 border border-background/10"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-background/90">{check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
