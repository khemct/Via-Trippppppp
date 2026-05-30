import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORY_ICONS = {
  restaurant: '🍽', cafe: '☕', attraction: '🎯', park: '🌳',
  museum: '🏛', shopping: '🛍', accommodation: '🏨', gas_station: '⛽',
};

function SortableWaypoint({ wp, onRemove, onUpdateDuration }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: wp.waypoint_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#eef4e8' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 px-3 py-2.5 border-b border-[#f0f0ee] hover:bg-[#faf9f7] transition-colors"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-[#c0bcb2] hover:text-[#8a9e7c] shrink-0 px-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>
      <span className="text-xs font-bold text-[#8a9e7c] w-5 shrink-0">{wp.order}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-xs">{CATEGORY_ICONS[wp.category] || '📍'}</span>
          <span className="text-xs font-medium text-[#2d4a24] truncate">{wp.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#8a9e7c]">{wp.score}</span>
          {wp.distance_from_route >= 1000 && (
            <span className="text-xs text-[#d97706]">{(wp.distance_from_route / 1000).toFixed(1)}km detour</span>
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
          className="w-12 text-xs text-center border border-[#d4cfbf] rounded px-1 py-0.5 text-[#2d4a24] focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
        />
        <span className="text-xs text-[#8a9e7c]">min</span>
        <button
          onClick={() => onRemove(wp.waypoint_id)}
          className="ml-1 text-[#c0bcb2] hover:text-red-500 transition-colors"
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

  const feasiColors = {
    feasible: { bg: '#eef4e8', text: '#4a6741', bar: '#4a6741', label: 'Feasible' },
    tight: { bg: '#fef3c7', text: '#92400e', bar: '#d97706', label: 'Tight' },
    at_risk: { bg: '#fee2e2', text: '#991b1b', bar: '#dc2626', label: 'At Risk' },
  };

  const feasi = feasibility ? feasiColors[feasibility.status] || feasiColors.feasible : null;

  return (
    <div className="h-full flex flex-col bg-white border border-[#e8e4da] rounded-lg overflow-hidden">
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-[#e0ddd6] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#2d4a24]">Itinerary</h2>
        <span className="text-xs text-[#8a9e7c]">{waypoints.length} stop{waypoints.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-2 items-center">
                <div className="h-3 w-4 bg-[#e0ddd6] rounded" />
                <div className="flex-1 h-4 bg-[#e0ddd6] rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && waypoints.length === 0 && (
          <div className="p-6 text-center text-sm text-[#8a9e7c] space-y-2">
            <p>No waypoints yet.</p>
            <p className="text-xs">Click <span className="text-[#4a6741]">+ Add</span> on a recommendation to add it here.</p>
            {onReset && (
              <button onClick={onReset} className="block mx-auto mt-3 text-xs text-[#4a6741] font-medium hover:underline">
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
        <div className="shrink-0 p-4 border-t border-[#e0ddd6]" style={{ background: feasi.bg }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: feasi.text }}>{feasi.label}</span>
            <span className="text-xs" style={{ color: feasi.text }}>
              {feasibility.details.utilization_pct}% utilized
            </span>
          </div>
          <div className="h-1.5 bg-white bg-opacity-60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(feasibility.details.utilization_pct, 100)}%`,
                background: feasi.bar,
              }}
            />
          </div>
          {feasibility.details.detours > 0 && (
            <div className="mt-1.5 text-xs" style={{ color: feasi.text }}>
              {feasibility.details.detours} detour{feasibility.details.detours !== 1 ? 's' : ''} · {feasibility.details.total_detour_distance_m}m extra
            </div>
          )}
        </div>
      )}
    </div>
  );
}
