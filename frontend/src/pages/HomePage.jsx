import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const features = [
  { icon: '📍', title: 'Smart Route Planning', desc: 'Optimized routes with smart stops along the way.' },
  { icon: '📷', title: 'Discover Hidden Gems', desc: 'Find unique places off the beaten path.' },
  { icon: '📋', title: 'Build Your Itinerary', desc: 'Customize every stop and plan your perfect day.' },
  { icon: '💚', title: 'Collect Memories', desc: 'Save your favorite spots and share your journey.' },
];

const inspirations = [
  { name: 'Chiang Mai', tags: 'Nature · Culture', rating: 4.8, gradient: 'linear-gradient(135deg, #4a6741, #7da06e)' },
  { name: 'Phuket Roadtrip', tags: 'Coastal · Freedom', rating: 4.7, gradient: 'linear-gradient(135deg, #2d8a8a, #5bb8b8)' },
  { name: 'Khao Yai', tags: 'Nature · Camping', rating: 4.8, gradient: 'linear-gradient(135deg, #6b8f5e, #9ab88a)' },
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
      <section className="bg-gradient-to-br from-card to-base px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-[1280px] mx-auto flex gap-12 items-center flex-col lg:flex-row">
          {/* Left */}
          <div className="w-full lg:w-[55%]">
            <h1 className="text-3xl md:text-[42px] font-extrabold text-heading leading-tight mb-4">
              Every Route Has a Story
            </h1>
            <p className="text-base text-body leading-relaxed mb-8 max-w-[480px]">
              Plan your trip, discover hidden gems, and collect memories along the way.
            </p>

            <form onSubmit={handleSearch} className="bg-card rounded-xl p-6 shadow-lg" role="search">
              <div className="flex gap-3 mb-4">
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Where are you starting?"
                  className="flex-1 border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none"
                />
                <input
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder="Where are you going?"
                  className="flex-1 border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand text-brand-light border-none rounded-lg py-3 text-[15px] font-semibold cursor-pointer active:scale-[0.98] transition-transform"
              >
                ✨ Start Planning
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="w-full lg:w-[40%]">
            <div className="bg-gradient-to-br from-brand to-[#6b8f5e] rounded-xl p-10 text-white text-center">
              <div className="text-[64px] mb-3">🚐</div>
              <div className="text-[22px] font-bold mb-6">Adventure Awaits</div>
              <div className="flex gap-2 justify-center flex-wrap">
                {['Mountains', 'Waterfalls', 'Cafés', 'Good Vibes ♡'].map((tag) => (
                  <span key={tag} className="bg-white/20 rounded-xl px-3.5 py-1.5 text-[13px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Features */}
      <section className="bg-card px-4 md:px-6 py-10 md:py-14">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title}>
              <div className="w-10 h-10 rounded-full bg-line flex items-center justify-center text-lg mb-3">{f.icon}</div>
              <div className="text-[13px] font-semibold text-heading mb-1.5">{f.title}</div>
              <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Inspiration */}
      <section className="bg-base px-4 md:px-6 py-10 md:py-14">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[28px] font-bold text-heading mb-8">
            Inspiration for Your Next Trip ✦
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {inspirations.map((item) => (
              <div key={item.name} className="bg-card border border-line-strong rounded-xl overflow-hidden">
                <div
                  className="h-[120px] flex items-center justify-center text-white text-[32px] font-bold"
                  style={{ background: item.gradient }}
                >
                  {item.name.split(' ')[0]}
                </div>
                <div className="p-4">
                  <div className="inline-block bg-line text-brand-text rounded-xl px-2.5 py-1 text-[11px] font-medium mb-2">
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
