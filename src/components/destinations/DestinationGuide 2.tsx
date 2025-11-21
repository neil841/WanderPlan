/**
 * Destination Guide Component
 *
 * Displays comprehensive destination information including:
 * - Overview from Wikipedia
 * - Best time to visit
 * - Budget tips
 * - Link to full Wikipedia article
 */

'use client';

import { ExternalLink, MapPin, Calendar, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DestinationGuide as DestinationGuideType } from '@/lib/destinations/wikipedia';
import Image from 'next/image';

interface DestinationGuideProps {
  guide: DestinationGuideType;
  onSaveToTrip?: () => void;
  isSaving?: boolean;
}

export function DestinationGuide({
  guide,
  onSaveToTrip,
  isSaving,
}: DestinationGuideProps) {
  return (
    <div className="space-y-8">
      {/* Header with image */}
      <div className="relative">
        {guide.imageUrl && (
          <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden mb-6">
            <Image
              src={guide.imageUrl}
              alt={guide.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {guide.name}
              </h1>
              <p className="text-lg text-gray-200">{guide.description}</p>
            </div>
          </div>
        )}

        {!guide.imageUrl && (
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {guide.name}
            </h1>
            <p className="text-lg text-gray-600">{guide.description}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {onSaveToTrip && (
            <Button onClick={onSaveToTrip} disabled={isSaving} size="lg">
              <MapPin className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Add to Trip'}
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open(guide.wikiUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Wikipedia
          </Button>
        </div>
      </div>

      {/* Overview section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        </div>
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed">{guide.overview}</p>
        </div>
      </section>

      {/* Best time to visit */}
      {guide.bestTimeToVisit && (
        <section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Best Time to Visit
            </h2>
          </div>
          <p className="text-gray-700">{guide.bestTimeToVisit}</p>
        </section>
      )}

      {/* Budget tips */}
      {guide.budgetTips && guide.budgetTips.length > 0 && (
        <section className="bg-green-50 rounded-lg p-6 border border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Budget Tips</h2>
          </div>
          <ul className="space-y-2">
            {guide.budgetTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Coordinates info */}
      {guide.coordinates && (
        <section className="text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              Coordinates: {guide.coordinates.lat.toFixed(4)},{' '}
              {guide.coordinates.lon.toFixed(4)}
            </span>
          </div>
        </section>
      )}

      {/* Attribution */}
      <section className="text-xs text-gray-500 border-t pt-4">
        <p>
          Content sourced from{' '}
          <a
            href={guide.wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Wikipedia
          </a>
          . Licensed under{' '}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            CC BY-SA 3.0
          </a>
          .
        </p>
      </section>
    </div>
  );
}
