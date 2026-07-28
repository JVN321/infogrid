import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET all General News items
export async function GET() {
  try {
    const generalNews = await prisma.generalNewsItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(generalNews);
  } catch (error: any) {
    console.error("Prisma GET /api/general-news Error:", error.message);
    return NextResponse.json({ error: error.message, isDbError: true }, { status: 500 });
  }
}

// POST create new General News item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tag, tagColor, title, description, date, image, source, url } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const item = await prisma.generalNewsItem.create({
      data: {
        tag: tag || "GLOBAL",
        tagColor: tagColor || "purple",
        title,
        description,
        date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        image: image || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
        source: source || "Global News",
        url: url || "#",
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Prisma POST /api/general-news Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update existing General News item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, tag, tagColor, title, description, date, image, source, url } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const updated = await prisma.generalNewsItem.update({
      where: { id },
      data: {
        tag,
        tagColor,
        title,
        description,
        date,
        image,
        source,
        url,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma PUT /api/general-news Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE general news item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await prisma.generalNewsItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Prisma DELETE /api/general-news Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
