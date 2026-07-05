import { Scale, ShieldCheck, Globe2, TrendingDown } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 lg:flex">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5 text-primary-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold">GSOR</p>
            <p className="text-xs text-primary-foreground/70">Global Supplier Opinion Report</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md text-primary-foreground">
          <h2 className="text-2xl font-semibold leading-tight text-balance">
            Supplier risk intelligence for banks, institutions & corporates
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/80">
            Search, verify, assess, and generate professional Supplier Opinion Reports with
            AI-assisted analysis across millions of suppliers worldwide.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, text: 'Comprehensive risk scoring across 11 dimensions' },
              { icon: Globe2, text: 'Multi-country supplier database with full-text search' },
              { icon: TrendingDown, text: 'AI-driven default probability & fraud detection' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="pt-1 text-sm text-primary-foreground/90">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          Enterprise-grade • Multi-tenant • SOC 2 ready
        </p>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
