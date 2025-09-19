import { Timeline } from "@/components/Timeline";
import Link from "next/link";

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-base-content mb-2">
                Timeline
              </h1>
              <p className="text-lg text-base-content/70">
                View your tracking history over time
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/field-types" className="btn btn-outline">
                📊 Manage Fields
              </Link>
              <Link href="/" className="btn btn-primary">
                ✏️ New Entry
              </Link>
            </div>
          </div>

          <Timeline />
        </div>
      </div>
    </div>
  );
}