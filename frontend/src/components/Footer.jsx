import { Link } from 'react-router-dom';

const columns = [
  {
    key: 'brand',
    content: (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#4a6741',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            🏔
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#2d4a24' }}>Via-Trip</span>
        </div>
        <p style={{ fontSize: 13, color: '#8a9e7c', lineHeight: 1.6, maxWidth: 240 }}>
          Plan your perfect road trip, discover hidden gems, and collect memories along the way.
        </p>
      </div>
    ),
  },
  {
    key: 'company',
    title: 'COMPANY',
    links: ['About Us', 'How It Works', 'Blog', 'Contact Us'],
  },
  {
    key: 'support',
    title: 'SUPPORT',
    links: ['Help Center', 'Terms of Service', 'Privacy Policy', 'FAQs'],
  },
  {
    key: 'follow',
    title: 'FOLLOW US',
    links: ['Facebook', 'Instagram', 'Line'],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: '#fff',
        borderTop: '1px solid #e0ddd6',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '48px 24px 32px',
          display: 'grid',
          gridTemplateColumns: '280px 1fr 1fr 1fr',
          gap: 40,
        }}
      >
        {columns.map((col) => (
          <div key={col.key}>
            {col.content ? (
              col.content
            ) : (
              <>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#8a9e7c',
                    letterSpacing: '0.5px',
                    marginBottom: 16,
                  }}
                >
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((link) => (
                    <Link
                      key={link}
                      to="/"
                      style={{
                        fontSize: 13,
                        color: '#5a6b4e',
                        textDecoration: 'none',
                      }}
                    >
                      {link}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: '1px solid #e0ddd6',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: '#8a9e7c',
        }}
      >
        &copy; 2026 Via-Trip. All rights reserved.
      </div>
    </footer>
  );
}
