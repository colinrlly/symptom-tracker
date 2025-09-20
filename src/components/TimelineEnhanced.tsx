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

interface TimelineStats {
  totalEntries: number;
  fieldsThisWeek: number;
  mostUsedField: string;
  averageFieldsPerEntry: number;
}

export function TimelineEnhanced() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<string>("all");
  const [stats, setStats] = useState<TimelineStats | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [limit]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/entries?limit=${limit}&offset=0`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        calculateStats(data.entries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries: Entry[]) => {
    if (entries.length === 0) return;

    const totalFields = entries.reduce((sum, entry) => sum + entry.fields.length, 0);
    const fieldCounts: Record<string, number> = {};

    entries.forEach(entry => {
      entry.fields.forEach(field => {
        fieldCounts[field.name] = (fieldCounts[field.name] || 0) + 1;
      });
    });

    const mostUsedField = Object.entries(fieldCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const fieldsThisWeek = entries
      .filter(entry => new Date(entry.occurredAt) > oneWeekAgo)
      .reduce((sum, entry) => sum + entry.fields.length, 0);

    setStats({
      totalEntries: entries.length,
      fieldsThisWeek,
      mostUsedField,
      averageFieldsPerEntry: Math.round((totalFields / entries.length) * 10) / 10
    });
  };

  const formatValue = (field: FieldValue) => {
    switch (field.dataType) {
      case "boolean":
        return (
          <div className={`badge ${field.value ? 'badge-success' : 'badge-ghost'}`}>
            {field.value ? "✓ Yes" : "✗ No"}
          </div>
        );
      case "scale_1_10":
        return (
          <div className="flex items-center gap-2">
            <div className="badge badge-primary">{field.value}/10</div>
            <progress
              className="progress progress-primary w-16"
              value={field.value as number}
              max="10"
            ></progress>
          </div>
        );
      case "severity":
        const severity = field.value as string;
        const severityColors = {
          mild: "badge-success",
          moderate: "badge-warning",
          severe: "badge-error"
        };
        return (
          <div className={`badge ${severityColors[severity as keyof typeof severityColors] || "badge-ghost"}`}>
            {severity}
          </div>
        );
      case "number":
        return <span className="font-mono font-bold">{field.value}</span>;
      case "text":
      default:
        return <span className="italic">"{field.value}"</span>;
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
    if (!category) return "border-base-300";

    const colors: Record<string, string> = {
      symptom: "border-error",
      food: "border-success",
      medication: "border-info",
      context: "border-warning",
      other: "border-neutral"
    };
    return colors[category] || "border-base-300";
  };

  const getCategoryBadgeColor = (category: string | null) => {
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

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    entries.forEach(entry => {
      entry.fields.forEach(field => {
        if (field.category) categories.add(field.category);
      });
    });
    return Array.from(categories);
  };

  const filteredEntries = filter === "all"
    ? entries
    : entries.filter(entry =>
        entry.fields.some(field => field.category === filter)
      );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const groupedEntries = groupEntriesByDate(filteredEntries);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="stat bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="stat-figure text-primary">
              <div className="text-3xl">📊</div>
            </div>
            <div className="stat-title">Total Entries</div>
            <div className="stat-value text-primary">{stats.totalEntries}</div>
          </div>

          <div className="stat bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
            <div className="stat-figure text-secondary">
              <div className="text-3xl">📈</div>
            </div>
            <div className="stat-title">Fields This Week</div>
            <div className="stat-value text-secondary">{stats.fieldsThisWeek}</div>
          </div>

          <div className="stat bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20">
            <div className="stat-figure text-success">
              <div className="text-3xl">🎯</div>
            </div>
            <div className="stat-title">Most Used</div>
            <div className="stat-value text-success text-lg">{stats.mostUsedField}</div>
          </div>

          <div className="stat bg-gradient-to-br from-info/10 to-info/5 rounded-xl border border-info/20">
            <div className="stat-figure text-info">
              <div className="text-3xl">⚡</div>
            </div>
            <div className="stat-title">Avg Fields/Entry</div>
            <div className="stat-value text-info">{stats.averageFieldsPerEntry}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="card-title text-xl">
                Timeline ({filteredEntries.length} entries)
              </h2>

              {/* Category Filter */}
              <select
                className="select select-bordered select-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Limit Control */}
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
        </div>
      </div>

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold mb-2">No entries yet</h3>
            <p className="text-base-content/60">
              {filter === "all"
                ? "Create your first entry to start tracking."
                : `No entries found for category "${filter}".`
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayEntries]) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-24 z-10 mb-6">
                  <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg p-4 shadow-lg">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      <div className="badge badge-outline ml-auto">
                        {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                      </div>
                    </h3>
                  </div>
                </div>

                {/* Entries for this date */}
                <div className="space-y-4 pl-4 border-l-4 border-primary/30">
                  {dayEntries
                    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                    .map((entry, index) => (
                      <div
                        key={entry.id}
                        className="card bg-base-100 shadow-lg border border-base-300 card-hover animate-scale-in"
                        style={{animationDelay: `${index * 100}ms`}}
                      >
                        <div className="card-body p-6">
                          {/* Entry Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                ⏰
                              </div>
                              <div>
                                <div className="font-bold text-lg">
                                  {new Date(entry.occurredAt).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                                <div className="text-sm text-base-content/60">
                                  {entry.fields.length} {entry.fields.length === 1 ? 'field' : 'fields'} recorded
                                </div>
                              </div>
                            </div>

                            {entry.rawText && (
                              <div className="badge badge-primary badge-outline gap-2">
                                🤖 AI Parsed
                              </div>
                            )}
                          </div>

                          {/* Raw Text */}
                          {entry.rawText && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-base-200 to-base-300 rounded-lg border-l-4 border-primary">
                              <div className="text-sm font-medium text-base-content/80 mb-1">Original Input:</div>
                              <div className="italic text-base-content/90">"{entry.rawText}"</div>
                            </div>
                          )}

                          {/* Fields */}
                          {entry.fields.length === 0 ? (
                            <div className="text-center text-base-content/50 py-8">
                              <div className="text-4xl mb-2">📝</div>
                              <p>No fields recorded for this entry</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {entry.fields.map((field, fieldIndex) => (
                                <div
                                  key={fieldIndex}
                                  className={`p-4 rounded-lg border-2 ${getCategoryColor(field.category)} bg-base-50 hover:shadow-md transition-all duration-200`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{getFieldIcon(field.dataType)}</span>
                                      <span className="font-bold text-sm">{field.name}</span>
                                    </div>
                                    {field.category && (
                                      <span className={`badge badge-xs ${getCategoryBadgeColor(field.category)}`}>
                                        {field.category}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {formatValue(field)}
                                  </div>
                                </div>
                              ))}
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
    </div>
  );
}