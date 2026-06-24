import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger" | "neutral";
  className?: string;
};

const tones = {
  primary: "bg-[#e6eeff] text-primary",
  secondary: "bg-[#ffdcc7] text-secondary",
  tertiary: "bg-[#ffd9e2] text-tertiary",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  neutral: "bg-slate-100 text-slate-700"
};

export function Badge({ children, tone = "primary", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}
