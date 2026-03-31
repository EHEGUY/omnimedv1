export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              OmniMed AI
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Local Multimodal Reasoning Engine
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
