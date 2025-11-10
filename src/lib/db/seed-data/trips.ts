/**
 * Trip Seed Data
 *
 * Demo trips for development and testing
 */

/**
 * Demo trip data
 */
export const getDemoTrips = () => {
  return [
    {
      id: "trip-1-demo-paris",
      name: "Paris Adventure",
      description:
        "A week-long trip exploring the romantic city of Paris - visiting iconic landmarks, enjoying French cuisine, and experiencing the local culture.",
      startDate: new Date("2024-06-15"),
      endDate: new Date("2024-06-22"),
      destinations: ["Paris, France"],
      visibility: "PRIVATE" as const,
      coverImageUrl:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      createdBy: "user-2-demo-traveler",
    },
    {
      id: "trip-2-demo-tokyo",
      name: "Tokyo & Kyoto Experience",
      description:
        "Two weeks exploring Japan - modern Tokyo, historic Kyoto, traditional temples, amazing food, and cherry blossom season.",
      startDate: new Date("2024-09-10"),
      endDate: new Date("2024-09-24"),
      destinations: ["Tokyo, Japan", "Kyoto, Japan"],
      visibility: "SHARED" as const,
      coverImageUrl:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
      createdBy: "user-2-demo-traveler",
    },
    {
      id: "trip-3-demo-barcelona",
      name: "Barcelona Beach & Culture",
      description:
        "A luxurious 10-day trip to Barcelona featuring Gaudi architecture, Mediterranean beaches, tapas tours, and local wine tasting.",
      startDate: new Date("2024-07-20"),
      endDate: new Date("2024-07-30"),
      destinations: ["Barcelona, Spain"],
      visibility: "PRIVATE" as const,
      coverImageUrl:
        "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
      createdBy: "user-3-demo-agent",
    },
  ];
};

/**
 * Demo budget data for trips
 */
export const getDemoBudgets = () => {
  return [
    {
      tripId: "trip-1-demo-paris",
      totalBudget: 3500,
      currency: "USD",
      categoryBudgets: {
        ACCOMMODATION: { budgeted: 1200, spent: 0, remaining: 1200 },
        TRANSPORTATION: { budgeted: 800, spent: 0, remaining: 800 },
        FOOD: { budgeted: 900, spent: 0, remaining: 900 },
        ACTIVITIES: { budgeted: 500, spent: 0, remaining: 500 },
        SHOPPING: { budgeted: 100, spent: 0, remaining: 100 },
      },
    },
    {
      tripId: "trip-2-demo-tokyo",
      totalBudget: 6000,
      currency: "USD",
      categoryBudgets: {
        ACCOMMODATION: { budgeted: 2000, spent: 0, remaining: 2000 },
        TRANSPORTATION: { budgeted: 1500, spent: 0, remaining: 1500 },
        FOOD: { budgeted: 1500, spent: 0, remaining: 1500 },
        ACTIVITIES: { budgeted: 800, spent: 0, remaining: 800 },
        SHOPPING: { budgeted: 200, spent: 0, remaining: 200 },
      },
    },
    {
      tripId: "trip-3-demo-barcelona",
      totalBudget: 5000,
      currency: "USD",
      categoryBudgets: {
        ACCOMMODATION: { budgeted: 2000, spent: 0, remaining: 2000 },
        TRANSPORTATION: { budgeted: 600, spent: 0, remaining: 600 },
        FOOD: { budgeted: 1200, spent: 0, remaining: 1200 },
        ACTIVITIES: { budgeted: 1000, spent: 0, remaining: 1000 },
        SHOPPING: { budgeted: 200, spent: 0, remaining: 200 },
      },
    },
  ];
};

/**
 * Demo collaborator data
 */
export const getDemoCollaborators = () => {
  return [
    {
      tripId: "trip-2-demo-tokyo",
      userId: "user-1-demo-admin",
      role: "EDITOR" as const,
      status: "ACCEPTED" as const,
      invitedBy: "user-2-demo-traveler",
      joinedAt: new Date("2024-01-15"),
    },
  ];
};

/**
 * Demo tag data
 */
export const getDemoTags = () => {
  return [
    { tripId: "trip-1-demo-paris", name: "Europe", color: "#3B82F6" },
    { tripId: "trip-1-demo-paris", name: "Romantic", color: "#EC4899" },
    { tripId: "trip-2-demo-tokyo", name: "Asia", color: "#10B981" },
    { tripId: "trip-2-demo-tokyo", name: "Culture", color: "#8B5CF6" },
    { tripId: "trip-2-demo-tokyo", name: "Adventure", color: "#F59E0B" },
    { tripId: "trip-3-demo-barcelona", name: "Europe", color: "#3B82F6" },
    { tripId: "trip-3-demo-barcelona", name: "Beach", color: "#06B6D4" },
    { tripId: "trip-3-demo-barcelona", name: "Luxury", color: "#EAB308" },
  ];
};
