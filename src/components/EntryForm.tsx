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

export function EntryForm() {
  const [occurredAt, setOccurredAt] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [fields, setFields] = useState<FieldInput[]>([]);
  const [existingFieldTypes, setExistingFieldTypes] = useState<ExistingFieldType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Check if this field is already added
    if (fields.some(f => f.name === fieldType.name)) {
      return; // Don't add duplicates
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
        // Reset form
        setFields([]);
        setOccurredAt(() => {
          const now = new Date();
          return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        });
      } else {
        console.error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldInput = (field: FieldInput) => {
    switch (field.dataType) {
      case "boolean":
        return (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={field.value as boolean}
            onChange={(e) => updateField(field.id, { value: e.target.checked })}
          />
        );

      case "scale_1_10":
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="10"
              className="range range-primary"
              value={field.value as number}
              onChange={(e) => updateField(field.id, { value: parseInt(e.target.value) })}
            />
            <span className="badge badge-outline">{field.value}/10</span>
          </div>
        );

      case "severity":
        return (
          <select
            className="select select-bordered"
            value={field.value as string}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
          >
            <option value="">Select severity</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            className="input input-bordered"
            value={field.value as number}
            onChange={(e) => updateField(field.id, { value: parseFloat(e.target.value) || 0 })}
            placeholder="Enter number"
          />
        );

      default: // text
        return (
          <input
            type="text"
            className="input input-bordered"
            value={field.value as string}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            placeholder="Enter text"
          />
        );
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title">Log New Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">When did this occur?</span>
            </label>
            <input
              type="datetime-local"
              className="input input-bordered"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </div>

          {existingFieldTypes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Quick Add (Your Most Used Fields)</h3>
              <div className="flex flex-wrap gap-2">
                {existingFieldTypes.slice(0, 8).map((fieldType) => {
                  const isAlreadyAdded = fields.some(f => f.name === fieldType.name);
                  return (
                    <button
                      key={fieldType.id}
                      type="button"
                      className={`btn btn-sm ${isAlreadyAdded ? 'btn-success' : 'btn-outline'}`}
                      onClick={() => addExistingField(fieldType)}
                      disabled={isAlreadyAdded}
                    >
                      {isAlreadyAdded ? '✓' : '+'} {fieldType.name}
                      <span className="badge badge-xs ml-1">{fieldType.usageCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Fields</h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addField}
              >
                + Add New Field
              </button>
            </div>

            {fields.map((field) => (
              <div key={field.id} className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Field Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        placeholder="e.g., cramping, pizza, stress level"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Data Type</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={field.dataType}
                        onChange={(e) => updateField(field.id, {
                          dataType: e.target.value as FieldInput['dataType'],
                          value: e.target.value === 'boolean' ? false :
                                 e.target.value === 'scale_1_10' ? 5 : ""
                        })}
                      >
                        <option value="text">Text</option>
                        <option value="boolean">Yes/No</option>
                        <option value="scale_1_10">Scale 1-10</option>
                        <option value="severity">Severity</option>
                        <option value="number">Number</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Value</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {renderFieldInput(field)}
                        <button
                          type="button"
                          className="btn btn-square btn-sm btn-error"
                          onClick={() => removeField(field.id)}
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

          <div className="card-actions justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || fields.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}