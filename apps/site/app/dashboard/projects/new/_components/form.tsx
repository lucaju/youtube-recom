'use client';

import { Button } from '@/components/ui/button';
import Editor from '@/components/ui/editor/editor';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import MultipleSelector from '@/components/ui/multiple-selector';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RxReload } from 'react-icons/rx';
import { toast } from 'sonner';
import { z } from 'zod';
import { createProject } from './form-action';
import { ConfigSection } from './sections/config-section';
import { NotificationSection } from './sections/notification-section';
import { ScheduleSection } from './sections/schedule-section';

export const FormSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  keywords: z.array(z.string().min(3)).min(1),
  seeds: z.number().min(1).max(5),
  branches: z.number().min(1).max(5),
  depth: z.number().min(1).max(5),
  language: z
    .string()
    .length(5)
    .regex(/^[a-z]{2}-[A-Z]{2}$/)
    .or(z.literal(''))
    .optional(),
  country: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .or(z.literal(''))
    .optional(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
  time: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
    second: z.number().min(0).max(59).optional(),
    millisecond: z.number().min(0).max(999).optional(),
  }),
  timezone: z.string().optional(),
  notifyEmail: z.boolean(),
  notifyDiscordChannel: z.boolean(),
});

export const NewProjectForm = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const now = new Date();
  const time = {
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    millisecond: now.getMilliseconds(),
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      keywords: [],
      seeds: 2,
      branches: 2,
      depth: 2,
      language: '',
      country: '',
      frequency: 'once',
      time,
      timezone: '',
      notifyEmail: false,
      notifyDiscordChannel: true,
    },
  });

  const handleDiscard = () => {
    router.push('/dashboard/projects');
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsProcessing(true);
    const res = await createProject(data);
    setIsProcessing(false);

    if (res?.error) {
      toast.error(res?.error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-end justify-between px-4 py-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Title</FormLabel>
                <FormControl>
                  <Input autoComplete="title" className="w-96 text-lg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center space-x-4">
            <Button onClick={handleDiscard} variant="ghost">
              Discard
            </Button>
            <Button disabled={isProcessing} type="submit">
              {isProcessing && <RxReload className="mr-2 h-4 w-4 animate-spin" />}Create
            </Button>
          </div>
          <Separator className="my-2" />
        </div>
        <div className="grid min-h-[260px] grid-cols-3 gap-4 p-4">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Editor
                      className="h-36 overflow-auto"
                      content={field.value ?? ''}
                      name="description"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      creatable
                      maxSelected={5}
                      onChange={(value) => {
                        field.onChange(value.map((v) => v.value));
                      }}
                      value={field.value.map((value) => ({ label: value, value: value }))}
                    />
                  </FormControl>
                  <FormDescription>Max: 5</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 p-4 ">
          <ConfigSection />
          <ScheduleSection />
          <NotificationSection />
        </div>
      </form>
    </Form>
  );
};
