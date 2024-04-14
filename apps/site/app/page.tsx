import Authentication from '@/components/authentiation';
// import { ModeToggle } from '@/components/ui/themeToggle';
import { TypographyH1, TypographyH2 } from '@/components/ui/typography';
import { LuGitCompare } from 'react-icons/lu';

export default function Home() {
  return (
    <main className="flex h-3/4 min-h-screen flex-col items-center justify-center">
      <div className="relative flex flex-col place-items-center space-y-6">
        <div className="flext max-w-1m space-y-6">
          <TypographyH1>
            YouTube
            <br />
            Recommendation
            {/* <ModeToggle /> */}
          </TypographyH1>
          <div className="flex items-center space-x-2">
            <LuGitCompare className="mb-2 h-8 w-8" />
            <TypographyH2>Algo Observer</TypographyH2>
          </div>
        </div>
        <Authentication />
      </div>
    </main>
  );
}
