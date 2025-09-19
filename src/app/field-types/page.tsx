import { FieldTypesManager } from "@/components/FieldTypesManager";
import Link from "next/link";

export default function FieldTypesPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-base-content mb-2">
                Field Types
              </h1>
              <p className="text-lg text-base-content/70">
                Manage the fields you track over time
              </p>
            </div>

            <Link href="/" className="btn btn-primary">
              ← Back to Entry
            </Link>
          </div>

          <FieldTypesManager />
        </div>
      </div>
    </div>
  );
}