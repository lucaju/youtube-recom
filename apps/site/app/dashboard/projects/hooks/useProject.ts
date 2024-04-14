import { serverApi } from '@/serverApi';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Project } from 'youtube-recommendation-crawler-api/types';

export const useProject = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [alertOpen, setAlertOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const deleteProject = async (id: string) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.projects.delete({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id },
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

  const activateProject = async (id: string) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.projects.activate({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id },
    });

    setIsProcessing(false);

    if (status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast(body.message);
    router.refresh();
  };

  const deactivateProject = async (id: string) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.projects.deactivate({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id },
    });

    setIsProcessing(false);

    if (status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast(body.message);
    router.refresh();
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.projects.update({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id },
      body: project,
    });

    setIsProcessing(false);

    if (status === 400 || status === 401 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast('Successfully updated');
    router.refresh();
  };

  const getData = async (id: string) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.projects.get({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id },
      query: { results: 'true' },
    });

    setIsProcessing(false);

    if (status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    toast('Data is ready');
    return body;
  };

  const getResults = async (id: string) => {
    if (!session) return;

    setIsProcessing(true);

    const { status, body } = await serverApi.projects.results.getAll({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id },
    });

    setIsProcessing(false);

    if (status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    return body;
  };

  const getResult = async (
    projectId: string,
    resultId: string,
    options: { limit_videos?: number } = {},
  ) => {
    if (!session) return;

    setIsProcessing(true);

    const limit_videos = options.limit_videos?.toString() ?? undefined;

    const { status, body } = await serverApi.projects.results.get({
      headers: { authorization: `Bearer ${session.user.token}` },
      params: { id: projectId, resultid: resultId },
      query: { limit_videos },
    });

    setIsProcessing(false);

    if (status === 401 || status === 404 || status === 500) {
      toast.warning(body.message);
      return;
    }

    return body;
  };

  return {
    activateProject,
    alertOpen,
    deactivateProject,
    deleteProject,
    getData,
    getResults,
    getResult,
    isProcessing,
    setAlertOpen,
    updateProject,
  };
};
