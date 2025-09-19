import { EntryForm } from "@/components/EntryForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-base-content mb-2">
              Symptom Tracker
            </h1>
            <p className="text-lg text-base-content/70">
              Track your symptoms, foods, and medications with ease
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <Link href="/field-types" className="btn btn-outline">
                📊 Manage Fields
              </Link>
              <Link href="/timeline" className="btn btn-outline">
                📈 View Timeline
              </Link>
            </div>
          </div>

          <EntryForm />
        </div>
      </div>
    </div>
  );
}
