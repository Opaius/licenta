import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Stratum Live</h1>
        <div className="flex gap-3">
          <Link href="/auth" className={buttonVariants({ variant: "ghost" })}>
            Log in
          </Link>
          <Link href="/auth" className={buttonVariants({ variant: "default" })}>
            Get started
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="font-heading text-5xl font-extrabold tracking-tight mb-6">
          Collaborative<br />
          <span className="text-muted-foreground">Prompt Engineering</span>
        </h2>

        <p className="text-xl text-muted-foreground mb-12 max-w-lg">
          Edit prompts together in real-time. Test across models. Vote on the best. 
          Built for teams who iterate fast.
        </p>

        <div className="grid gap-4 mb-12">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold mb-1">Real-time collaboration</h3>
            <p className="text-sm text-muted-foreground">Edit with your team. See cursors. Every change saved.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold mb-1">Parallel testing</h3>
            <p className="text-sm text-muted-foreground">Run prompts across OpenAI, Anthropic, Ollama. Compare results.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold mb-1">Version control + voting</h3>
            <p className="text-sm text-muted-foreground">Branches, history, restore. Vote on prompts your team likes.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/auth" className={buttonVariants({ size: "lg" })}>
            Start building
          </Link>
          <Link href="/auth" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Log in
          </Link>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        BYOK • Bring your own keys
      </footer>
    </div>
  );
}