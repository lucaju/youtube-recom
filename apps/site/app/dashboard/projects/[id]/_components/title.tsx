'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardEventHandler } from 'react';
import { useForm } from 'react-hook-form';
import type { Project } from 'youtube-recommendation-crawler-api/types';
import { z } from 'zod';
import { useProject } from '../../hooks/useProject';

export const FormSchema = z.object({
  title: z.string().min(3),
});

interface Props {
  projectId: Project['id'];
  value?: Project['title'];
}

export const Title = ({ projectId, value }: Props) => {
  const { isProcessing, updateProject } = useProject();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: value },
  });

  const onSubmit = () => {
    const defaultValues = form.formState.defaultValues?.title;
    const correntValue = form.getValues('title');
    if (defaultValues === correntValue) return;

    updateProject(projectId, { title: correntValue });
  };

  const handleReset: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Escape') form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={isProcessing}
                  autoComplete="title"
                  className="w-96 border-0 text-lg font-bold shadow-inherit"
                  {...field}
                  onBlur={onSubmit}
                  onKeyUp={handleReset}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
