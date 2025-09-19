import { NextRequest, NextResponse } from "next/server";
import { db, fieldTypes } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

// For now, we'll use a hardcoded user ID since we don't have auth yet
const DEFAULT_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "usage"; // usage, name, created
    const category = searchParams.get("category"); // optional filter

    let query = db
      .select()
      .from(fieldTypes)
      .where(eq(fieldTypes.userId, DEFAULT_USER_ID));

    // Add category filter if specified
    if (category && category !== "all") {
      query = query.where(eq(fieldTypes.category, category));
    }

    // Add sorting
    switch (sortBy) {
      case "name":
        query = query.orderBy(fieldTypes.name);
        break;
      case "created":
        query = query.orderBy(desc(fieldTypes.createdAt));
        break;
      case "usage":
      default:
        query = query.orderBy(desc(fieldTypes.usageCount), fieldTypes.name);
        break;
    }

    const userFieldTypes = await query;

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