import { H1Motion, PMotion } from "@/components/typeography";
import { Button } from "@/components/ui/button";
import { animations } from "@/lib/animation/framer";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <div className="h-svh w-svw flex-center flex-col gap-4">
        <H1Motion variants={animations.fadeUp} initial="hidden" animate="show">
          Welcome to RePrompt
        </H1Motion>
        <PMotion variants={animations.fadeIn} initial="hidden" animate="show">
          AI-powered collaborative prompt engineering for developers
        </PMotion>
        <div className="flex gap-4">
          <Button variant="outline">Read More</Button>
          <Link href="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
