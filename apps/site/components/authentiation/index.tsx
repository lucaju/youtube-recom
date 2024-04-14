'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoMdFingerPrint } from 'react-icons/io';
import { RxReload } from 'react-icons/rx';
import { z } from 'zod';
import { PasswordInput } from '../ui/password-input';
import { TypographyMuted } from '../ui/typography';

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

export default function Authentication() {
  const router = useRouter();

  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setError('');
    setIsProcessing(true);

    const response = await signIn('credentials', { redirect: false, ...data });
   
    if (response?.error === 'CredentialsSignin') {
      setError('Email or password is incorrect');
      setIsProcessing(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="h-48">
      <Card className="w-[400px]">
        <CardContent className="p-6">
          <Form {...form}>
            <form className="grid w-full items-center gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                disabled={isProcessing}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormControl>
                      <Input autoComplete="username" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                disabled={isProcessing}
                name="password"
                render={({ field }) => (
                  <div className="flex space-x-2">
                    <FormItem className="w-full">
                      <FormControl>
                        {/* <Input
                          autoComplete="current-password"
                          placeholder="Password"
                          type="password"
                          {...field}
                        /> */}
                        <PasswordInput
                          autoComplete="current-password"
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <Button
                      className="w-11"
                      disabled={isProcessing}
                      size="icon"
                      type="submit"
                      variant="secondary"
                    >
                      {isProcessing ? (
                        <RxReload className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <IoMdFingerPrint className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              />
              {error && (
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                >
                  <TypographyMuted className="text-destructive">{error}</TypographyMuted>
                </motion.div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
