"use client";

import { useState, useEffect } from "react";
import { FieldType } from "@/lib/db";

interface FieldTypesManagerProps {
  onFieldTypeSelect?: (fieldType: FieldType) => void;
}

interface FieldTypeStats {
  totalFields: number;
  totalUsage: number;
  categoryCounts: Record<string, number>;
  mostUsedField: { name: string; count: number };
  recentlyAdded: number;
}

export function FieldTypesManagerEnhanced({ onFieldTypeSelect }: FieldTypesManagerProps) {
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"usage" | "name" | "created">("usage");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string>("");
  const [stats, setStats] = useState<FieldTypeStats | null>(null);

  useEffect(() => {
    fetchFieldTypes();
  }, [sortBy]);

  const fetchFieldTypes = async () => {
    try {
      const response = await fetch(`/api/field-types?sortBy=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setFieldTypes(data.fieldTypes);
        calculateStats(data.fieldTypes);
      }
    } catch (error) {
      console.error("Error fetching field types:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (fieldTypes: FieldType[]) => {
    if (fieldTypes.length === 0) return;

    const totalUsage = fieldTypes.reduce((sum, ft) => sum + ft.usageCount, 0);
    const categoryCounts: Record<string, number> = {};

    fieldTypes.forEach(ft => {
      const category = ft.category || "uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const mostUsedField = fieldTypes.reduce((max, ft) =>
      ft.usageCount > max.count ? { name: ft.name, count: ft.usageCount } : max,
      { name: "", count: 0 }
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentlyAdded = fieldTypes.filter(ft =>
      new Date(ft.createdAt) > oneWeekAgo
    ).length;

    setStats({
      totalFields: fieldTypes.length,
      totalUsage,
      categoryCounts,
      mostUsedField,
      recentlyAdded
    });
  };

  const startEditing = (fieldType: FieldType) => {
    setEditingId(fieldType.id);
    setEditingName(fieldType.name);
    setEditingCategory(fieldType.category || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch("/api/field-types", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editingName,
          category: editingCategory || null,
        }),
      });

      if (response.ok) {
        await fetchFieldTypes();
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error updating field type:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingCategory("");
  };

  const deleteFieldType = async (id: string) => {
    if (!confirm("Are you sure? This will delete all entries using this field.")) {
      return;
    }

    try {
      const response = await fetch(`/api/field-types?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchFieldTypes();
      }
    } catch (error) {
      console.error("Error deleting field type:", error);
    }
  };

  const getDataTypeIcon = (dataType: string) => {
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
    if (!category) return "from-base-300 to-base-200";

    const colors: Record<string, string> = {
      symptom: "from-error/20 to-error/10",
      food: "from-success/20 to-success/10",
      medication: "from-info/20 to-info/10",
      context: "from-warning/20 to-warning/10",
      other: "from-neutral/20 to-neutral/10"
    };
    return colors[category] || "from-base-300 to-base-200";
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

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    fieldTypes.forEach(ft => {
      if (ft.category) categories.add(ft.category);
    });
    return Array.from(categories);
  };

  const filteredFieldTypes = filterCategory === "all"
    ? fieldTypes
    : fieldTypes.filter(ft => (ft.category || "uncategorized") === filterCategory);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="stat bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="stat-figure text-primary">
              <div className="text-3xl">📊</div>
            </div>
            <div className="stat-title">Total Fields</div>
            <div className="stat-value text-primary">{stats.totalFields}</div>
          </div>

          <div className="stat bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
            <div className="stat-figure text-secondary">
              <div className="text-3xl">🎯</div>
            </div>
            <div className="stat-title">Total Usage</div>
            <div className="stat-value text-secondary">{stats.totalUsage}</div>
          </div>

          <div className="stat bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20">
            <div className="stat-figure text-success">
              <div className="text-3xl">⭐</div>
            </div>
            <div className="stat-title">Most Used</div>
            <div className="stat-value text-success text-lg">{stats.mostUsedField.name || "None"}</div>
            <div className="stat-desc">Used {stats.mostUsedField.count} times</div>
          </div>

          <div className="stat bg-gradient-to-br from-info/10 to-info/5 rounded-xl border border-info/20">
            <div className="stat-figure text-info">
              <div className="text-3xl">🆕</div>
            </div>
            <div className="stat-title">Added This Week</div>
            <div className="stat-value text-info">{stats.recentlyAdded}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="card-title text-xl">
                Field Types ({filteredFieldTypes.length})
              </h2>

              {/* Category Filter */}
              <select
                className="select select-bordered select-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="uncategorized">Uncategorized</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Control */}
            <div className="form-control">
              <select
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="usage">Sort by Usage</option>
                <option value="name">Sort by Name</option>
                <option value="created">Sort by Created</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Field Types Grid */}
      {filteredFieldTypes.length === 0 ? (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-16">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-2xl font-bold mb-2">No field types yet</h3>
            <p className="text-base-content/60">
              {filterCategory === "all"
                ? "Create your first entry to start tracking fields."
                : `No fields found in category "${filterCategory}".`
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFieldTypes.map((fieldType, index) => (
            <div
              key={fieldType.id}
              className={`card bg-gradient-to-br ${getCategoryColor(fieldType.category)} shadow-lg border border-base-300 card-hover animate-scale-in`}
              style={{animationDelay: `${index * 50}ms`}}
            >
              <div className="card-body p-6">
                {editingId === fieldType.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Field Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm focus:input-primary"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Category</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm focus:input-primary"
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        placeholder="e.g., symptom, food"
                      />
                    </div>

                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={saveEdit}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center text-2xl">
                          {getDataTypeIcon(fieldType.dataType)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{fieldType.name}</h3>
                          <div className="text-sm opacity-70 capitalize">
                            {fieldType.dataType.replace("_", " ")}
                          </div>
                        </div>
                      </div>

                      {onFieldTypeSelect && (
                        <button
                          className="btn btn-circle btn-sm btn-primary hover:scale-110 transition-transform"
                          onClick={() => onFieldTypeSelect(fieldType)}
                          title="Use this field"
                        >
                          +
                        </button>
                      )}
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <span className={`badge ${getCategoryBadgeColor(fieldType.category)}`}>
                        {fieldType.category || "uncategorized"}
                      </span>
                    </div>

                    {/* Usage Stats */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Usage</span>
                        <span className="font-bold">{fieldType.usageCount}x</span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={fieldType.usageCount}
                        max={Math.max(...fieldTypes.map(f => f.usageCount))}
                      ></progress>
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-base-content/60 mb-4">
                      Created {new Date(fieldType.createdAt).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-ghost btn-sm hover:scale-105 transition-transform"
                        onClick={() => startEditing(fieldType)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-error btn-sm hover:scale-105 transition-transform"
                        onClick={() => deleteFieldType(fieldType.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="card bg-gradient-to-r from-info/10 to-info/5 border border-info/20">
        <div className="card-body p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-lg mb-2">Field Management Tips</h3>
              <ul className="text-sm space-y-1 text-base-content/80">
                <li>• <strong>Categories</strong> help organize and analyze your data patterns</li>
                <li>• <strong>Usage counts</strong> show which fields are most important to you</li>
                <li>• <strong>Edit field names</strong> to fix typos and maintain consistency</li>
                <li>• <strong>Merge similar fields</strong> by renaming (e.g., "cramps" → "cramping")</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}