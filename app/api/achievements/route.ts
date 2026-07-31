import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET all Achievement items
export async function GET() {
  try {
    const achievements = await prisma.achievementItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(achievements);
  } catch (error: any) {
    console.error("Prisma GET /api/achievements Error:", error.message);
    return NextResponse.json({ error: error.message, isDbError: true }, { status: 500 });
  }
}

// POST create new Achievement item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { badgeType, title, description, date, image } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievementItem.create({
      data: {
        badgeType: badgeType || "trophy",
        title,
        description,
        date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        image: image || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error: any) {
    console.error("Prisma POST /api/achievements Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update existing Achievement item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, badgeType, title, description, date, image } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const updated = await prisma.achievementItem.update({
      where: { id },
      data: {
        badgeType,
        title,
        description,
        date,
        image,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma PUT /api/achievements Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE achievement item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (all === "true") {
      await prisma.achievementItem.deleteMany({});
      return NextResponse.json({ success: true, count: "all" });
    }

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await prisma.achievementItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Prisma DELETE /api/achievements Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
