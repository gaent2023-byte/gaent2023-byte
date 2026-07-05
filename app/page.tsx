import Link from 'next/link';
import { Scale, ShieldCheck, Globe2, TrendingDown, FileText, Sparkles, ArrowRight, Building2, BarChart3, Check } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">GSOR</p>
              <p className="text-[10px] text-muted-foreground">Risk Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="rounded-md px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-info/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Supplier Risk Intelligence
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Global Supplier Opinion
              <span className="block text-primary">Report &amp; Risk Platform</span>
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground sm:text-xl">
              Search, verify, assess, and generate professional Supplier Opinion Reports with
              AI-assisted analysis across millions of suppliers worldwide.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg sm:w-auto"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signin"
                className="inline-flex w-full items-center justify-center rounded-lg border bg-card px-6 py-3 text-base font-semibold text-foreground transition-all hover:bg-muted sm:w-auto"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Risk Dimensions', value: '11' },
              { label: 'Rating Bands', value: 'AAA–CCC' },
              { label: 'Report Sections', value: '22' },
              { label: 'User Roles', value: '8' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-5 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Everything you need to assess suppliers</h2>
            <p className="mt-3 text-muted-foreground">A complete platform for supplier due diligence and risk intelligence.</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Building2, title: 'Supplier Master Database', desc: 'Comprehensive profiles with contact info, key personnel, business details, and ownership across all countries and industries.' },
              { icon: FileText, title: 'Opinion Report Generator', desc: 'Auto-generate 22-section Supplier Opinion Reports with executive summaries, financial analysis, risk assessment, and AI opinions.' },
              { icon: ShieldCheck, title: 'Risk Management Engine', desc: '11-dimensional risk scoring (financial, operational, compliance, fraud, ESG, and more) with AAA–CCC ratings and severity indicators.' },
              { icon: Sparkles, title: 'AI Intelligence Module', desc: 'AI-generated summaries, default probability predictions, fraud detection, credit limit recommendations, and peer comparisons.' },
              { icon: BarChart3, title: 'Executive Dashboard', desc: 'KPI cards, growth trends, industry and country analysis, risk distribution charts, and real-time AI alerts.' },
              { icon: Globe2, title: 'Multi-Country Search', desc: 'Full-text and fuzzy search across company names, registration numbers, GST, PAN, directors, and 14+ fields.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Built for financial institutions &amp; corporates</h2>
              <p className="mt-4 text-muted-foreground">
                GSOR serves banks, NBFCs, procurement companies, exporters, importers, insurance
                companies, auditors, and large corporate buyers who need reliable supplier assessments.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Role-based access control with 8 user roles',
                  'Multi-tenant architecture with organization isolation',
                  'Secure file uploads with signed URLs',
                  'Audit logs for all sensitive actions',
                  'QR-code report verification system',
                  'Export to PDF, Word, Excel, and HTML',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Risk Assessment Preview</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Apex Manufacturing', rating: 'AAA', score: 27, color: 'bg-success' },
                  { name: 'TechSphere Solutions', rating: 'AAA', score: 20, color: 'bg-success' },
                  { name: 'Eastern Textiles', rating: 'BBB', score: 47, color: 'bg-warning' },
                  { name: 'Golden Gate Retail', rating: 'BBB', score: 53, color: 'bg-warning' },
                  { name: 'Pacific Steel Works', rating: 'B', score: 73, color: 'bg-destructive' },
                ].map((r) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="w-40 truncate text-sm font-medium text-foreground">{r.name}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.score}%` }} />
                      </div>
                    </div>
                    <span className="w-12 rounded border border-border px-1.5 py-0.5 text-center text-xs font-bold text-foreground">{r.rating}</span>
                    <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{r.score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                Overall risk score (0–100) • Lower is better
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">Ready to assess your suppliers?</h2>
          <p className="mt-3 text-primary-foreground/80">Create your free GSOR workspace and start generating Supplier Opinion Reports today.</p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary-foreground px-6 py-3 text-base font-semibold text-primary transition-all hover:bg-primary-foreground/90"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-foreground">GSOR</span>
          </div>
          <p className="text-xs text-muted-foreground">Global Supplier Opinion Report &amp; Risk Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}
