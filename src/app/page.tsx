function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-24">
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            WanderPlan
          </span>
        </h1>

        <p className="max-w-2xl text-xl text-gray-600">
          Your comprehensive travel planning companion. Create detailed itineraries, collaborate
          with others, and organize all your travel information in one place.
        </p>

        <div className="flex gap-4">
          <a
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign In
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FeatureCard
            title="Plan Trips"
            description="Create day-by-day itineraries with drag-and-drop functionality"
          />
          <FeatureCard
            title="Collaborate"
            description="Work with friends and family in real-time on your trip plans"
          />
          <FeatureCard
            title="Track Budgets"
            description="Manage expenses and split costs with your travel companions"
          />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Project Setup Complete • Phase 1: Foundation & Authentication
        </p>
      </div>
    </main>
  )
}
