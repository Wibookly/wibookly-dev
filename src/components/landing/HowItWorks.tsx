import { ArrowDown, FolderOpen, Mail, MessageSquare, Reply, Send, Sparkles, Tag, Zap } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import outlookLogo from '@/assets/outlook-logo.png';

// Gmail icon
const GmailIcon = () => (
  <svg viewBox="0 0 48 48" className="w-12 h-12" aria-hidden="true">
    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
    <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
    <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z" />
  </svg>
);

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Up and running in minutes
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Four simple steps to transform your email workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Card 1 — Connect your email */}
          <div className="flex flex-col">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-foreground mb-2">Connect your email</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Securely link your Google or Microsoft account. Wibookly uses OAuth 2.0 — we never see your password.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center flex-1">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                Takes 1 min
              </span>
              {/* Gmail + Outlook on top */}
              <div className="flex items-center gap-5 mb-4">
                <div className="w-18 h-18 rounded-2xl bg-secondary flex items-center justify-center shadow-sm p-3">
                  <GmailIcon />
                </div>
                <div className="w-18 h-18 rounded-2xl bg-secondary flex items-center justify-center shadow-sm p-3 overflow-hidden">
                  <img src={outlookLogo} alt="Outlook" className="w-12 h-12 object-contain" />
                </div>
              </div>
              {/* Arrow down */}
              <ArrowDown className="w-5 h-5 text-muted-foreground my-2" />
              {/* Wibookly at bottom */}
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center shadow-sm mt-2">
                <img src={wibooklyLogo} alt="Wibookly" className="h-14 w-auto" />
              </div>
            </div>
          </div>

          {/* Card 2 — Wibookly onboards itself (circular hub) */}
          <div className="flex flex-col">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-foreground mb-2">Wibookly onboards itself</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AI scans your inbox, learns your patterns, and creates smart categories and rules automatically.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center flex-1">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                Takes 5 min
              </span>
              {/* Circular hub layout */}
              <div className="relative w-[200px] h-[200px] flex items-center justify-center">
                {/* Connecting lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none">
                  {/* Lines from center to each icon */}
                  <line x1="100" y1="100" x2="55" y2="35" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="100" y1="100" x2="145" y2="35" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="100" y1="100" x2="55" y2="165" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="100" y1="100" x2="145" y2="165" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="4 3" />
                </svg>

                {/* Center — Wibookly */}
                <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center shadow-sm z-10">
                  <img src={wibooklyLogo} alt="Wibookly" className="h-14 w-auto" />
                </div>

                {/* Top-left — Tag */}
                <div className="absolute top-0 left-[15%] w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-primary" />
                </div>
                {/* Top-right — FolderOpen */}
                <div className="absolute top-0 right-[15%] w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-accent" />
                </div>
                {/* Bottom-left — Mail */}
                <div className="absolute bottom-0 left-[15%] w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                {/* Bottom-right — Sparkles */}
                <div className="absolute bottom-0 right-[15%] w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 — Review and send */}
          <div className="flex flex-col">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-foreground mb-2">Review and send</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AI drafts polished replies for every category. Review, tweak if needed, and send — all in one click.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center flex-1">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                Save 2h a day for free
              </span>
              {/* Mock email draft UI */}
              <div className="w-full rounded-xl border border-border bg-secondary p-4 text-left space-y-3 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">To:</span>
                  <span>john@example.com</span>
                </div>
                <div className="h-px bg-border" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hi John, thanks for reaching out! I'd love to schedule a call to discuss the project timeline...
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    <img src={wibooklyLogo} alt="Wibookly" className="h-5 w-auto opacity-60" />
                    <span className="text-xs text-muted-foreground">AI Draft</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 — AI Auto Reply */}
          <div className="flex flex-col">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-foreground mb-2">AI Auto Reply</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Set rules to auto-reply to common emails. Your AI handles repetitive responses while you focus on priorities.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center flex-1">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                Fully automated
              </span>
              {/* Mock auto-reply UI */}
              <div className="w-full rounded-xl border border-border bg-secondary p-4 text-left space-y-3 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Reply className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Auto-replied</span>
                  <span className="text-muted-foreground ml-auto">· 2 min ago</span>
                </div>
                <div className="h-px bg-border" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thank you for your inquiry! I've forwarded this to our scheduling team and you'll hear back within 24h...
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">Auto Reply</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Sent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
