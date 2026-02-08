import wibooklyLogo from '@/assets/logo-icon.png';

export function ToolComparison() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              One Assistant
              <br />
              <span className="text-primary">Instead of Many Tools</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Most teams juggle multiple platforms just to manage email. Wibookly replaces them with a single, intelligent experience.
            </p>
            <p className="mt-3 text-muted-foreground/70">
              No switching. No overload. Just clarity.
            </p>
          </div>

          {/* Comparison — flowing, not boxy */}
          <div className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Traditional setup */}
            <div className="text-center pb-10 border-b border-border/15">
              <p className="text-sm font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Traditional Setup</p>
              <p className="text-foreground/80 leading-relaxed">
                Email clients, AI tools, automation software, helpdesk platforms — all disconnected.
              </p>
              <p className="mt-4 text-2xl md:text-3xl font-bold text-muted-foreground/40 line-through">
                $90<span className="text-base font-normal">/month</span>
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center py-6">
              <span className="text-sm font-medium text-muted-foreground/40">vs</span>
            </div>

            {/* Wibookly */}
            <div className="text-center pt-2">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src={wibooklyLogo} alt="Wibookly" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold text-foreground">Wibookly</span>
              </div>
              <p className="text-foreground/80 leading-relaxed max-w-lg mx-auto">
                One AI-powered workspace designed around how you actually work.
              </p>
              <p className="mt-4 text-3xl md:text-4xl font-bold text-primary">
                $25<span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <p className="mt-3 text-sm font-medium text-success">
                Save over $65/month
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
