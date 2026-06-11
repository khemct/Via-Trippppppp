import { useEffect, useState, useCallback } from 'react';
import { X, MapPin, Clock, Star, Navigation, UtensilsCrossed, Coffee, Landmark, TreePine, ShoppingBag, Building2, Fuel, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { getPhotoUrl, places as placesApi } from '../services/api';

const CATEGORY_ICONS = {
  restaurant: UtensilsCrossed, cafe: Coffee, attraction: Landmark, park: TreePine,
  museum: Landmark, shopping: ShoppingBag, accommodation: Building2, gas_station: Fuel,
};

const CATEGORY_LABELS = {
  restaurant: 'Restaurant', cafe: 'Cafe', attraction: 'Attraction', park: 'Park',
  museum: 'Museum', shopping: 'Shopping', accommodation: 'Accommodation',
  gas_station: 'Gas Station', cultural_site: 'Cultural Site', photo_spot: 'Photo Spot',
  viewpoint: 'Viewpoint', rest_stop: 'Rest Stop', lodging: 'Lodging', other: 'Other',
};

function formatHours(hours) {
  if (!hours || !hours.weekday_text) return null;
  return hours.weekday_text;
}

function PhotoCarousel({ photos, name }) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState({});
  const [imgErrors, setImgErrors] = useState({});

  const urls = (photos || []).map(r => getPhotoUrl(r, 800, 600));
  const hasPrev = current > 0;
  const hasNext = current < urls.length - 1;

  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < urls.length) setCurrent(idx);
  }, [urls.length]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowLeft' && hasPrev) setCurrent(c => c - 1);
      if (e.key === 'ArrowRight' && hasNext) setCurrent(c => c + 1);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [hasPrev, hasNext]);

  if (urls.length === 0) return null;

  return (
    <div className="relative w-full bg-input rounded-t-2xl overflow-hidden select-none">
      <div className="relative h-72 sm:h-80">
        {urls.map((src, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-300 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {!loaded[i] && !imgErrors[i] && (
              <div className="absolute inset-0 animate-pulse bg-line" />
            )}
            {imgErrors[i] ? (
              <div className="w-full h-full flex items-center justify-center text-muted">
                <MapPin size={48} />
              </div>
            ) : (
              <img
                src={src}
                alt={`${name} ${i + 1}`}
                onLoad={() => setLoaded(prev => ({ ...prev, [i]: true }))}
                onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                className={`w-full h-full object-cover ${loaded[i] ? 'block' : 'hidden'}`}
              />
            )}
          </div>
        ))}

        {urls.length > 1 && (
          <>
            {hasPrev && (
              <button
                onClick={() => goTo(current - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {hasNext && (
              <button
                onClick={() => goTo(current + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {urls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/30 to-transparent h-16" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16" />
      </div>

      {/* Thumbnail strip */}
      {urls.length > 1 && (
        <div className="flex gap-1.5 p-2 bg-card border-t border-line overflow-x-auto">
          {urls.map((src, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-brand opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img
                src={getPhotoUrl(photos[i], 160, 120)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({ rating, reviewCount }) {
  const numRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalf = numRating - fullStars >= 0.3;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          let fill = '#3a3630';
          if (i < fullStars) fill = '#d97706';
          else if (i === fullStars && hasHalf) fill = '#d97706';
          return <Star key={i} size={14} fill={fill} color={fill} />;
        })}
      </div>
      <span className="text-sm font-semibold text-heading">{numRating.toFixed(1)}</span>
      {reviewCount > 0 && (
        <span className="text-sm text-muted">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        {label && <p className="text-xs text-muted mb-0.5">{label}</p>}
        <div className="text-sm text-body">{children}</div>
      </div>
    </div>
  );
}

export default function PlaceDetailModal({ place, onClose }) {
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    if (place.place_id) {
      setLoadingDetails(true);
      placesApi.details(place.place_id)
        .then((data) => setDetails(data))
        .catch(() => {})
        .finally(() => setLoadingDetails(false));
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, place.place_id]);

  const detailPhotos = details?.photos || [];
  const photos = detailPhotos.length > 1
    ? detailPhotos
    : (place.photos || (place.photo_reference ? [place.photo_reference] : []));
  const hours = formatHours(details?.opening_hours || place.opening_hours);
  const isOpen = (details?.opening_hours || place.opening_hours)?.open_now;
  const CategoryIcon = CATEGORY_ICONS[place.category];

  const reviews = details?.reviews || place.reviews;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo Carousel */}
        <div className="relative">
          {loadingDetails && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/40 text-white text-xs rounded-full px-2.5 py-1">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading more photos...
            </div>
          )}
          <PhotoCarousel photos={photos} name={place.name} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-heading">{place.name}</h2>
              {place.category && (
                <div className="flex items-center gap-1.5 mt-1">
                  {CategoryIcon && <CategoryIcon size={13} className="text-muted" />}
                  <span className="text-xs text-muted">{CATEGORY_LABELS[place.category] || place.category}</span>
                </div>
              )}
            </div>
            {place.score != null && (
              <div className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded ${
                place.score >= 70 ? 'bg-line text-brand-text' : place.score >= 50 ? 'bg-amber-50 text-amber-800' : 'bg-input text-muted'
              }`}>
                {place.score}
              </div>
            )}
          </div>

          <div className="mt-2">
            <StarRating rating={details?.rating || place.rating} reviewCount={details?.user_ratings_total || place.review_count || place.user_ratings_total || 0} />
          </div>

          {isOpen !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-medium ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                {isOpen ? 'Open now' : 'Closed'}
                {(details?.opening_hours?.weekday_text || place.opening_hours?.weekday_text) && (
                  <span className="text-muted font-normal"> &middot; {((details?.opening_hours || place.opening_hours).weekday_text)[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.split(': ')[1] || ''}</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-line mx-4" />

        {/* Info Sections */}
        <div className="px-4 py-3 space-y-4">
          {/* Address */}
          {place.vicinity && (
            <InfoRow icon={MapPin} label="Address">
              <span className="text-body">{place.vicinity}</span>
            </InfoRow>
          )}

          {/* Distance */}
          {place.distance_from_route != null && (
            <InfoRow icon={Navigation} label="Distance from route">
              <span>
                {place.distance_from_route < 1000
                  ? `${Math.round(place.distance_from_route)}m`
                  : `${(place.distance_from_route / 1000).toFixed(1)}km`}
                {place.distance_from_route >= 1000 && <span className="text-muted"> detour</span>}
              </span>
            </InfoRow>
          )}

          {/* Opening hours */}
          {hours && hours.length > 0 && (
            <InfoRow icon={Clock} label="Opening hours">
              <div className="space-y-0.5 mt-1">
                {hours.map((day, i) => {
                  const [label, ...rest] = day.split(': ');
                  const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                  return (
                    <div key={i} className={`text-xs flex gap-2 ${isToday ? 'font-semibold text-heading' : 'text-body'}`}>
                      <span className="w-24 shrink-0 text-muted">{label}</span>
                      <span>{rest.join(': ') || 'Closed'}</span>
                    </div>
                  );
                })}
              </div>
            </InfoRow>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <>
              <div className="border-t border-line -mx-4" style={{ width: 'calc(100% + 2rem)' }} />
              <div>
                <div className="flex items-center gap-1.5 mb-3 text-sm font-semibold text-heading">
                  <MessageSquare size={15} />
                  <span>Reviews</span>
                  {(details?.user_ratings_total || place.review_count) > 0 && <span className="text-muted font-normal">({details?.user_ratings_total || place.review_count})</span>}
                </div>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review, i) => (
                    <div key={i} className="bg-input rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-line flex items-center justify-center text-xs font-medium text-heading">
                          {(review.author_name || 'A')[0]}
                        </div>
                        <span className="text-sm font-medium text-heading">{review.author_name}</span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          <Star size={10} fill="#d97706" color="#d97706" />
                          <span className="text-xs text-muted">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-body leading-relaxed">
                        {review.text?.length > 200 ? review.text.slice(0, 200) + '...' : review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
