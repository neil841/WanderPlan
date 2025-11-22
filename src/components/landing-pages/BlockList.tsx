/**
 * Block List
 *
 * Draggable list of content blocks
 */

'use client';

import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Edit, Trash2, Image, Type, Grid3x3, ImageIcon, Mail, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { LandingPageBlock } from '@/types/landing-page';

interface BlockListProps {
  blocks: LandingPageBlock[];
  onEdit: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onReorder: (reorderedBlocks: LandingPageBlock[]) => void;
}

// Block type icons and labels
const blockTypeConfig = {
  hero: { icon: Image, label: 'Hero' },
  text: { icon: Type, label: 'Text' },
  features: { icon: Grid3x3, label: 'Features' },
  gallery: { icon: ImageIcon, label: 'Gallery' },
  'lead-capture': { icon: Mail, label: 'Lead Capture' },
  pricing: { icon: DollarSign, label: 'Pricing' },
};

function BlockItem({
  block,
  onEdit,
  onDelete,
}: {
  block: LandingPageBlock;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  const config = blockTypeConfig[block.type];
  const Icon = config?.icon || Type;

  // Get preview text from block data
  const getPreviewText = (): string => {
    switch (block.type) {
      case 'hero':
        return block.data.title || 'Untitled Hero';
      case 'text':
        return block.data.content ? 'Text content' : 'Empty text block';
      case 'features':
        return block.data.items?.length
          ? `${block.data.items.length} features`
          : 'No features';
      case 'gallery':
        return block.data.images?.length
          ? `${block.data.images.length} images`
          : 'No images';
      case 'lead-capture':
        return block.data.title || 'Lead Capture Form';
      case 'pricing':
        return block.data.plans?.length
          ? `${block.data.plans.length} plans`
          : 'No plans';
      default:
        return 'Block';
    }
  };

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={dragControls}
      className="group"
    >
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
        {/* Drag Handle */}
        <button
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Block Icon and Info */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {config?.label || 'Block'}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {getPreviewText()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label="Edit block"
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label="Delete block"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function BlockList({ blocks, onEdit, onDelete, onReorder }: BlockListProps) {
  return (
    <Reorder.Group
      axis="y"
      values={blocks}
      onReorder={onReorder}
      className="space-y-2"
    >
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          onEdit={() => onEdit(block.id)}
          onDelete={() => onDelete(block.id)}
        />
      ))}
    </Reorder.Group>
  );
}
