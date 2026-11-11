import { Heading } from "@/components/management/heading";
import { Separator } from "@/components/ui/separator";
import { t } from "@/lib/i18n/admin";

export default function DashboardPage() {
  return (
    <>
      <Heading title={t.dashboard.title} description={t.dashboard.description} />
      <Separator />
    </>
  );
}
