import { TypographyH1, TypographyP } from '@/components/ui/typography';
// import styles from './page.module.css';

export default function NotFound() {
  return (
    <main className="flex h-3/4 min-h-screen flex-col items-center justify-center">
      <div className="relative flex flex-col place-items-center space-y-6">
        <div className="flext max-w-1m space-y-6">
          <TypographyH1>Not Found</TypographyH1>
          <TypographyP>Could not find requested resource</TypographyP>
        </div>
      </div>
    </main>
  );
}
