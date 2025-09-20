"use client";

import { useState, useEffect } from "react";

interface FieldInput {
  id: string;
  name: string;
  dataType: "boolean" | "scale_1_10" | "severity" | "number" | "text";
  value: string | number | boolean;
}

interface ExistingFieldType {
  id: string;
  name: string;
  dataType: string;
  category: string | null;
  usageCount: number;
}

export function EntryFormEnhanced() {
  const [occurredAt, setOccurredAt] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [fields, setFields] = useState<FieldInput[]>([]);
  const [existingFieldTypes, setExistingFieldTypes] = useState<ExistingFieldType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchExistingFieldTypes();
  }, []);

  const fetchExistingFieldTypes = async () => {
    try {
      const response = await fetch('/api/field-types?sortBy=usage');
      if (response.ok) {
        const data = await response.json();
        setExistingFieldTypes(data.fieldTypes);
      }
    } catch (error) {
      console.error('Error fetching field types:', error);
    }
  };

  const addField = () => {
    const newField: FieldInput = {
      id: Math.random().toString(36).slice(2),
      name: "",
      dataType: "text",
      value: "",
    };
    setFields([...fields, newField]);
  };

  const addExistingField = (fieldType: ExistingFieldType) => {
    if (fields.some(f => f.name === fieldType.name)) {
      return;
    }

    const defaultValue = fieldType.dataType === 'boolean' ? false :
                        fieldType.dataType === 'scale_1_10' ? 5 :
                        fieldType.dataType === 'number' ? 0 : "";

    const newField: FieldInput = {
      id: Math.random().toString(36).slice(2),
      name: fieldType.name,
      dataType: fieldType.dataType as FieldInput['dataType'],
      value: defaultValue,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FieldInput>) => {
    setFields(fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occurredAt: new Date(occurredAt).toISOString(),
          fields: fields.filter(f => f.name && f.value !== ""),
        }),
      });

      if (response.ok) {
        setFields([]);
        setOccurredAt(() => {
          const now = new Date();
          return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        });

        setShowSuccess(true);
        await fetchExistingFieldTypes(); // Refresh field types
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSubmitting(false);
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

  const renderFieldInput = (field: FieldInput) => {
    switch (field.dataType) {
      case "boolean":
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={field.value as boolean}
              onChange={(e) => updateField(field.id, { value: e.target.checked })}
            />
            <span className="text-sm font-medium">
              {field.value ? "Yes" : "No"}
            </span>
          </div>
        );

      case "scale_1_10":
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/60">Low</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{field.value}/10</span>
              </div>
              <span className="text-sm text-base-content/60">High</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="range range-primary"
              value={field.value as number}
              onChange={(e) => updateField(field.id, { value: parseInt(e.target.value) })}
            />
            <div className="w-full flex justify-between text-xs text-base-content/40">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <span key={i}>|</span>
              ))}
            </div>
          </div>
        );

      case "severity":
        return (
          <div className="grid grid-cols-3 gap-2">
            {['mild', 'moderate', 'severe'].map((severity) => (
              <button
                key={severity}
                type="button"
                className={`btn btn-sm ${
                  field.value === severity
                    ? severity === 'mild' ? 'btn-success' :
                      severity === 'moderate' ? 'btn-warning' : 'btn-error'
                    : 'btn-outline'
                }`}
                onClick={() => updateField(field.id, { value: severity })}
              >
                {severity}
              </button>
            ))}
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            className="input input-bordered input-primary focus:input-primary"
            value={field.value as number}
            onChange={(e) => updateField(field.id, { value: parseFloat(e.target.value) || 0 })}
            placeholder="Enter number"
          />
        );

      default: // text
        return (
          <input
            type="text"
            className="input input-bordered input-primary focus:input-primary"
            value={field.value as string}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            placeholder="Enter text"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {showSuccess && (
        <div className="alert alert-success animate-slide-up">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Entry saved successfully!</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300 card-hover">
        <div className="card-body p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center text-2xl">
              ✏️
            </div>
            <div>
              <h2 className="card-title text-2xl">Log New Entry</h2>
              <p className="text-base-content/60">Track what happened and when</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* DateTime Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-lg">⏰ When did this occur?</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered input-primary text-lg h-14 focus:input-primary"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                required
              />
            </div>

            {/* Quick Add Section */}
            {existingFieldTypes.length > 0 && (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    ⚡
                  </div>
                  <h3 className="text-xl font-bold">Quick Add</h3>
                  <div className="badge badge-primary badge-outline">Your most used fields</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingFieldTypes.slice(0, 8).map((fieldType) => {
                    const isAlreadyAdded = fields.some(f => f.name === fieldType.name);
                    return (
                      <button
                        key={fieldType.id}
                        type="button"
                        className={`btn h-auto p-4 flex-col gap-2 transition-all duration-200 ${
                          isAlreadyAdded
                            ? 'btn-success shadow-lg'
                            : 'btn-outline hover:btn-primary hover:scale-105'
                        }`}
                        onClick={() => addExistingField(fieldType)}
                        disabled={isAlreadyAdded}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFieldIcon(fieldType.dataType)}</span>
                          <span className={isAlreadyAdded ? '✓' : '+'}></span>
                        </div>
                        <span className="font-medium text-sm">{fieldType.name}</span>
                        {fieldType.category && (
                          <div className={`badge badge-xs ${getCategoryColor(fieldType.category)}`}>
                            {fieldType.category}
                          </div>
                        )}
                        <div className="badge badge-xs">{fieldType.usageCount}x</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Fields Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    🎛️
                  </div>
                  <h3 className="text-xl font-bold">Custom Fields</h3>
                  <div className="badge badge-secondary badge-outline">{fields.length} fields</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-primary gap-2 hover:scale-105 transition-transform"
                  onClick={addField}
                >
                  <span className="text-lg">+</span>
                  Add New Field
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-12 text-base-content/50">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">No custom fields yet</p>
                  <p className="text-sm">Use Quick Add above or create a new field</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="card bg-base-200 border border-base-300 animate-scale-in">
                      <div className="card-body p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Field Name */}
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Field Name</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered focus:input-primary"
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              placeholder="e.g., headache intensity"
                            />
                          </div>

                          {/* Data Type */}
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Data Type</span>
                            </label>
                            <select
                              className="select select-bordered focus:select-primary"
                              value={field.dataType}
                              onChange={(e) => updateField(field.id, {
                                dataType: e.target.value as FieldInput['dataType'],
                                value: e.target.value === 'boolean' ? false :
                                       e.target.value === 'scale_1_10' ? 5 : ""
                              })}
                            >
                              <option value="text">📝 Text</option>
                              <option value="boolean">✓ Yes/No</option>
                              <option value="scale_1_10">📊 Scale 1-10</option>
                              <option value="severity">⚠️ Severity</option>
                              <option value="number"># Number</option>
                            </select>
                          </div>

                          {/* Value Input */}
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Value</span>
                            </label>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                {renderFieldInput(field)}
                              </div>
                              <button
                                type="button"
                                className="btn btn-circle btn-sm btn-error hover:scale-110 transition-transform"
                                onClick={() => removeField(field.id)}
                                title="Remove field"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="card-actions justify-end pt-6 border-t border-base-300">
              <button
                type="submit"
                className="btn btn-primary btn-lg gap-3 hover:scale-105 transition-transform"
                disabled={isSubmitting || (fields.length === 0)}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving Entry...
                  </>
                ) : (
                  <>
                    <span className="text-lg">💾</span>
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}