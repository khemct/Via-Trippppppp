import { Link } from 'react-router-dom';
import { Mountain } from 'lucide-react';

const columns = [
  {
    key: 'brand',
    content: (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white"><Mountain size={16} /></div>
          <span className="text-base font-bold text-heading">Via-Trip</span>
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
    <footer className="bg-input border-t border-line mt-auto">
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
