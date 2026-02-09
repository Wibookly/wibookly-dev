import outlookLogo from '@/assets/outlook-logo.png';

const GmailIcon = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
    <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
    <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z" />
  </svg>
);

export function HeroProviderCards() {
  return (
    <>
      {/* Gmail — bottom left */}
      <div
        className="absolute z-20"
        style={{
          left: '0',
          bottom: '8%',
          animation: 'hero-provider-float 4.5s ease-in-out infinite',
        }}
      >
        <div
          className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105"
          style={{ width: '6.5rem', height: '6.5rem' }}
        >
          <div style={{ width: '3.5rem', height: '3.5rem' }}>
            <GmailIcon />
          </div>
        </div>
        <span className="block text-xs text-muted-foreground mt-2 text-center font-semibold tracking-wide">
          Gmail
        </span>
      </div>

      {/* Outlook — bottom right */}
      <div
        className="absolute z-20"
        style={{
          right: '0',
          bottom: '8%',
          animation: 'hero-provider-float 4.5s ease-in-out infinite 1s',
        }}
      >
        <div
          className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105"
          style={{ width: '6.5rem', height: '6.5rem' }}
        >
          <img
            src={outlookLogo}
            alt="Outlook"
            className="object-contain"
            style={{ width: '4rem', height: '4rem' }}
          />
        </div>
        <span className="block text-xs text-muted-foreground mt-2 text-center font-semibold tracking-wide">
          Outlook
        </span>
      </div>
    </>
  );
}
