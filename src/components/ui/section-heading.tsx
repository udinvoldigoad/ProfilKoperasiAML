import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="mb-3 text-sm font-bold text-secondary">{eyebrow}</p> : null}
      <h2 className="text-3xl font-bold leading-tight text-primary md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-on-surface-variant">{description}</p> : null}
    </div>
  );
}
