import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Camera, ClipboardList, Heart, Sparkles, Truck, Compass, Trees, Coffee, Mountain, Waves, Sunset, Palmtree } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import SearchInput from '../components/SearchInput';

const features = [
  { icon: MapPin, img: '/Pin_icon.png', title: 'Smart Route Planning', desc: 'Optimized routes with smart stops along the way.' },
  { icon: Camera, img: '/Camera_icon.png', title: 'Discover Hidden Gems', desc: 'Find unique places off the beaten path.' },
  { icon: ClipboardList, img: '/Clipboard_icon.png', title: 'Build Your Itinerary', desc: 'Customize every stop and plan your perfect day.' },
  { icon: Heart, img: '/Heart_icon.png', title: 'Collect Memories', desc: 'Save your favorite spots and share your journey.' },
];

const inspirations = [
  { name: 'Bangkok', tags: 'Urban · Culture', rating: 4.7, img: '/Bangkok.png' },
  { name: 'Chiang Mai', tags: 'Nature · Tradition', rating: 4.8, img: '/Chiang%20Mai.png' },
  { name: 'Krabi', tags: 'Beach · Adventure', rating: 4.7, img: '/Krabi.png' },
  { name: 'Phuket', tags: 'Coastal · Freedom', rating: 4.7, img: '/Phuket.png' },
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
      <section className="relative bg-cover bg-center px-4 md:px-8 pt-8 pb-6 md:pt-10 md:pb-8"
        style={{ backgroundImage: "url('/Nature_bg.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand/60 via-brand-hover/50 to-amber-800/60" />
        <div className="max-w-6xl mx-auto flex gap-10 flex-col lg:flex-row relative z-10">
          {/* Left */}
          <div className="w-full lg:w-[55%]">
            <div className="inline-flex items-center gap-2 bg-white/90 text-brand rounded-full px-3.5 py-1 text-sm font-medium mb-4 shadow-sm">
              <Compass size={13} />
              Your adventure starts here
            </div>
            <h1 className="text-3xl md:text-[42px] font-extrabold text-heading leading-[1.1] mb-4">
              Every Route Has a Story<ThemeIcon size={26} className="inline ml-1.5 text-brand align-middle" />
            </h1>
            <p className="text-base text-body leading-relaxed mb-6 max-w-[480px]">
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
            <div className="relative bg-cover bg-center rounded-2xl pt-6 pb-10 px-10 text-white text-center shadow-soft-lg h-full flex flex-col justify-between overflow-hidden"
                 style={{ backgroundImage: "url('/Await_bg.png')" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
              <div className="relative z-10">
                <div className="text-2xl font-bold mb-1">Adventure Awaits</div>
                <div className="text-sm text-white/80 mb-5">Discover the road less traveled</div>
              </div>
              <div className="relative z-10 flex gap-2 justify-center flex-wrap">
                {['Mountains', 'Waterfalls', 'Cafés', 'Good Vibes'].map((tag) => (
                  <span key={tag} className="bg-white/20 rounded-xl px-3.5 py-1 text-sm font-medium backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Section 2 — Inspiration */}
        <div className="max-w-6xl mx-auto relative z-10 mt-10 md:mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-heading">Inspiration for Your Next Trip</h2>
              <p className="text-sm text-muted mt-0.5">Popular destinations to get you started</p>
            </div>
            <Sparkles size={20} className="text-brand shrink-0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {inspirations.map((item) => (
              <div key={item.name} className="bg-card rounded-2xl border border-line/40 overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5 relative">
                  <img src={item.img} alt={item.name} className="w-full block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white rounded-full px-2.5 py-0.5 text-xs font-medium mb-2">
                      <Trees size={9} />
                      {item.tags}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white drop-shadow-lg">{item.name}</span>
                      <span className="text-sm text-amber-300 font-semibold drop-shadow-lg">★ {item.rating}</span>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Why Via-Trip? */}
      <section className="bg-card px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-heading mb-1">Why Via-Trip?</h2>
            <p className="text-sm text-muted max-w-md mx-auto">Everything you need to plan the perfect road trip</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-base rounded-2xl p-5 border border-line/40 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 shrink-0 rounded-xl bg-brand-light/60 flex items-center justify-center text-brand">
                    <img src={f.img} alt={f.title} className="w-20 h-20" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-heading leading-tight">{f.title}</div>
                    <div className="text-sm text-muted leading-relaxed mt-1">{f.desc}</div>
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
