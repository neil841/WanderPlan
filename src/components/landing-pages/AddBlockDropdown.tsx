/**
 * Add Block Dropdown
 *
 * Dropdown menu for selecting which block type to add
 */

'use client';

import { Plus, Image, Type, Grid3x3, ImageIcon, Mail, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { LandingPageBlockType } from '@/types/landing-page';

interface AddBlockDropdownProps {
  onAddBlock: (type: LandingPageBlockType) => void;
  trigger?: 'icon' | 'button';
}

const blockTypes: Array<{
  type: LandingPageBlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Large header with image and CTA',
    icon: <Image className="w-4 h-4" />,
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Rich text content',
    icon: <Type className="w-4 h-4" />,
  },
  {
    type: 'features',
    label: 'Features',
    description: 'Icon grid with descriptions',
    icon: <Grid3x3 className="w-4 h-4" />,
  },
  {
    type: 'gallery',
    label: 'Gallery',
    description: 'Image gallery',
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    type: 'lead-capture',
    label: 'Lead Capture',
    description: 'Contact form',
    icon: <Mail className="w-4 h-4" />,
  },
  {
    type: 'pricing',
    label: 'Pricing',
    description: 'Pricing table',
    icon: <DollarSign className="w-4 h-4" />,
  },
];

export function AddBlockDropdown({ onAddBlock, trigger = 'icon' }: AddBlockDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger === 'icon' ? (
          <Button variant="outline" size="sm" aria-label="Add block">
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        ) : (
          <Button size="default" aria-label="Add first block">
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Choose a block type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {blockTypes.map((blockType) => (
          <DropdownMenuItem
            key={blockType.type}
            onClick={() => onAddBlock(blockType.type)}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-neutral-600 dark:text-neutral-400">
                {blockType.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{blockType.label}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {blockType.description}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
