import { Separator } from "@/components/ui/separator";
import { Heading } from "./heading";

/** Heading + optional right-side action, followed by a separator. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Heading title={title} description={description} />
        {action}
      </div>
      <Separator />
    </>
  );
}
