import { Brain, MessageSquareText, Eye, Inbox, Repeat, Search } from 'lucide-react';

const capabilities = [
  {
    icon: Brain,
    text: 'Automatically understands email intent and urgency',
  },
  {
    icon: MessageSquareText,
    text: 'Writes thoughtful replies in your voice',
  },
  {
    icon: Eye,
    text: 'Highlights what matters now',
  },
  {
    icon: Inbox,
    text: 'Combines multiple inboxes into one calm view',
  },
  {
    icon: Repeat,
    text: 'Automates repetitive email actions',
  },
  {
    icon: Search,
    text: 'Lets you search your inbox like a conversation',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground animate-fade-in leading-tight">
              Designed for Focus,
              <br />
              <span className="text-primary">Powered by AI</span>
            </h2>
          </div>

          {/* Elegant vertical list */}
          <div className="space-y-1">
            {capabilities.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-5 py-5 border-b border-border/15 last:border-b-0 animate-fade-in"
                style={{ animationDelay: `${150 + index * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary/70" />
                </div>
                <p className="text-lg text-foreground/90 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
