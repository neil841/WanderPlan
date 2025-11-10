/**
 * Trips Page
 *
 * List of user's trips.
 * This is a placeholder that will be enhanced with trip list functionality.
 */

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Trips</h1>
        <p className="mt-2 text-slate-600">
          View and manage all your travel plans in one place.
        </p>
      </div>

      {/* Placeholder content */}
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-900">No trips yet</p>
        <p className="mt-2 text-sm text-slate-600">
          Start planning your first adventure!
        </p>
      </div>
    </div>
  );
}
