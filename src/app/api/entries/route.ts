import { NextRequest, NextResponse } from "next/server";
import { getDb, entries, fieldTypes, fieldValues } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// For now, we'll use a hardcoded user ID since we don't have auth yet
const DEFAULT_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

interface FieldInput {
  name: string;
  dataType: "boolean" | "scale_1_10" | "severity" | "number" | "text";
  value: string | number | boolean;
}

interface CreateEntryRequest {
  occurredAt: string;
  fields: FieldInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEntryRequest = await request.json();

    if (!body.occurredAt || !body.fields || body.fields.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the entry
    const db = getDb();
    const [newEntry] = await db
      .insert(entries)
      .values({
        userId: DEFAULT_USER_ID,
        occurredAt: new Date(body.occurredAt),
        rawText: null, // Manual entry, no raw text
      })
      .returning();

    // Process each field
    for (const field of body.fields) {
      // Check if field type already exists for this user
      let fieldType = await db
        .select()
        .from(fieldTypes)
        .where(
          and(
            eq(fieldTypes.userId, DEFAULT_USER_ID),
            eq(fieldTypes.name, field.name.toLowerCase().trim())
          )
        )
        .limit(1);

      // Create field type if it doesn't exist
      if (fieldType.length === 0) {
        const [newFieldType] = await db
          .insert(fieldTypes)
          .values({
            userId: DEFAULT_USER_ID,
            name: field.name.toLowerCase().trim(),
            dataType: field.dataType,
            category: null, // No predefined categories - let them emerge naturally
            config: {},
            usageCount: 1,
          })
          .returning();

        fieldType = [newFieldType];
      } else {
        // Update usage count
        await db
          .update(fieldTypes)
          .set({
            usageCount: fieldType[0].usageCount + 1,
          })
          .where(eq(fieldTypes.id, fieldType[0].id));
      }

      // Create the field value
      const fieldValueData: any = {
        entryId: newEntry.id,
        fieldTypeId: fieldType[0].id,
      };

      // Set the appropriate value field based on data type
      switch (field.dataType) {
        case "boolean":
          fieldValueData.booleanValue = field.value as boolean;
          break;
        case "scale_1_10":
        case "number":
          fieldValueData.numberValue = field.value as number;
          break;
        case "severity":
        case "text":
        default:
          fieldValueData.textValue = field.value as string;
          break;
      }

      await db.insert(fieldValues).values(fieldValueData);
    }

    return NextResponse.json({
      success: true,
      entryId: newEntry.id,
    });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get entries with their field values
    const db2 = getDb();
    const userEntries = await db2
      .select({
        id: entries.id,
        occurredAt: entries.occurredAt,
        rawText: entries.rawText,
        createdAt: entries.createdAt,
      })
      .from(entries)
      .where(eq(entries.userId, DEFAULT_USER_ID))
      .orderBy(entries.occurredAt)
      .limit(limit)
      .offset(offset);

    // Get field values for these entries
    const entryIds = userEntries.map(e => e.id);
    if (entryIds.length === 0) {
      return NextResponse.json({ entries: [] });
    }

    const values = await db2
      .select({
        entryId: fieldValues.entryId,
        fieldName: fieldTypes.name,
        fieldCategory: fieldTypes.category,
        fieldDataType: fieldTypes.dataType,
        textValue: fieldValues.textValue,
        numberValue: fieldValues.numberValue,
        booleanValue: fieldValues.booleanValue,
      })
      .from(fieldValues)
      .innerJoin(fieldTypes, eq(fieldValues.fieldTypeId, fieldTypes.id))
      .innerJoin(entries, eq(fieldValues.entryId, entries.id))
      .where(eq(entries.userId, DEFAULT_USER_ID));

    // Group field values by entry
    const entriesWithFields = userEntries.map(entry => ({
      ...entry,
      fields: values
        .filter(v => v.entryId === entry.id)
        .map(v => ({
          name: v.fieldName,
          category: v.fieldCategory,
          dataType: v.fieldDataType,
          value: v.booleanValue !== null ? v.booleanValue :
                 v.numberValue !== null ? Number(v.numberValue) :
                 v.textValue,
        })),
    }));

    return NextResponse.json({ entries: entriesWithFields });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}