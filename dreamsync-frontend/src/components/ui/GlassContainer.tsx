import type { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function GlassContainer({
  children,
  className,
  ...props
}: Props) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-2xl px-6 py-5",
        "bg-white/[0.04] backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        "transition-all duration-200 ease-out",
        "hover:bg-white/[0.06]",
        "hover:-translate-y-[2px]",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      {children}
    </div>
  );
}
