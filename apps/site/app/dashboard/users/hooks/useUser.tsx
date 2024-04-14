import { serverApi } from '@/serverApi';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { User, UserRole } from 'youtube-recommendation-crawler-api/types';

export const useUser = (user: User) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [hover, setHover] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const deleteUser = async () => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.users.delete({
      params: { id: user.id },
      headers: { authorization: `Bearer ${session.user.token}` },
    });

    setIsProcessing(false);
    setAlertOpen(false);

    if (status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast(body.message);
    router.refresh();
  };

  const changeRole = async (role: UserRole) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.users.update({
      params: { id: user.id },
      body: { role },
      headers: { authorization: `Bearer ${session.user.token}` },
    });

    setIsProcessing(false);

    if (status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast(`Successfully changed ${user.name}'s role to ${role}.`);
    router.refresh();
  };

  return {
    alertOpen,
    changeRole,
    deleteUser,
    hover,
    isProcessing,
    setAlertOpen,
    setHover,
  };
};
