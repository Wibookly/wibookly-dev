import { ArrowRight, FolderOpen, Mail, MessageSquare, Reply, Send, Sparkles, Tag, Zap } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import outlookLogo from '@/assets/outlook-logo.png';

// Gmail icon (compact)
const GmailSmall = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" aria-hidden="true">
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
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-foreground">Connect your email</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Securely link your Google or Microsoft account. Wibookly uses OAuth 2.0 — we never see your password.
            </p>
            <div className="mt-2 rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-5 flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Takes 1 min
              </span>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shadow-sm">
                  <GmailSmall />
                </div>
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shadow-sm overflow-hidden">
                  <img src={outlookLogo} alt="Outlook" className="w-10 h-10 object-contain" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground mx-1" />
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shadow-sm">
                  <img src={wibooklyLogo} alt="Wibookly" className="h-12 w-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — Wibookly onboards itself */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-foreground">Wibookly onboards itself</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI scans your inbox, learns your patterns, and creates smart categories and rules automatically.
            </p>
            <div className="mt-2 rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-5 flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                Takes 5 min
              </span>
              <div className="relative flex items-center justify-center w-full py-6">
                <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center shadow-sm z-10">
                  <img src={wibooklyLogo} alt="Wibookly" className="h-14 w-auto" />
                </div>
                {/* Floating icons — bigger */}
                <div className="absolute -top-1 left-1/4 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute top-0 right-1/4 w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-accent" />
                </div>
                <div className="absolute -bottom-1 left-1/3 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute bottom-0 right-1/3 w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 — AI Draft */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-foreground">Review and send</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI drafts polished replies for every category. Review, tweak if needed, and send — all in one click.
            </p>
            <div className="mt-2 rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-4 flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Save 2h a day for free
              </span>
              {/* Mock email draft UI */}
              <div className="w-full rounded-xl border border-border bg-secondary p-4 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">To:</span>
                  <span>john@example.com</span>
                </div>
                <div className="h-px bg-border" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Hi John, thanks for reaching out! I'd love to schedule a call to discuss the project timeline...
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <img src={wibooklyLogo} alt="Wibookly" className="h-4 w-auto opacity-60" />
                    <span className="text-[10px] text-muted-foreground">AI Draft</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                    <Send className="w-3 h-3" />
                    Send
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 — AI Auto Reply */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-foreground">AI Auto Reply</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Set rules to auto-reply to common emails. Your AI handles repetitive responses while you focus on priorities.
            </p>
            <div className="mt-2 rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-4 flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                Fully automated
              </span>
              {/* Mock auto-reply UI */}
              <div className="w-full rounded-xl border border-border bg-secondary p-4 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Reply className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Auto-replied</span>
                  <span className="text-muted-foreground">· 2 min ago</span>
                </div>
                <div className="h-px bg-border" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Thank you for your inquiry! I've forwarded this to our scheduling team and you'll hear back within 24h...
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-accent" />
                    <span className="text-[10px] text-accent font-medium">Auto Reply</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                    <MessageSquare className="w-3 h-3" />
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
