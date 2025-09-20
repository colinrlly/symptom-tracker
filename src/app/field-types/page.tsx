import { FieldTypesManagerEnhanced as FieldTypesManager } from "@/components/FieldTypesManagerEnhanced";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function FieldTypesPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Manage Fields"
          description="Organize and categorize the fields you track over time"
          icon="⚙️"
          breadcrumbs={[
            { name: "Home", href: "/" },
            { name: "Manage Fields" }
          ]}
        >
          <Link href="/timeline" className="btn btn-outline gap-2">
            📈 View Timeline
          </Link>
          <Link href="/" className="btn btn-primary gap-2">
            ✏️ New Entry
          </Link>
        </PageHeader>

        <div className="animate-fade-in">
          <FieldTypesManager />
        </div>
      </div>
    </Layout>
  );
}