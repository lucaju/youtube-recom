'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useFormContext } from 'react-hook-form';

export const ConfigSection = () => {
  const form = useFormContext(); // retrieve all hook methods

  return (
    <div className="prose dark:prose-invert flex flex-col space-y-4">
      <h3>Crawler Config</h3>
      <FormField
        control={form.control}
        name="seeds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Seeds</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Slider
                  name="seeds"
                  min={1}
                  max={5}
                  onValueChange={(value) => field.onChange(value[0])}
                  step={1}
                  value={[field.value]}
                />
                <Input className="w-[4ch]" min={1} max={5} {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="branches"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branches</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Slider
                  name="branches"
                  min={1}
                  max={5}
                  onValueChange={(value) => field.onChange(value[0])}
                  step={1}
                  value={[field.value]}
                />
                <Input className="w-[4ch]" min={1} max={5} {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="depth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Depth</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Slider
                  name="depth"
                  min={1}
                  max={5}
                  onValueChange={(value) => field.onChange(value[0])}
                  step={1}
                  value={[field.value]}
                />
                <Input className="w-[4ch]" min={1} max={5} {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
      <div className="flex items-center space-x-16">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Input
                  autoComplete="language"
                  className="w-[8ch] text-center"
                  maxLength={5}
                  placeholder="-----"
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input
                  autoComplete="country"
                  className="w-[6ch] text-center"
                  maxLength={2}
                  placeholder="--"
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
