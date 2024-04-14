import { cn } from '@/lib/utils';

export function TypographyH1({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 font-sans text-4xl font-extrabold tracking-tight antialiased lg:text-5xl',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function TypographyH2({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 pb-2 font-sans text-3xl font-semibold tracking-tight antialiased first:mt-0',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function TypographyH3({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'scroll-m-20 font-sans text-2xl font-semibold tracking-tight antialiased',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function TypographyH4({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <h4
      className={cn(
        'scroll-m-20 font-sans text-xl font-semibold tracking-tight antialiased',
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

export function TypographyP({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLParagraphElement>) {
  return (
    <p
      className={cn('font-sans leading-7 antialiased [&:not(:first-child)]:mt-6', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function TypographyBlockquote({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn('mt-6 border-l-2 pl-6 font-sans italic antialiased', className)}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function TypographyInlineCode({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLModElement>) {
  return (
    <code
      className={cn(
        'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function TypographyLead({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLParagraphElement>) {
  return (
    <p className={cn('text-muted-foreground font-sans text-xl antialiased', className)} {...props}>
      {children}
    </p>
  );
}

export function TypographyLarge({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLDivElement>) {
  return (
    <div className={cn('font-sans text-lg font-semibold antialiased', className)} {...props}>
      ({children}
    </div>
  );
}

export function TypographySmall({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLSpanElement>) {
  return (
    <small
      className={cn('font-sans text-sm font-medium leading-none antialiased', className)}
      {...props}
    >
      {children}
    </small>
  );
}

export function TypographyMuted({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLParagraphElement>) {
  return (
    <p className={cn('text-muted-foreground font-sans text-sm antialiased', className)} {...props}>
      {children}
    </p>
  );
}
