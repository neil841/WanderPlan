'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
    Copy,
    Check,
    Share2,
    Smartphone,
    Globe,
    RefreshCw,
    ShieldCheck,
    ExternalLink,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

interface ShareToken {
    token: string;
    shareUrl: string;
    isActive: boolean;
    expiresAt: string;
}

export function ShareTripView() {
    const params = useParams();
    const tripId = params.tripId as string;
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const queryClient = useQueryClient();

    // Fetch active share token
    const { data: shareData, isLoading } = useQuery({
        queryKey: ['share-token', tripId],
        queryFn: async () => {
            const res = await fetch(`/api/trips/${tripId}/share`);
            if (!res.ok) throw new Error('Failed to fetch share token');
            return res.json();
        }
    });

    const activeToken = shareData?.data?.tokens?.[0];

    // Create/Enable Share Link
    const createTokenMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/trips/${tripId}/share`, {
                method: 'POST',
                body: JSON.stringify({ expiresIn: 30, permissions: 'view_only' })
            });
            if (!res.ok) throw new Error('Failed to create share link');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['share-token', tripId] });
            toast.success('Public link enabled');
        }
    });

    // Revoke/Disable Share Link
    const revokeTokenMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/trips/${tripId}/share`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to revoke share link');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['share-token', tripId] });
            toast.success('Public link disabled');
        }
    });

    const handleCopy = () => {
        if (!activeToken?.shareUrl) return;
        navigator.clipboard.writeText(activeToken.shareUrl);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        if (!activeToken?.shareUrl) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my trip on WanderPlan',
                    text: 'Check out this trip itinerary I planned!',
                    url: activeToken.shareUrl,
                });
                toast.success('Shared successfully');
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    const toggleShare = (enabled: boolean) => {
        if (enabled) {
            createTokenMutation.mutate();
        } else {
            revokeTokenMutation.mutate();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Share Trip
                </h1>
                <p className="text-muted-foreground text-lg">
                    Share your itinerary with friends, family, or the world.
                </p>
            </div>

            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <div className="p-6 md:p-8 space-y-8">

                    {/* Main Toggle Section */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${activeToken ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <Label htmlFor="public-link" className="text-base font-semibold cursor-pointer">
                                    Public Link
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {activeToken ? 'Anyone with the link can view this trip' : 'Enable to share this trip via link'}
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="public-link"
                            checked={!!activeToken}
                            onCheckedChange={toggleShare}
                            disabled={createTokenMutation.isPending || revokeTokenMutation.isPending}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {activeToken && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6"
                            >
                                {/* Link Display & Actions */}
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={activeToken.shareUrl}
                                            className="w-full pl-10 pr-32 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <div className="absolute right-2 top-2 bottom-2 flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={handleCopy}
                                                className="h-full px-4 shadow-sm hover:shadow-md transition-all"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                <span className="ml-2 hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 border-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group"
                                            onClick={handleNativeShare}
                                        >
                                            <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                            Share via...
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-12 border-slate-200 hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-purple-600 transition-all group"
                                            onClick={() => setShowQR(!showQR)}
                                        >
                                            <Smartphone className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                            {showQR ? 'Hide QR Code' : 'Show QR Code'}
                                        </Button>
                                    </div>
                                </div>

                                {/* QR Code Section */}
                                <AnimatePresence>
                                    {showQR && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner"
                                        >
                                            <div className="p-4 bg-white rounded-xl shadow-lg">
                                                <QRCodeSVG
                                                    value={activeToken.shareUrl}
                                                    size={200}
                                                    level="H"
                                                    includeMargin
                                                    imageSettings={{
                                                        src: "/logo-icon.png", // Assuming we have a logo, otherwise remove
                                                        x: undefined,
                                                        y: undefined,
                                                        height: 24,
                                                        width: 24,
                                                        excavate: true,
                                                    }}
                                                />
                                            </div>
                                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                                Scan to view trip on mobile
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Security Note */}
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm">
                                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>
                                        This link grants <strong>read-only</strong> access. Visitors can view the itinerary and map but cannot make changes. You can revoke this link at any time.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!activeToken && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-muted-foreground"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Share2 className="w-8 h-8 opacity-50" />
                            </div>
                            <p>Enable the public link to start sharing your adventure.</p>
                        </motion.div>
                    )}
                </div>
            </Card>
        </div>
    );
}
