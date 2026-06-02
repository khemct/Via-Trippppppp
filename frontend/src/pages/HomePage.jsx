import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Camera, ClipboardList, Heart, Sparkles, Truck, Compass, Trees, Coffee, Mountain, Waves, Sunset, Palmtree } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import SearchInput from '../components/SearchInput';

const features = [
  { icon: MapPin, title: 'Smart Route Planning', desc: 'Optimized routes with smart stops along the way.' },
  { icon: Camera, title: 'Discover Hidden Gems', desc: 'Find unique places off the beaten path.' },
  { icon: ClipboardList, title: 'Build Your Itinerary', desc: 'Customize every stop and plan your perfect day.' },
  { icon: Heart, title: 'Collect Memories', desc: 'Save your favorite spots and share your journey.' },
];

const inspirations = [
  { name: 'Chiang Mai', tags: 'Nature · Culture', rating: 4.8, gradient: 'linear-gradient(135deg, #3a7d44, #7cb342)' },
  { name: 'Phuket Roadtrip', tags: 'Coastal · Freedom', rating: 4.7, gradient: 'linear-gradient(135deg, #2d8a8a, #5bb8b8)' },
  { name: 'Khao Yai', tags: 'Nature · Camping', rating: 4.8, gradient: 'linear-gradient(135deg, #558b3a, #8bc34a)' },
  { name: 'Nan', tags: 'Slow life · Local vibe', rating: 4.6, gradient: 'linear-gradient(135deg, #b8874a, #d4a843)' },
];

const themeIcons = { adventure: Waves, bright: Sunset, modern: Palmtree };

export default function HomePage() {
  const { colorTheme } = useTheme();
  const ThemeIcon = themeIcons[colorTheme] || Waves;
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin.trim()) params.set('origin', origin.trim());
    if (dest.trim()) params.set('destination', dest.trim());
    navigate(`/trips/new?${params.toString()}`);
  }

  return (
    <div>
      {/* Section 1 — Hero */}
      <section className="bg-gradient-to-br from-brand-light/40 via-card to-base px-4 md:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto flex gap-10 flex-col lg:flex-row">
          {/* Left */}
          <div className="w-full lg:w-[55%]">
            <div className="inline-flex items-center gap-2 bg-brand-light/60 text-brand-text rounded-full px-3.5 py-1 text-[12px] font-medium mb-4">
              <Compass size={13} />
              Your adventure starts here
            </div>
            <h1 className="text-3xl md:text-[42px] font-extrabold text-heading leading-[1.1] mb-4">
              Every Route Has a Story<ThemeIcon size={26} className="inline ml-1.5 text-brand align-middle" />
            </h1>
            <p className="text-[15px] text-body leading-relaxed mb-6 max-w-[480px]">
              Plan your trip, discover hidden gems, and collect memories along the way.
            </p>

            <form onSubmit={handleSearch} className="bg-card rounded-2xl p-6 shadow-soft border border-line/40" role="search">
              <div className="flex flex-col md:flex-row gap-2.5 mb-3">
                <SearchInput
                  value={origin}
                  onChange={setOrigin}
                  placeholder="Where are you starting?"
                  className="flex-1"
                />
                <SearchInput
                  value={dest}
                  onChange={setDest}
                  placeholder="Where are you going?"
                  className="flex-1"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand text-brand-light border border-brand-hover rounded-xl py-3 text-[14px] font-semibold cursor-pointer active:scale-[0.98] transition-all hover:shadow-soft"
              >
                <Sparkles size={16} className="inline mr-1.5" />Start Planning
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="w-full lg:w-[45%]">
            <div className="bg-gradient-to-br from-brand via-brand-hover to-brand-text rounded-2xl p-10 text-white text-center shadow-soft-lg h-full flex flex-col justify-between">
              <div>
                <div className="mb-4"><Mountain size={64} className="text-white/90 mx-auto" /></div>
                <div className="text-2xl font-bold mb-1">Adventure Awaits</div>
                <div className="text-sm text-white/80 mb-5">Discover the road less traveled</div>
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {['Mountains', 'Waterfalls', 'Cafés', 'Good Vibes'].map((tag) => (
                  <span key={tag} className="bg-white/20 rounded-xl px-3.5 py-1 text-[12px] font-medium backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Features */}
      <section className="bg-card px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-heading mb-1">Why Via-Trip?</h2>
            <p className="text-sm text-muted max-w-md mx-auto">Everything you need to plan the perfect road trip</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-base rounded-2xl p-5 border border-line/40 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-brand-light/60 flex items-center justify-center text-brand mb-3"><f.icon size={18} /></div>
                <div className="text-sm font-semibold text-heading mb-1">{f.title}</div>
                <div className="text-[12px] text-muted leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Inspiration */}
      <section className="bg-base px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-heading">Inspiration for Your Next Trip</h2>
              <p className="text-sm text-muted mt-0.5">Popular destinations to get you started</p>
            </div>
            <Sparkles size={20} className="text-brand shrink-0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {inspirations.map((item) => (
              <div key={item.name} className="bg-card rounded-2xl border border-line/40 overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5">
                <div
                  className="h-[110px] flex items-center justify-center text-white text-[28px] font-bold relative"
                  style={{ background: item.gradient }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="relative drop-shadow-lg">{item.name.split(' ')[0]}</span>
                </div>
                <div className="p-4">
                  <div className="inline-flex items-center gap-1 bg-brand-light/60 text-brand-text rounded-full px-2.5 py-0.5 text-[10px] font-medium mb-2">
                    <Trees size={9} />
                    {item.tags}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-heading">{item.name}</span>
                    <span className="text-[12px] text-amber-500 font-semibold">★ {item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
