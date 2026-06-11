import { useState } from 'react';
import { UtensilsCrossed, Coffee, Landmark, TreePine, ShoppingBag, Building2, Fuel, MapPin } from 'lucide-react';
import PlaceThumbnail from './PlaceThumbnail';

const CATEGORIES = ['', 'restaurant', 'cafe', 'attraction', 'park', 'museum', 'shopping', 'accommodation', 'gas_station'];

function CategoryIcon({ category, size = 12 }) {
  const map = {
    restaurant: UtensilsCrossed, cafe: Coffee, attraction: Landmark, park: TreePine,
    museum: Landmark, shopping: ShoppingBag, accommodation: Building2, gas_station: Fuel,
  };
  const Icon = map[category];
  return Icon ? <Icon size={size} className="text-muted" /> : <MapPin size={size} className="text-muted" />;
}

function StarIcon({ filled }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? '#d97706' : '#5a5540'} stroke={filled ? '#d97706' : '#5a5540'} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function renderRating(rating) {
  const full = Math.floor(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(<StarIcon key={i} filled={i < full} />);
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function RecommendationPanel({
  places,
  loading,
  seeding,
  error,
  hasMore,
  onLoadMore,
  onAddWaypoint,
  onReseed,
  filters,
  onFilterChange,
}) {
  const [adding, setAdding] = useState({});

  async function handleAdd(place) {
    if (adding[place.place_id]) return;
    setAdding((prev) => ({ ...prev, [place.place_id]: true }));
    try {
      await onAddWaypoint(place);
    } finally {
      setAdding((prev) => ({ ...prev, [place.place_id]: false }));
    }
  }

  return (
    <div className="h-full flex flex-col bg-card border border-line-strong rounded-lg overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-line flex items-center justify-between">
        <h2 className="text-sm font-semibold text-heading">Recommendations</h2>
        <button
          onClick={onReseed}
          disabled={seeding}
          className="text-xs font-medium text-brand-text hover:underline disabled:opacity-50"
        >
          {seeding ? 'Seeding...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="shrink-0 px-4 py-3 border-b border-line space-y-2">
        <div className="flex gap-2">
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value, cursor: null })}
            className="flex-1 border border-line-strong rounded px-2 py-1.5 text-xs text-heading bg-input focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Categories'}
              </option>
            ))}
          </select>
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange({ ...filters, sort_by: e.target.value, cursor: null })}
            className="border border-line-strong rounded px-2 py-1.5 text-xs text-heading bg-input focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            <option value="score">Best Match</option>
            <option value="distance">Nearest</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted shrink-0">Min rating:</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.rating_min}
            onChange={(e) => onFilterChange({ ...filters, rating_min: parseFloat(e.target.value), cursor: null })}
            className="flex-1 accent-brand h-1"
          />
          <span className="text-xs text-body w-6 text-right">{filters.rating_min}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {seeding && (
          <div className="p-6 text-center text-sm text-muted">Seeding recommendations...</div>
        )}

        {!seeding && error && (
          <div className="p-4 text-center text-sm text-red-600">{error}</div>
        )}

        {!seeding && !error && places.length === 0 && (
          <div className="p-6 text-center text-sm text-muted space-y-2">
            <p>No recommendations found.</p>
            <button
              onClick={onReseed}
              className="text-brand-text font-medium hover:underline"
            >
              Re-seed from route
            </button>
          </div>
        )}

        {!seeding && places.length > 0 && (
          <div className="divide-y divide-line">
            {places.map((place) => (
              <div key={place.place_id} className="px-4 py-3 hover:bg-deep transition-colors">
                <div className="flex gap-3">
                  <PlaceThumbnail
                    place={place}
                    size={56}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <CategoryIcon category={place.category} size={12} />
                          <span className="text-sm font-medium text-heading truncate">{place.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          {renderRating(place.rating)}
                          <span>({place.user_ratings_total || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            place.score >= 70 ? 'bg-line text-brand-text' : place.score >= 50 ? 'bg-amber-50 text-amber-800' : 'bg-input text-muted'
                          }`}
                        >
                          {place.score}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted">
                        {place.distance_from_route < 1000
                          ? `${place.distance_from_route}m from route`
                          : `${(place.distance_from_route / 1000).toFixed(1)}km detour`}
                      </span>
                      <button
                        onClick={() => handleAdd(place)}
                        disabled={adding[place.place_id]}
                        className="text-xs font-medium text-brand-text hover:bg-input px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                      >
                        {adding[place.place_id] ? 'Adding...' : '+ Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse space-y-1.5">
                <div className="h-3 bg-line rounded w-3/4" />
                <div className="h-2 bg-line rounded w-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="shrink-0 p-3 border-t border-line">
          <button
            onClick={onLoadMore}
            className="w-full text-sm font-medium text-brand-text py-2 border border-line-strong rounded hover:bg-input transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {!hasMore && places.length > 0 && !loading && (
        <div className="shrink-0 p-3 border-t border-line text-center text-xs text-muted">
          All recommendations loaded
        </div>
      )}
    </div>
  );
}
