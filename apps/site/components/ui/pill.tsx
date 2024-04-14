import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props extends BadgeProps {
  value?: React.ReactNode;
  valueProp?: BadgeProps;
}

export const Pill = ({ className, children, value, valueProp, ...props }: Props) => {
  return (
    <Badge
      className={cn(
        'w-full justify-between space-x-2 bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300',
        className,
      )}
      {...props}
    >
      {children}
      {value && (
        <Badge variant="secondary" {...valueProp}>
          {value}
        </Badge>
      )}
    </Badge>
  );
};
