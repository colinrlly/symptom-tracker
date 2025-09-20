import { TimelineEnhanced as Timeline } from "@/components/TimelineEnhanced";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function TimelinePage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Timeline"
          description="View your tracking history and discover patterns over time"
          icon="📈"
          breadcrumbs={[
            { name: "Home", href: "/" },
            { name: "Timeline" }
          ]}
        >
          <Link href="/field-types" className="btn btn-outline gap-2">
            ⚙️ Manage Fields
          </Link>
          <Link href="/" className="btn btn-primary gap-2">
            ✏️ New Entry
          </Link>
        </PageHeader>

        <div className="animate-fade-in">
          <Timeline />
        </div>
      </div>
    </Layout>
  );
}