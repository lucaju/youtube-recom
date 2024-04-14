'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { IoMdAdd } from 'react-icons/io';

export const AddPoject = () => {
  const { push } = useRouter();
  return (
    <Button
      className="h-8 w-8"
      onClick={() => push('/dashboard/projects/ew')}
      size="icon"
      variant="secondary"
    >
      <IoMdAdd />
    </Button>
  );
};
