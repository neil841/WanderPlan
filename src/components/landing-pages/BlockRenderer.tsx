/**
 * Block Renderer
 *
 * Renders landing page blocks for preview and public display
 */

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { LandingPageBlock } from '@/types/landing-page';

interface BlockRendererProps {
  block: LandingPageBlock;
  isPreview?: boolean;
}

export function BlockRenderer({ block, isPreview = false }: BlockRendererProps) {
  const renderBlock = () => {
    switch (block.type) {
      case 'hero':
        return <HeroBlock block={block} isPreview={isPreview} />;
      case 'text':
        return <TextBlock block={block} isPreview={isPreview} />;
      case 'features':
        return <FeaturesBlock block={block} isPreview={isPreview} />;
      case 'gallery':
        return <GalleryBlock block={block} isPreview={isPreview} />;
      case 'lead-capture':
        return <LeadCaptureBlock block={block} isPreview={isPreview} />;
      case 'pricing':
        return <PricingBlock block={block} isPreview={isPreview} />;
      default:
        return null;
    }
  };

  return renderBlock();
}

// Hero Block
function HeroBlock({ block, isPreview }: { block: LandingPageBlock; isPreview: boolean }) {
  const { title, subtitle, backgroundImage, ctaText, ctaUrl } = block.data;

  const containerClass = isPreview
    ? 'relative min-h-[300px] md:min-h-[400px]'
    : 'relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px]';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={containerClass}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 flex items-center justify-center h-full ${backgroundImage ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'}`}>
        <div className="container mx-auto px-6 text-center">
          {title && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              {title}
            </motion.h1>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
          {ctaText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {ctaUrl ? (
                <a
                  href={ctaUrl}
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  {ctaText}
                </a>
              ) : (
                <button className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                  {ctaText}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Text Block
function TextBlock({ block }: { block: LandingPageBlock; isPreview: boolean }) {
  const { content } = block.data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-12 md:py-16 bg-white dark:bg-neutral-900"
    >
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {content ? (
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            <p className="text-neutral-400 italic">No content yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Features Block (Placeholder)
function FeaturesBlock({ block }: { block: LandingPageBlock; isPreview: boolean }) {
  const { items = [] } = block.data;

  return (
    <div className="py-12 md:py-16 bg-neutral-50 dark:bg-neutral-800/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.length > 0 ? (
            items.map((item: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{item.icon || '✨'}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{item.description}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-neutral-400 italic">
              No features added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Gallery Block (Placeholder)
function GalleryBlock({ block }: { block: LandingPageBlock; isPreview: boolean }) {
  const { images = [] } = block.data;

  return (
    <div className="py-12 md:py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.length > 0 ? (
            images.map((image: any, index: number) => (
              <div key={index} className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
                {image.url && (
                  <img
                    src={image.url}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {image.caption && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {image.caption}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-neutral-400 italic py-12">
              No images added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Lead Capture Block (Placeholder)
function LeadCaptureBlock({ block }: { block: LandingPageBlock; isPreview: boolean }) {
  const { title, subtitle, submitText = 'Submit' } = block.data;

  return (
    <div className="py-12 md:py-16 bg-primary-50 dark:bg-primary-900/10">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-8">
          {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
          {subtitle && <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-8 shadow-lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                disabled
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg"
              />
              <input
                type="text"
                placeholder="Last Name"
                disabled
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              disabled
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg"
            />
            <button
              disabled
              className="w-full bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg"
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pricing Block (Placeholder)
function PricingBlock({ block }: { block: LandingPageBlock; isPreview: boolean }) {
  const { plans = [] } = block.data;

  return (
    <div className="py-12 md:py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.length > 0 ? (
            plans.map((plan: any, index: number) => (
              <div
                key={index}
                className={`border rounded-lg p-6 ${
                  plan.highlighted
                    ? 'border-primary-600 ring-2 ring-primary-600'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">
                  {plan.currency} {plan.price}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features?.map((feature: string, fIndex: number) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg">
                  Select Plan
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-neutral-400 italic">
              No pricing plans added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
