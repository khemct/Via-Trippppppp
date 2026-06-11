import { useState } from 'react';
import { Image } from 'lucide-react';
import { getPhotoUrl } from '../services/api';
import PlaceDetailModal from './PlaceDetailModal';

export default function PlaceThumbnail({ place, photoReference, alt, size = 48, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const ref = photoReference || place?.photo_reference;
  const name = alt || place?.name || '';
  const src = getPhotoUrl(ref, size * 2, size * 2);
  const hasPhoto = src && !imgError;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`shrink-0 rounded overflow-hidden border border-line transition-opacity hover:opacity-90 ${className}`}
        style={{ width: size, height: size }}
      >
        {hasPhoto ? (
          <>
            {!loaded && (
              <div className="w-full h-full bg-input animate-pulse flex items-center justify-center text-muted">
                <Image size={size * 0.4} />
              </div>
            )}
            <img
              src={src}
              alt={name}
              onLoad={() => setLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover ${loaded ? 'block' : 'hidden'}`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-input flex items-center justify-center text-muted">
            <Image size={size * 0.4} />
          </div>
        )}
      </button>
      {showModal && (
        <PlaceDetailModal
          place={place || { photo_reference: ref, name }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
