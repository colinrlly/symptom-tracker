import { EntryFormEnhanced as EntryForm } from "@/components/EntryFormEnhanced";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="New Entry"
          description="Log your symptoms, foods, medications, and other health data"
          icon="✏️"
        >
          <Link href="/timeline" className="btn btn-outline gap-2">
            📈 View Timeline
          </Link>
          <Link href="/field-types" className="btn btn-outline gap-2">
            ⚙️ Manage Fields
          </Link>
        </PageHeader>

        <div className="animate-fade-in">
          <EntryForm />
        </div>
      </div>
    </Layout>
  );
}
