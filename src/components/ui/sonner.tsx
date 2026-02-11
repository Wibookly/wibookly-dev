import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-orange-50 group-[.toaster]:text-orange-900 group-[.toaster]:border-orange-500/50 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-orange-950/80 dark:group-[.toaster]:text-orange-100 dark:group-[.toaster]:border-orange-500/40",
          description: "group-[.toast]:text-orange-700 dark:group-[.toast]:text-orange-300",
          actionButton: "group-[.toast]:bg-orange-600 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
