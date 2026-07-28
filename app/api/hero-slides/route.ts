import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: {
        orderIndex: 'asc'
      }
    });
    return NextResponse.json(slides);
  } catch (error: any) {
    console.error("Hero Slides API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slide = await prisma.heroSlide.create({
      data: {
        welcomeText: body.welcomeText || "Welcome to",
        titleHighlight: body.titleHighlight || "InfoGrid",
        tagline: body.tagline || "Stay informed. Stay inspired.",
        image: body.image || "",
        orderIndex: body.orderIndex || 0,
      }
    });
    return NextResponse.json(slide);
  } catch (error: any) {
    console.error("Hero Slides Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.heroSlide.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Hero Slides Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }
    const slide = await prisma.heroSlide.update({
      where: { id: body.id },
      data: {
        welcomeText: body.welcomeText,
        titleHighlight: body.titleHighlight,
        tagline: body.tagline,
        image: body.image,
        orderIndex: body.orderIndex,
      }
    });
    return NextResponse.json(slide);
  } catch (error: any) {
    console.error("Hero Slides Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
