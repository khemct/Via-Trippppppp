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
      <section
        style={{
          background: 'linear-gradient(135deg, #e8f0e0 0%, #f5f3ee 100%)',
          padding: '80px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            gap: 60,
            alignItems: 'center',
          }}
        >
          {/* Left */}
          <div style={{ flex: '0 0 55%' }}>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: '#2d4a24',
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              Every Route Has a Story
            </h1>
            <p
              style={{
                fontSize: 16,
                color: '#5a6b4e',
                lineHeight: 1.6,
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              Plan your trip, discover hidden gems, and collect memories along the way.
            </p>

            <form
              onSubmit={handleSearch}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Where are you starting?"
                  style={{
                    flex: 1,
                    border: '1.5px solid #d4cfbf',
                    borderRadius: 8,
                    background: '#fafaf7',
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#5a6b4e',
                    outline: 'none',
                  }}
                />
                <input
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder="Where are you going?"
                  style={{
                    flex: 1,
                    border: '1.5px solid #d4cfbf',
                    borderRadius: 8,
                    background: '#fafaf7',
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#5a6b4e',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#4a6741',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✨ Start Planning
              </button>
            </form>
          </div>

          {/* Right */}
          <div style={{ flex: '0 0 40%' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #4a6741, #6b8f5e)',
                borderRadius: 16,
                padding: 40,
                color: '#fff',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 64, marginBottom: 12 }}>🚐</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
                Adventure Awaits
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {['Mountains', 'Waterfalls', 'Cafés', 'Good Vibes ♡'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Features */}
      <section style={{ background: '#fff', padding: '56px 24px' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 32,
          }}
        >
          {features.map((f) => (
            <div key={f.title}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#eef4e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  marginBottom: 12,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2d4a24', marginBottom: 6 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 12, color: '#8a9e7c', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Inspiration */}
      <section style={{ background: '#f5f3ee', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#2d4a24',
              marginBottom: 32,
            }}
          >
            Inspiration for Your Next Trip ✦
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {inspirations.map((item) => (
              <div
                key={item.name}
                style={{
                  background: '#fff',
                  border: '1px solid #e8e4da',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: 120,
                    background: item.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 32,
                    fontWeight: 700,
                  }}
                >
                  {item.name.split(' ')[0]}
                </div>
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#eef4e8',
                      color: '#4a6741',
                      borderRadius: 12,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 500,
                      marginBottom: 8,
                    }}
                  >
                    {item.tags}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#2d4a24' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: 13, color: '#d4a843', fontWeight: 600 }}>
                      ★ {item.rating}
                    </span>
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
