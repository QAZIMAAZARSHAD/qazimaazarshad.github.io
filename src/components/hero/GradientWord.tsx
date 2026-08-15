import { cn } from "@/lib/utils";

interface GradientWordProps {
  readonly children: string;
  readonly play?: boolean;
}

export function GradientWord({ children, play = true }: GradientWordProps) {
  return (
    <span
      data-text={children}
      className={cn("relative inline-block text-gradient", play && "qma-sheen")}
    >
      {children}
    </span>
  );
}
