import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialog as Dialog,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { PropsWithChildren } from 'react';
import { RxReload } from 'react-icons/rx';

interface Props extends PropsWithChildren {
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title?: string;
}

export function AlertDialog({ children, isProcessing, onCancel, onConfirm, open, title }: Props) {
  return (
    <Dialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{children}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing} onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <Button disabled={isProcessing} onClick={onConfirm} variant="destructive">
            {isProcessing && <RxReload className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </Dialog>
  );
}
