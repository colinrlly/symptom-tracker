"use client";

import { useState, useEffect } from "react";

interface FieldValue {
  name: string;
  category: string | null;
  dataType: string;
  value: string | number | boolean;
}

interface Entry {
  id: string;
  occurredAt: string;
  rawText: string | null;
  createdAt: string;
  fields: FieldValue[];
}

export function Timeline() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchEntries();
  }, [limit]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/entries?limit=${limit}&offset=0`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (field: FieldValue) => {
    switch (field.dataType) {
      case "boolean":
        return field.value ? "✓ Yes" : "✗ No";
      case "scale_1_10":
        return `${field.value}/10`;
      case "severity":
        const severity = field.value as string;
        const severityColors: Record<string, string> = {
          mild: "text-success",
          moderate: "text-warning",
          severe: "text-error"
        };
        return <span className={severityColors[severity] || ""}>{severity}</span>;
      case "number":
        return field.value;
      case "text":
      default:
        return field.value;
    }
  };

  const getFieldIcon = (dataType: string) => {
    switch (dataType) {
      case "boolean": return "✓";
      case "scale_1_10": return "📊";
      case "severity": return "⚠️";
      case "number": return "#";
      case "text": return "📝";
      default: return "?";
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return "badge-ghost";

    const colors: Record<string, string> = {
      symptom: "badge-error",
      food: "badge-success",
      medication: "badge-info",
      context: "badge-warning",
      other: "badge-neutral"
    };
    return colors[category] || "badge-ghost";
  };

  const groupEntriesByDate = (entries: Entry[]) => {
    const groups: Record<string, Entry[]> = {};

    entries.forEach(entry => {
      const date = new Date(entry.occurredAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const groupedEntries = groupEntriesByDate(entries);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Timeline ({entries.length} entries)</h2>

          <div className="form-control">
            <select
              className="select select-bordered select-sm"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
            >
              <option value={10}>Show 10</option>
              <option value={25}>Show 25</option>
              <option value={50}>Show 50</option>
              <option value={100}>Show 100</option>
            </select>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <p>No entries yet.</p>
            <p className="text-sm">Create your first entry to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayEntries]) => (
                <div key={date} className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>

                  <div className="space-y-3">
                    {dayEntries
                      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                      .map((entry) => (
                        <div key={entry.id} className="card bg-base-200 shadow-sm">
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-sm font-medium text-base-content/60">
                                {new Date(entry.occurredAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                              {entry.rawText && (
                                <div className="badge badge-outline">
                                  🤖 Parsed
                                </div>
                              )}
                            </div>

                            {entry.rawText && (
                              <div className="mb-3 p-2 bg-base-300 rounded text-sm italic">
                                "{entry.rawText}"
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {entry.fields.map((field, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-base-100 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getFieldIcon(field.dataType)}</span>
                                    <div>
                                      <div className="font-medium">{field.name}</div>
                                      {field.category && (
                                        <span className={`badge badge-xs ${getCategoryColor(field.category)}`}>
                                          {field.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="font-semibold">
                                    {formatValue(field)}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {entry.fields.length === 0 && (
                              <div className="text-center text-base-content/50 py-4">
                                No fields recorded for this entry
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="mt-6 text-sm text-base-content/60">
          <p><strong>Tip:</strong> Entries are grouped by date and sorted with most recent first.</p>
          <p>Field icons help you quickly identify data types: ✓ (yes/no), 📊 (scale), ⚠️ (severity), # (number), 📝 (text)</p>
        </div>
      </div>
    </div>
  );
}