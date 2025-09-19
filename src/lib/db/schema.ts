import { pgTable, uuid, text, timestamp, integer, numeric, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(createId()),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Entries table - each entry represents one log entry from the user
export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().default(createId()),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
  rawText: text("raw_text"), // Store original input for reference (null for manual entries initially)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Field types - defines what fields this user tracks and their data types
export const fieldTypes = pgTable("field_types", {
  id: uuid("id").primaryKey().default(createId()),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(), // e.g. "cramping", "pizza", "ibuprofen"
  dataType: text("data_type", {
    enum: ["boolean", "scale_1_10", "severity", "number", "text", "duration"]
  }).notNull(),
  category: text("category", {
    enum: ["symptom", "food", "medication", "context", "other"]
  }),
  config: jsonb("config").default({}), // For storing options, min/max, units, etc.
  usageCount: integer("usage_count").default(0).notNull(), // Track how often this field is used
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userNameUnique: uniqueIndex("user_name_unique").on(table.userId, table.name),
}));

// Field values - the actual data for each entry
export const fieldValues = pgTable("field_values", {
  id: uuid("id").primaryKey().default(createId()),
  entryId: uuid("entry_id").references(() => entries.id, { onDelete: "cascade" }).notNull(),
  fieldTypeId: uuid("field_type_id").references(() => fieldTypes.id, { onDelete: "cascade" }).notNull(),
  // Different value columns for different data types
  textValue: text("text_value"),
  numberValue: numeric("number_value"),
  booleanValue: boolean("boolean_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

export type FieldType = typeof fieldTypes.$inferSelect;
export type NewFieldType = typeof fieldTypes.$inferInsert;

export type FieldValue = typeof fieldValues.$inferSelect;
export type NewFieldValue = typeof fieldValues.$inferInsert;