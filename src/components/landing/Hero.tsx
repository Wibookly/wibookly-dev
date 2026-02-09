import { ArrowUpRight } from 'lucide-react';
import { HeroEngineStyles } from './hero/HeroEngineStyles';
import { HeroCenterHub } from './hero/HeroCenterHub';
import { HeroOrbitIcons } from './hero/HeroOrbitIcons';
import { HeroOrbitRings } from './hero/HeroOrbitRings';
import { HeroParticles } from './hero/HeroParticles';
import { HeroProviderCards } from './hero/HeroProviderCards';
import { HeroSvgBackground } from './hero/HeroSvgBackground';

interface HeroProps {
  onGetStartedClick: () => void;
}

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      <div className="blob-decoration blob-green w-96 h-96 -top-20 -left-32" />
      <div className="blob-decoration blob-blue w-80 h-80 top-20 -right-20" />

      <HeroEngineStyles />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <span className="text-foreground">Your inbox, handled.</span>
            <br />
            <span className="text-primary">Your focus, reclaimed.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Wibookly reads, categorizes, drafts, and sends your emails — so you can focus on what really matters.
          </p>

          <div className="mt-10 flex justify-center">
            <button
              onClick={onGetStartedClick}
              className="group flex items-center gap-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground pl-8 pr-2 py-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Get started
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </button>
          </div>

          {/* ── Engine Visual ── */}
          <div className="mt-16 flex flex-col items-center">
            <div className="hero-engine">
              <HeroSvgBackground />
              <HeroOrbitRings />
              <HeroParticles />
              <HeroOrbitIcons radius={210} duration={40} />
              <HeroCenterHub />
              <HeroProviderCards />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
