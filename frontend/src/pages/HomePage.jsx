import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Camera, ClipboardList, Heart, Sparkles, Truck, Compass, Trees, Coffee, Mountain } from 'lucide-react';
import Footer from '../components/Footer';

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

export default function HomePage() {
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
      <section className="bg-gradient-to-br from-brand-light/40 via-card to-base px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto flex gap-16 items-center flex-col lg:flex-row">
          {/* Left */}
          <div className="w-full lg:w-[55%]">
            <div className="inline-flex items-center gap-2 bg-brand-light/60 text-brand-text rounded-full px-4 py-1.5 text-[13px] font-medium mb-5">
              <Compass size={14} />
              Your adventure starts here
            </div>
            <h1 className="text-3xl md:text-[44px] font-extrabold text-heading leading-[1.1] mb-5">
              Every Route Has a Story
            </h1>
            <p className="text-base text-body leading-relaxed mb-10 max-w-[480px]">
              Plan your trip, discover hidden gems, and collect memories along the way.
            </p>

            <form onSubmit={handleSearch} className="bg-card rounded-2xl p-8 shadow-soft border border-line/40" role="search">
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Where are you starting?"
                  className="flex-1 border border-line-strong rounded-xl bg-input px-4 py-3 text-sm text-heading outline-none focus:ring-2 focus:ring-brand/30 focus:border-transparent transition-all"
                />
                <input
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder="Where are you going?"
                  className="flex-1 border border-line-strong rounded-xl bg-input px-4 py-3 text-sm text-heading outline-none focus:ring-2 focus:ring-brand/30 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand text-brand-light border border-brand-hover rounded-xl py-3.5 text-[15px] font-semibold cursor-pointer active:scale-[0.98] transition-all hover:shadow-soft"
              >
                <Sparkles size={18} className="inline mr-1.5" />Start Planning
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="w-full lg:w-[40%]">
            <div className="bg-gradient-to-br from-brand via-[#4a9d4e] to-[#6aad5e] rounded-2xl p-10 text-white text-center shadow-soft-lg">
              <div className="mb-4"><Mountain size={64} className="text-white/90 mx-auto" /></div>
              <div className="text-[22px] font-bold mb-2">Adventure Awaits</div>
              <div className="text-sm text-white/80 mb-6">Discover the road less traveled</div>
              <div className="flex gap-2 justify-center flex-wrap">
                {['Mountains', 'Waterfalls', 'Cafés', 'Good Vibes'].map((tag) => (
                  <span key={tag} className="bg-white/20 rounded-xl px-4 py-1.5 text-[13px] font-medium backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Features */}
      <section className="bg-card px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-heading mb-2">Why Via-Trip?</h2>
            <p className="text-sm text-muted max-w-md mx-auto">Everything you need to plan the perfect road trip</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-base rounded-2xl p-6 border border-line/40 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-light/60 flex items-center justify-center text-brand mb-4"><f.icon size={22} /></div>
                <div className="text-sm font-semibold text-heading mb-2">{f.title}</div>
                <div className="text-[13px] text-muted leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Inspiration */}
      <section className="bg-base px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-heading">Inspiration for Your Next Trip</h2>
              <p className="text-sm text-muted mt-1">Popular destinations to get you started</p>
            </div>
            <Sparkles size={24} className="text-brand shrink-0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inspirations.map((item) => (
              <div key={item.name} className="bg-card rounded-2xl border border-line/40 overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5">
                <div
                  className="h-[130px] flex items-center justify-center text-white text-[32px] font-bold relative"
                  style={{ background: item.gradient }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="relative drop-shadow-lg">{item.name.split(' ')[0]}</span>
                </div>
                <div className="p-5">
                  <div className="inline-flex items-center gap-1 bg-brand-light/60 text-brand-text rounded-full px-3 py-1 text-[11px] font-medium mb-3">
                    <Trees size={10} />
                    {item.tags}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-heading">{item.name}</span>
                    <span className="text-[13px] text-amber-500 font-semibold">★ {item.rating}</span>
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
