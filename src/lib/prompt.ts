import { select as clackSelect, isCancel, cancel } from "@clack/prompts";

export async function select<T>(question: string, options: T[], display?: (opt: T) => string): Promise<T> {
  const fmt = display ?? String;
  const result = await clackSelect({
    message: question,
    options: options.map((opt) => ({
      value: opt,
      label: fmt(opt),
    })) as any[],
  });

  if (isCancel(result)) {
    cancel("Cancelled");
    process.exit(0);
  }

  return result as T;
}
