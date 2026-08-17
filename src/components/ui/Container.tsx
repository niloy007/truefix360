import { cn } from "@/lib/utils";

type ContainerProps = {
  as?: "div" | "section" | "article";
  className?: string;
  children: React.ReactNode;
  width?: "default" | "narrow" | "wide";
};

const widthClass = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
  wide: "max-w-[88rem]",
};

export function Container({
  as: Tag = "div",
  className,
  children,
  width = "default",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        widthClass[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
