import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET all News items
export async function GET() {
  try {
    const news = await prisma.newsItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(news);
  } catch (error: any) {
    console.error("Prisma GET /api/news Error:", error.message);
    return NextResponse.json({ error: error.message, isDbError: true }, { status: 500 });
  }
}

// POST create new News item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tag, tagColor, title, description, date, image } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const news = await prisma.newsItem.create({
      data: {
        tag: tag || "NEW",
        tagColor: tagColor || "blue",
        title,
        description,
        date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        image: image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error: any) {
    console.error("Prisma POST /api/news Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update existing News item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, tag, tagColor, title, description, date, image } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const updated = await prisma.newsItem.update({
      where: { id },
      data: {
        tag,
        tagColor,
        title,
        description,
        date,
        image,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma PUT /api/news Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE news item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await prisma.newsItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Prisma DELETE /api/news Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
