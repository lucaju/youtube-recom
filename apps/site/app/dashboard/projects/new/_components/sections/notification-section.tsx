'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';

export const NotificationSection = () => {
  const form = useFormContext(); // retrieve all hook methods

  return (
    <div className="prose dark:prose-invert flex flex-col space-y-4">
      <h3>Notification</h3>
      <FormField
        control={form.control}
        name="notifyEmail"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Notify by email</FormLabel>
              <FormDescription>Every time the scrapper runs for each keyword.</FormDescription>
            </div>
            <FormControl>
              <Switch name="notifyEmail" checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="notifyDiscordChannel"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Notify Discord Channel</FormLabel>
              <FormDescription>
                Our Discord bot will post a summary of the results every time the scraper runs for
                each keyword.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                name="notifyDiscordChannel"
                checked={field.value}
                disabled
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
