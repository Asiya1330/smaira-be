/**
 * Ambient types for editors that run the TypeScript language service instead of the Deno LSP.
 * Deno CLI uses compilerOptions.lib in deno.json; this file is excluded from Deno's graph.
 */
declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
  env: { get(key: string): string | undefined };
};

declare module "@supabase/supabase-js" {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: Record<string, unknown>
  ): any;
}
