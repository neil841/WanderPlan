/**
 * Landing Page Editor
 *
 * Block-based editor with live preview for landing pages
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useLandingPage, useUpdateLandingPage } from '@/hooks/useLandingPages';
import { BlockList } from '@/components/landing-pages/BlockList';
import { BlockEditorDialog } from '@/components/landing-pages/BlockEditorDialog';
import { AddBlockDropdown } from '@/components/landing-pages/AddBlockDropdown';
import { BlockRenderer } from '@/components/landing-pages/BlockRenderer';
import type { LandingPageBlock, LandingPageBlockType } from '@/types/landing-page';

interface LandingPageEditorProps {
  params: {
    slug: string;
  };
}

export default function LandingPageEditor({ params }: LandingPageEditorProps) {
  const router = useRouter();
  const { slug } = params;

  // Fetch landing page data
  const { data: landingPage, isLoading, error } = useLandingPage(slug);
  const updateMutation = useUpdateLandingPage(slug);

  // Local state for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<LandingPageBlock[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Block editor dialog state
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingBlockType, setEditingBlockType] = useState<LandingPageBlockType | null>(null);

  // Initialize local state when data loads
  useState(() => {
    if (landingPage) {
      setTitle(landingPage.title);
      setDescription(landingPage.description || '');
      setBlocks(landingPage.content.blocks);
      setIsPublished(landingPage.isPublished);
    }
  });

  // Handle save
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        title,
        description: description || undefined,
        content: { blocks },
        isPublished,
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  // Handle add block
  const handleAddBlock = (type: LandingPageBlockType) => {
    const newBlock: LandingPageBlock = {
      id: `block-${Date.now()}`,
      type,
      data: {},
    };

    setBlocks([...blocks, newBlock]);
    setHasChanges(true);

    // Open editor for new block
    setEditingBlockId(newBlock.id);
    setEditingBlockType(type);
  };

  // Handle edit block
  const handleEditBlock = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      setEditingBlockId(blockId);
      setEditingBlockType(block.type);
    }
  };

  // Handle delete block
  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
    setHasChanges(true);
  };

  // Handle save block
  const handleSaveBlock = (updatedBlock: LandingPageBlock) => {
    setBlocks(blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    setHasChanges(true);
    setEditingBlockId(null);
    setEditingBlockType(null);
  };

  // Handle reorder blocks (drag and drop)
  const handleReorderBlocks = (reorderedBlocks: LandingPageBlock[]) => {
    setBlocks(reorderedBlocks);
    setHasChanges(true);
  };

  // Handle field changes
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setHasChanges(true);
  };

  const handlePublishToggle = (value: boolean) => {
    setIsPublished(value);
    setHasChanges(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-2/5 p-6 border-r border-neutral-200 dark:border-neutral-800">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-16 w-full mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !landingPage) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load landing page. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/crm/landing-pages')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Landing Pages
        </Button>
      </div>
    );
  }

  const editingBlock = editingBlockId ? blocks.find((b) => b.id === editingBlockId) : null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Editor Panel (Left) */}
      <div className="w-full lg:w-2/5 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/crm/landing-pages')}
              aria-label="Back to landing pages"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate">{title || 'Untitled'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {hasChanges ? 'Save' : 'Saved'}
                </>
              )}
            </Button>
            {isPublished && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Page Settings */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Page Settings
              </h2>
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter page title..."
                  />
                </div>

                {/* Slug (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                      /p/
                    </span>
                    <Input
                      id="slug"
                      type="text"
                      value={slug}
                      readOnly
                      disabled
                      className="pl-10 font-mono text-sm bg-neutral-50 dark:bg-neutral-800"
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    Slug cannot be changed after creation
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Brief description for SEO..."
                    rows={3}
                  />
                </div>

                {/* Published Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="published" className="text-sm font-medium">
                      Published
                    </Label>
                    <p className="text-xs text-neutral-500 mt-1">
                      Make this page publicly accessible
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={handlePublishToggle}
                  />
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Blocks Section */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Content Blocks
                </h2>
                <AddBlockDropdown onAddBlock={handleAddBlock} />
              </div>

              {/* Block List */}
              {blocks.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    No blocks yet. Add your first block to get started.
                  </p>
                  <AddBlockDropdown onAddBlock={handleAddBlock} trigger="button" />
                </div>
              ) : (
                <BlockList
                  blocks={blocks}
                  onEdit={handleEditBlock}
                  onDelete={handleDeleteBlock}
                  onReorder={handleReorderBlocks}
                />
              )}
            </motion.div>
          </div>
        </ScrollArea>
      </div>

      {/* Live Preview Panel (Right) - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-900/50">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            Live Preview
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6">
            {blocks.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-neutral-400">
                <p>Add blocks to see preview</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-0">
                {blocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} isPreview />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Block Editor Dialog */}
      {editingBlock && editingBlockType && (
        <BlockEditorDialog
          open={!!editingBlockId}
          onOpenChange={(open) => {
            if (!open) {
              setEditingBlockId(null);
              setEditingBlockType(null);
            }
          }}
          block={editingBlock}
          blockType={editingBlockType}
          onSave={handleSaveBlock}
        />
      )}
    </div>
  );
}
