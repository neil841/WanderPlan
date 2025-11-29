import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface JoinPageProps {
    params: {
        token: string;
    };
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { token } = params;
    const session = await auth();

    // 1. Validate Token
    const shareToken = await prisma.tripShareToken.findUnique({
        where: { token },
        include: {
            trip: {
                include: {
                    creator: true,
                }
            }
        }
    });

    if (!shareToken || !shareToken.isActive) {
        return notFound();
    }

    if (new Date() > shareToken.expiresAt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="p-8 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h1>
                    <p className="text-slate-600 mb-6">This invite link has expired. Please ask the trip owner for a new one.</p>
                    <Button asChild>
                        <Link href="/">Go Home</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const { trip } = shareToken;

    // 2. If Logged In -> Add to Collaborators & Redirect
    if (session?.user) {
        // Check if already a collaborator or owner
        const isOwner = trip.createdBy === session.user.id;
        const existingCollaborator = await prisma.tripCollaborator.findUnique({
            where: {
                tripId_userId: {
                    tripId: trip.id,
                    userId: session.user.id,
                }
            }
        });

        if (isOwner || existingCollaborator) {
            redirect(`/trips/${trip.id}`);
        }

        // Determine role based on token permissions
        const role = shareToken.permissions === 'editor' ? 'EDITOR' : 'VIEWER';

        // Add as Collaborator
        await prisma.tripCollaborator.create({
            data: {
                trip: { connect: { id: trip.id } },
                user: { connect: { id: session.user.id } },
                inviter: { connect: { id: shareToken.createdBy } },
                role: role,
                status: 'ACCEPTED',
                joinedAt: new Date(),
            }
        });

        redirect(`/trips/${trip.id}`);
    }

    // 3. If Not Logged In -> Show Public Landing Page
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center">
                <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    WanderPlan
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Sign Up</Link>
                    </Button>
                </div>
            </header>

            {/* Hero Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">

                    {/* Left: Trip Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                                <UserPlus className="w-4 h-4" />
                                You've been invited to view
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                                {trip.name}
                            </h1>
                            <p className="text-lg text-slate-600">
                                Planned by <span className="font-semibold text-slate-900">{trip.creator.firstName} {trip.creator.lastName}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium">
                                    {format(new Date(trip.startDate), 'MMMM d')} - {format(new Date(trip.endDate), 'MMMM d, yyyy')}
                                </span>
                            </div>

                            {trip.destinations.length > 0 && (
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                        <MapPin className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="font-medium">
                                        {trip.destinations.join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="gap-2 shadow-lg shadow-blue-500/20" asChild>
                                <Link href={`/login?callbackUrl=/join/${token}`}>
                                    <LogIn className="w-4 h-4" />
                                    Log in to Join Trip
                                </Link>
                            </Button>
                            {/* Future: Add "View as Guest" button here if we implement public view without login */}
                        </div>
                        <p className="text-sm text-slate-500">
                            Join to see the full itinerary, map, and details.
                        </p>
                    </div>

                    {/* Right: Preview Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl transform rotate-3 opacity-20 blur-xl"></div>
                        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl aspect-[4/5] flex flex-col">
                            {trip.coverImageUrl ? (
                                <img
                                    src={trip.coverImageUrl}
                                    alt={trip.name}
                                    className="w-full h-1/2 object-cover"
                                />
                            ) : (
                                <div className="w-full h-1/2 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <MapPin className="w-16 h-16 text-white/50" />
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                                <div className="space-y-2">
                                    <div className="h-2 w-20 bg-slate-100 rounded-full mb-4"></div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex-shrink-0"></div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-3 w-3/4 bg-slate-100 rounded-full"></div>
                                                    <div className="h-2 w-1/2 bg-slate-50 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 text-center">
                                    <p className="text-sm font-medium text-slate-600">
                                        + {trip.destinations.length} destinations
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}
