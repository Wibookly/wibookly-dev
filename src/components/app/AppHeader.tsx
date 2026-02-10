import { useAuth } from '@/lib/auth';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { UserAvatarDropdown } from './UserAvatarDropdown';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function TimeIcon({ className }: { className?: string }) {
  const tod = getTimeOfDay();
  switch (tod) {
    case 'morning': return <Sunrise className={className} style={{ color: 'hsl(38 92% 50%)' }} />;
    case 'afternoon': return <Sun className={className} style={{ color: 'hsl(38 80% 55%)' }} />;
    case 'evening': return <Sunset className={className} style={{ color: 'hsl(25 90% 55%)' }} />;
    case 'night': return <Moon className={className} style={{ color: 'hsl(230 60% 65%)' }} />;
  }
}

const QUOTES: { text: string; author: string }[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "We become what we think about most of the time.", author: "Earl Nightingale" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
  { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "Nothing is impossible. The word itself says 'I'm possible!'", author: "Audrey Hepburn" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "The energy of the mind is the essence of life.", author: "Aristotle" },
  { text: "Try not to become a man of success. Rather become a man of value.", author: "Albert Einstein" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Keep your face always toward the sunshine and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
  { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "Only a life lived for others is a life worthwhile.", author: "Albert Einstein" },
  { text: "Whoever is happy will make others happy too.", author: "Anne Frank" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { text: "Love the life you live. Live the life you love.", author: "Bob Marley" },
  { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius" },
  { text: "May you live all the days of your life.", author: "Jonathan Swift" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Money and success don't change people; they merely amplify what is already there.", author: "Will Smith" },
  { text: "Not how long, but how well you have lived is the main thing.", author: "Seneca" },
  { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
  { text: "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.", author: "Henry Ford" },
  { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
  { text: "You can never cross the ocean until you have the courage to lose sight of the shore.", author: "Christopher Columbus" },
  { text: "Limit your 'always' and your 'nevers.'", author: "Amy Poehler" },
  { text: "Nothing is impossible, the word itself says 'I'm possible!'", author: "Audrey Hepburn" },
];

/** Pick a quote based on today's date and half-day period (2 per day) */
function getDailyQuote(): { text: string; author: string } {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const halfDay = now.getHours() < 14 ? 0 : 1;
  const index = (dayOfYear * 2 + halfDay) % QUOTES.length;
  return QUOTES[index];
}

/** Subtle flowing dots that drift across the header */
const FLOW_PARTICLES = [
  { delay: 0, y: 30, dur: 8, size: 4, color: 'hsl(170 65% 50%)' },
  { delay: 2, y: 55, dur: 9, size: 3, color: 'hsl(210 80% 55%)' },
  { delay: 4, y: 70, dur: 7.5, size: 5, color: 'hsl(280 60% 60%)' },
  { delay: 1, y: 20, dur: 10, size: 3, color: 'hsl(38 85% 55%)' },
  { delay: 3, y: 45, dur: 8.5, size: 4, color: 'hsl(170 65% 50%)' },
  { delay: 5, y: 75, dur: 7, size: 3, color: 'hsl(210 80% 55%)' },
];

export function AppHeader() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.trim().split(' ')[0] || 'there';
  const quote = getDailyQuote();

  const getGreeting = () => {
    const tod = getTimeOfDay();
    switch (tod) {
      case 'morning': return 'Good morning';
      case 'afternoon': return 'Good afternoon';
      case 'evening': return 'Good evening';
      case 'night': return 'Good night';
    }
  };

  return (
    <header className="hidden lg:flex h-16 border-b border-border/40 bg-card/30 backdrop-blur-sm items-center sticky top-0 z-40 relative overflow-hidden w-full">
      {/* Subtle animated data streams */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hdr-stream-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(170 65% 40%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(170 65% 40%)" stopOpacity="0.1" />
            <stop offset="70%" stopColor="hsl(210 80% 55%)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(210 80% 55%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hdr-stream-2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(280 70% 60%)" stopOpacity="0" />
            <stop offset="40%" stopColor="hsl(280 70% 60%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="24" x2="100%" y2="28" stroke="url(#hdr-stream-1)" strokeWidth="1" strokeDasharray="8 6" style={{ animation: 'hdr-dash 6s linear infinite' }} />
        <line x1="0" y1="42" x2="100%" y2="38" stroke="url(#hdr-stream-2)" strokeWidth="1" strokeDasharray="6 8" style={{ animation: 'hdr-dash-rev 7s linear infinite' }} />
      </svg>

      {/* Subtle flowing dot particles */}
      {FLOW_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `hdr-dot-flow ${p.dur}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0,
            filter: `blur(0.5px)`,
          }}
        />
      ))}

      {/* Center: Greeting + Quote */}
      <div className="flex-1 flex items-center justify-center gap-3 relative z-10 min-w-0 px-5">
        <div className="p-2 rounded-xl bg-primary/10 shrink-0">
          <TimeIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">
            {getGreeting()}, {firstName}
          </h2>
          <p className="text-xs text-muted-foreground truncate italic">
            "{quote.text}" — <span className="font-medium not-italic">{quote.author}</span>
          </p>
        </div>
      </div>

      {/* Right: User profile */}
      <div className="flex items-center px-5 relative z-10 shrink-0">
        <UserAvatarDropdown />
      </div>

      {/* Animations */}
      <style>{`
        @keyframes hdr-dash {
          0%   { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hdr-dash-rev {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 200; }
        }
        @keyframes hdr-dot-flow {
          0%   { left: -10px; opacity: 0; }
          5%   { opacity: 0.6; }
          50%  { opacity: 0.4; }
          95%  { opacity: 0.1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </header>
  );
}
