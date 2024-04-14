'use client';

import { serverApi } from '@/serverApi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { IoMdAdd } from 'react-icons/io';
import { RxReload } from 'react-icons/rx';
import { toast } from 'sonner';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().regex(/^(?=.*)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
  }),
});

export const AddUser = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.users.create({
      body: { ...data, role: 'user' },
      headers: { authorization: `Bearer ${session.user.token}` },
    });

    setIsProcessing(false);

    if (status === 401 || status === 409 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast(`Successfully created ${data.name}.`);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="h-8 w-8" onClick={() => setOpen(true)} size="icon" variant="secondary">
          <IoMdAdd />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <Form {...form}>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>

          <form className="grid gap-2 py-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                    <Input
                      autoComplete="name"
                      className="col-span-3"
                      placeholder="Name"
                      {...field}
                    />
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

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button disabled={isProcessing} onClick={() => setOpen(false)} variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isProcessing} type="submit">
                {isProcessing && <RxReload className="mr-2 h-4 w-4 animate-spin" />}Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
