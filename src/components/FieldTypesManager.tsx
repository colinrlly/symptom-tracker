"use client";

import { useState, useEffect } from "react";
import { FieldType } from "@/lib/db";

interface FieldTypesManagerProps {
  onFieldTypeSelect?: (fieldType: FieldType) => void;
}

export function FieldTypesManager({ onFieldTypeSelect }: FieldTypesManagerProps) {
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"usage" | "name" | "created">("usage");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string>("");

  useEffect(() => {
    fetchFieldTypes();
  }, [sortBy]);

  const fetchFieldTypes = async () => {
    try {
      const response = await fetch(`/api/field-types?sortBy=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setFieldTypes(data.fieldTypes);
      }
    } catch (error) {
      console.error("Error fetching field types:", error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Field Types ({fieldTypes.length})</h2>

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

        {fieldTypes.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <p>No field types yet.</p>
            <p className="text-sm">Create your first entry to start tracking fields.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Usage Count</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fieldTypes.map((fieldType) => (
                  <tr key={fieldType.id} className="hover">
                    <td>
                      {editingId === fieldType.id ? (
                        <input
                          type="text"
                          className="input input-bordered input-sm w-full"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{fieldType.name}</span>
                          {onFieldTypeSelect && (
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => onFieldTypeSelect(fieldType)}
                              title="Use this field"
                            >
                              +
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <span>{getDataTypeIcon(fieldType.dataType)}</span>
                        <span className="text-sm">{fieldType.dataType.replace("_", " ")}</span>
                      </div>
                    </td>

                    <td>
                      {editingId === fieldType.id ? (
                        <input
                          type="text"
                          className="input input-bordered input-sm w-full"
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                          placeholder="e.g., symptom, food"
                        />
                      ) : (
                        <span className={`badge ${getCategoryBadgeColor(fieldType.category)}`}>
                          {fieldType.category || "uncategorized"}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{fieldType.usageCount}</span>
                        <progress
                          className="progress progress-primary w-16"
                          value={fieldType.usageCount}
                          max={Math.max(...fieldTypes.map(f => f.usageCount))}
                        ></progress>
                      </div>
                    </td>

                    <td className="text-sm text-base-content/60">
                      {new Date(fieldType.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      {editingId === fieldType.id ? (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-success btn-xs"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => startEditing(fieldType)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => deleteFieldType(fieldType.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-base-content/60">
          <p><strong>Tip:</strong> You can edit field names and assign categories to organize your data.</p>
          <p>Categories will help identify patterns later (e.g., which foods trigger which symptoms).</p>
        </div>
      </div>
    </div>
  );
}