import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Stratum Live</h1>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-50">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="font-heading text-5xl font-extrabold tracking-tight mb-6">
          Collaborative<br />
          <span className="text-zinc-500">Prompt Engineering</span>
        </h2>

        <p className="text-xl text-zinc-400 mb-12 max-w-lg">
          Edit prompts together in real-time. Test across models. Vote on the best. 
          Built for teams who iterate fast.
        </p>

        <div className="grid gap-4 mb-12">
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <h3 className="font-semibold mb-1">Real-time collaboration</h3>
            <p className="text-sm text-zinc-400">Edit with your team. See cursors. Every change saved.</p>
          </div>
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <h3 className="font-semibold mb-1">Parallel testing</h3>
            <p className="text-sm text-zinc-400">Run prompts across OpenAI, Anthropic, Ollama. Compare results.</p>
          </div>
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <h3 className="font-semibold mb-1">Version control + voting</h3>
            <p className="text-sm text-zinc-400">Branches, history, restore. Vote on prompts your team likes.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg">Start building</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="border-zinc-700 text-zinc-300">Log in</Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-sm text-zinc-500">
        BYOK • Bring your own keys
      </footer>
    </div>
  );
}