/**
 * Dashboard Page
 *
 * Main dashboard landing page.
 * This is a placeholder that will be enhanced with dashboard widgets.
 */

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome to WanderPlan! Start planning your next adventure.
        </p>
      </div>

      {/* Placeholder content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">My Trips</h3>
          <p className="mt-2 text-sm text-slate-600">
            View and manage your upcoming trips
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            See your recent travel planning activity
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Recommendations
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Discover new destinations and experiences
          </p>
        </div>
      </div>
    </div>
  );
}
