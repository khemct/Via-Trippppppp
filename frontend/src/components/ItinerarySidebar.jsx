import { UtensilsCrossed, Coffee, Landmark, TreePine, ShoppingBag, Building2, Fuel, MapPin } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function CategoryIcon({ category, size = 12 }) {
  const map = {
    restaurant: UtensilsCrossed, cafe: Coffee, attraction: Landmark, park: TreePine,
    museum: Landmark, shopping: ShoppingBag, accommodation: Building2, gas_station: Fuel,
  };
  const Icon = map[category];
  return Icon ? <Icon size={size} className="text-muted" /> : <MapPin size={size} className="text-muted" />;
}

function SortableWaypoint({ wp, onRemove, onUpdateDuration }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: wp.waypoint_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#252318' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 px-3 py-2.5 border-b border-line hover:bg-deep transition-colors"
    >
      <button {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab text-[#6b6650] hover:text-body shrink-0 px-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>
      <span className="text-xs font-bold text-muted w-5 shrink-0">{wp.order}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <CategoryIcon category={wp.category} size={12} />
          <span className="text-sm font-medium text-heading truncate">{wp.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted">{wp.score}</span>
          {wp.distance_from_route >= 1000 && (
            <span className="text-xs text-amber-600">{(wp.distance_from_route / 1000).toFixed(1)}km detour</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <input
          type="number"
          min="5"
          max="180"
          step="5"
          value={wp.stop_duration_minutes || 30}
          onChange={(e) => onUpdateDuration(wp.waypoint_id, parseInt(e.target.value, 10) || 30)}
          className="w-12 text-xs text-center border border-line-strong rounded px-1 py-0.5 text-heading focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <span className="text-xs text-muted">min</span>
        <button
          onClick={() => onRemove(wp.waypoint_id)}
          aria-label={`Remove ${wp.name}`}
          className="ml-1 text-[#5a5540] hover:text-red-500 transition-colors"
          title="Remove"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ItinerarySidebar({
  waypoints,
  loading,
  feasibility,
  onRemove,
  onUpdateDuration,
  onReorder,
  onReset,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = waypoints.findIndex((wp) => wp.waypoint_id === active.id);
    const newIdx = waypoints.findIndex((wp) => wp.waypoint_id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = [...waypoints];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    const withOrder = reordered.map((wp, i) => ({ waypoint_id: wp.waypoint_id, order: i + 1 }));
    onReorder(withOrder);
  }

  const feasiStyles = {
    feasible: { container: 'bg-line', text: 'text-brand', bar: 'bg-brand', label: 'Feasible' },
    tight: { container: 'bg-amber-50', text: 'text-amber-800', bar: 'bg-amber-500', label: 'Tight' },
    at_risk: { container: 'bg-red-50', text: 'text-red-800', bar: 'bg-red-600', label: 'At Risk' },
  };

  const feasi = feasibility ? feasiStyles[feasibility.status] || feasiStyles.feasible : null;

  return (
    <div className="h-full flex flex-col bg-card border border-line-strong rounded-lg overflow-hidden">
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-line flex items-center justify-between">
        <h2 className="text-sm font-semibold text-heading">Itinerary</h2>
        <span className="text-sm text-muted">{waypoints.length} stop{waypoints.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-2 items-center">
                <div className="h-3 w-4 bg-line rounded" />
                <div className="flex-1 h-4 bg-line rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && waypoints.length === 0 && (
          <div className="p-6 text-center text-sm text-muted space-y-2">
            <p>No waypoints yet.</p>
            <p className="text-xs">Click <span className="text-brand-text">+ Add</span> on a recommendation to add it here.</p>
            {onReset && (
              <button onClick={onReset} className="block mx-auto mt-3 text-xs text-brand-text font-medium hover:underline">
                Reset & re-seed
              </button>
            )}
          </div>
        )}

        {!loading && waypoints.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={waypoints.map((wp) => wp.waypoint_id)} strategy={verticalListSortingStrategy}>
              {waypoints.map((wp) => (
                <SortableWaypoint key={wp.waypoint_id} wp={wp} onRemove={onRemove} onUpdateDuration={onUpdateDuration} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {feasi && (
        <div className={`shrink-0 p-4 border-t border-line ${feasi.container}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-medium ${feasi.text}`}>{feasi.label}</span>
            <span className={`text-sm ${feasi.text}`}>
              {feasibility.details.utilization_pct}% utilized
            </span>
          </div>
          <div className="h-1.5 bg-input rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${feasi.bar}`}
              style={{ width: `${Math.min(feasibility.details.utilization_pct, 100)}%` }}
            />
          </div>
          {feasibility.details.detours > 0 && (
            <div className={`mt-1.5 text-sm ${feasi.text}`}>
              {feasibility.details.detours} detour{feasibility.details.detours !== 1 ? 's' : ''} · {feasibility.details.total_detour_distance_m}m extra
            </div>
          )}
        </div>
      )}
    </div>
  );
}
