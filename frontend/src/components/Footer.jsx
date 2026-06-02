import { Link } from 'react-router-dom';

const columns = [
  {
    key: 'brand',
    content: (
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <img src="/Via_trip_logo.png" alt="Via-Trip" className="w-[72px] h-[72px]" />
          <div>
            <div className="text-base font-bold text-heading leading-tight">Via-Trip</div>
            <div className="text-xs text-muted leading-tight">Journey your way.</div>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-[240px]">
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
      className="bg-input border-t border-line mt-auto relative"
      style={{
        backgroundImage: "url('/Main_bg02.png')",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'soft-light',
      }}>
      <div className="max-w-[1280px] mx-auto px-6 py-8 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[280px_1fr_1fr_1fr] gap-6 lg:gap-8">
        {columns.map((col) => (
          <div key={col.key}>
            {col.content ? (
              col.content
            ) : (
              <>
                <div className="text-xs font-semibold text-muted tracking-wider mb-3">{col.title}</div>
                <div className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <Link key={link} to="/" className="text-sm text-body no-underline">{link}</Link>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-line py-4 px-6 text-center text-sm text-muted bg-deep">
        &copy; 2026 Via-Trip. All rights reserved.
      </div>
    </footer>
  );
}
