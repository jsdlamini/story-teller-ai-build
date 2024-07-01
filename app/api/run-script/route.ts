import { NextRequest } from "next/server";

import { RunOpts, RunEventType } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";

const script = "app/api/run-script/story-book.gpt";

export async function POST(request: NextRequest) {
  const { story, pages, path } = await request.json();

  const opts: RunOpts = {
    disableCache: true,
    input: `--story ${story} --pages ${pages} --path ${path}`,
  };

  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const run = await g.run(script, opts);
          run.on(RunEventType.Event, (data) => {
            controller.enqueue(
              encoder.encode(`even:${JSON.stringify(data)}\n\n`)
            );
          });
        } catch (error) {
          controller.error(error);
          console.error("Error", error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    });
  }
}
