import { NextRequest, NextResponse } from "next/server";
import { getDb, fieldTypes } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";

// For now, we'll use a hardcoded user ID since we don't have auth yet
const DEFAULT_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "usage"; // usage, name, created
    const category = searchParams.get("category"); // optional filter

    type CategoryOption = "boolean" | "scale_1_10" | "severity" | "number" | "text" | "duration" extends never
      ? never
      : "symptom" | "food" | "medication" | "context" | "other";

    const allowedCategories: readonly CategoryOption[] = [
      "symptom",
      "food",
      "medication",
      "context",
      "other",
    ] as const;

    const isCategory = (value: unknown): value is CategoryOption =>
      typeof value === "string" && (allowedCategories as readonly string[]).includes(value);

    const conditions = [eq(fieldTypes.userId, DEFAULT_USER_ID)];
    if (category && category !== "all" && isCategory(category)) {
      conditions.push(eq(fieldTypes.category, category));
    }

    const whereExpr = and(...conditions);

    // Add sorting
    const db = getDb();
    let userFieldTypes;
    switch (sortBy) {
      case "name":
        userFieldTypes = await db
          .select()
          .from(fieldTypes)
          .where(whereExpr)
          .orderBy(fieldTypes.name);
        break;
      case "created":
        userFieldTypes = await db
          .select()
          .from(fieldTypes)
          .where(whereExpr)
          .orderBy(desc(fieldTypes.createdAt));
        break;
      case "usage":
      default:
        userFieldTypes = await db
          .select()
          .from(fieldTypes)
          .where(whereExpr)
          .orderBy(desc(fieldTypes.usageCount), fieldTypes.name);
        break;
    }

    return NextResponse.json({ fieldTypes: userFieldTypes });
  } catch (error) {
    console.error("Error fetching field types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDb();
    const { id, name, category } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Field type ID is required" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name.toLowerCase().trim();
    if (category !== undefined) updates.category = category;

    const [updatedFieldType] = await db
      .update(fieldTypes)
      .set(updates)
      .where(eq(fieldTypes.id, id))
      .returning();

    if (!updatedFieldType) {
      return NextResponse.json(
        { error: "Field type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ fieldType: updatedFieldType });
  } catch (error) {
    console.error("Error updating field type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Field type ID is required" },
        { status: 400 }
      );
    }

    await db.delete(fieldTypes).where(eq(fieldTypes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting field type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}