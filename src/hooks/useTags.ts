/**
 * useTags Hook
 *
 * Hook for managing tag autocomplete and suggestions
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * Common tag suggestions for travel agents
 */
const COMMON_TAGS = [
  'VIP',
  'Corporate',
  'Honeymoon',
  'Family',
  'Group',
  'Luxury',
  'Budget',
  'Adventure',
  'Cruise',
  'Destination Wedding',
  'Repeat Customer',
  'High Priority',
];

/**
 * Hook to manage tags with autocomplete
 */
export function useTags(existingTags: string[] = []) {
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTags);

  // Update selected tags when existingTags prop changes
  useEffect(() => {
    setSelectedTags(existingTags);
  }, [existingTags]);

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!inputValue) return COMMON_TAGS;

    const input = inputValue.toLowerCase();
    return COMMON_TAGS.filter(
      (tag) =>
        tag.toLowerCase().includes(input) &&
        !selectedTags.includes(tag)
    );
  }, [inputValue, selectedTags]);

  // Add a tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setInputValue('');
    }
  };

  // Remove a tag
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // Clear all tags
  const clearTags = () => {
    setSelectedTags([]);
  };

  return {
    inputValue,
    setInputValue,
    selectedTags,
    setSelectedTags,
    suggestions,
    addTag,
    removeTag,
    clearTags,
  };
}

/**
 * Hook to fetch unique tags from all clients
 * This would typically fetch from the API, but for now returns common tags
 */
export function useAllTags() {
  // In a real implementation, this would fetch unique tags from the API
  // For now, return common tags
  return {
    data: COMMON_TAGS,
    isLoading: false,
    error: null,
  };
}
