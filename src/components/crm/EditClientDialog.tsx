/**
 * Edit Client Dialog Component
 *
 * Modal form for updating existing client information
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { updateClientSchema } from '@/lib/validations/crm';
import { useUpdateClient } from '@/hooks/useClients';
import { useTags } from '@/hooks/useTags';
import type { UpdateClientRequest, Client } from '@/types/crm';

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onSuccess?: (client: Client) => void;
}

const COMMON_SOURCES = [
  'Referral',
  'Website',
  'Social Media',
  'Email Campaign',
  'Event',
  'Advertisement',
];

export function EditClientDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: EditClientDialogProps) {
  const updateMutation = useUpdateClient();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const [tagsOpen, setTagsOpen] = useState(false);

  const {
    inputValue,
    setInputValue,
    selectedTags,
    suggestions,
    addTag,
    removeTag,
  } = useTags(client.tags);

  const form = useForm<UpdateClientRequest>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || '',
      status: client.status,
      source: client.source || '',
      tags: client.tags,
      notes: client.notes || '',
    },
  });

  // Sync tags with form
  useEffect(() => {
    form.setValue('tags', selectedTags);
  }, [selectedTags, form]);

  // Focus first input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        firstNameRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const onSubmit = async (data: UpdateClientRequest) => {
    try {
      const result = await updateMutation.mutateAsync({
        id: client.id,
        data,
      });
      onOpenChange(false);
      if (onSuccess && result.client) {
        onSuccess(result.client);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    if (form.formState.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        form.reset();
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const notesValue = form.watch('notes');
  const notesLength = notesValue?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full h-full max-w-full max-h-full p-4 md:w-auto md:h-auto md:max-w-2xl md:max-h-[90vh] md:p-6 md:rounded-lg lg:max-w-3xl lg:p-8 overflow-y-auto"
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Client</DialogTitle>
          <DialogDescription>
            Last updated: {format(new Date(client.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="firstName">First Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="firstName"
                      ref={firstNameRef}
                      maxLength={50}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="lastName">Last Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="lastName"
                      maxLength={50}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      maxLength={255}
                      aria-required="true"
                      aria-describedby="email-description"
                    />
                  </FormControl>
                  <FormDescription id="email-description" className="flex items-center gap-1">
                    <Info className="h-3 w-3" aria-hidden="true" />
                    This email will be checked for duplicates
                  </FormDescription>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="phone">Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      maxLength={20}
                      placeholder="+1 (555) 123-4567"
                    />
                  </FormControl>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="status">Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="status" aria-label="Client status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LEAD">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          LEAD
                        </span>
                      </SelectItem>
                      <SelectItem value="ACTIVE">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          ACTIVE
                        </span>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-gray-400" />
                          INACTIVE
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            {/* Source */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="source">Source</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        {...field}
                        id="source"
                        maxLength={100}
                        list="source-suggestions"
                        placeholder="How did they find you?"
                      />
                      <datalist id="source-suggestions">
                        {COMMON_SOURCES.map((source) => (
                          <option key={source} value={source} />
                        ))}
                      </datalist>
                    </div>
                  </FormControl>
                  <FormDescription className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" aria-hidden="true" />
                    Common: {COMMON_SOURCES.slice(0, 3).join(', ')}
                  </FormDescription>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={tagsOpen}
                            className="w-full justify-between"
                          >
                            {selectedTags.length > 0
                              ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                              : 'Select tags or create new...'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search or create tag..."
                              value={inputValue}
                              onValueChange={setInputValue}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && inputValue) {
                                  e.preventDefault();
                                  addTag(inputValue);
                                }
                              }}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="p-2 text-sm">
                                  Press Enter to create &quot;{inputValue}&quot;
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {suggestions.map((tag) => (
                                  <CommandItem
                                    key={tag}
                                    value={tag}
                                    onSelect={() => addTag(tag)}
                                  >
                                    {tag}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Selected tags */}
                      {selectedTags.length > 0 && (
                        <motion.div
                          className="flex flex-wrap gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <AnimatePresence mode="popLayout">
                            {selectedTags.map((tag) => (
                              <motion.div
                                key={tag}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                layout
                              >
                                <Badge
                                  variant="secondary"
                                  className="gap-1"
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 hover:text-destructive"
                                    aria-label={`Remove ${tag} tag`}
                                  >
                                    <X className="h-3 w-3" aria-hidden="true" />
                                  </button>
                                </Badge>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="notes">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="notes"
                      placeholder="Add any additional notes about this client..."
                      maxLength={1000}
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{notesLength}/1000 characters</span>
                  </div>
                  <FormMessage role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
