'use client';
import { serverApi } from '@/serverApi';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RxReload } from 'react-icons/rx';
import { toast } from 'sonner';
import { User } from 'youtube-recommendation-crawler-api/types';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(3).optional(),
  password: z
    .union([
      z.literal(''),
      z.string().regex(/^(?=.*)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
      }),
    ])
    .optional(),
});

type FormSchema = z.infer<typeof FormSchema>;

export const EditUser = ({ user }: { user: User }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!session) return;

    const dataToUpdate = { ...data };
    delete dataToUpdate.email;
    if (dataToUpdate.name === user.name) delete dataToUpdate.name;
    if (dataToUpdate.password === '') delete dataToUpdate.password;
    if (Object.keys(data).length === 0) return;

    setIsProcessing(true);
    const { status, body } = await serverApi.users.update({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id: user.id },
      body: dataToUpdate,
    });
    setIsProcessing(false);

    if (status === 400 || status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast('Successfully updated');
    router.refresh();
  };

  return (
    <div className="w-[400px]">
      <Form {...form}>
        <form className="grid gap-3 py-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center space-y-2">
                <FormLabel className="mr-2 text-right">Email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
                    className="col-span-3"
                    disabled={true}
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="col-span-4 text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center space-y-2">
                <FormLabel className="mr-2 text-right">Name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" className="col-span-3" placeholder="Name" {...field} />
                </FormControl>
                <FormMessage className="col-span-4 text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center space-y-2">
                <FormLabel className="mr-2 text-right">Password</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="current-password"
                    className="col-span-3"
                    placeholder="Password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="col-span-4 text-right" />
              </FormItem>
            )}
          />

          <Button className="mt-4 w-24 justify-self-end" disabled={isProcessing} type="submit">
            {isProcessing && <RxReload className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};
