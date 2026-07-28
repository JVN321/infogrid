import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events - Retrieve all events from database
export async function GET() {
  try {
    const events = await prisma.eventItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(events);
  } catch (error: any) {
    console.error("GET /api/events DB error:", error.message);
    return NextResponse.json(
      { error: "Database not reachable", details: error.message },
      { status: 503 }
    );
  }
}

// POST /api/events - Create new event (or batch import)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if body is an array for batch insertion
    if (Array.isArray(body)) {
      const createdEvents = [];
      for (const item of body) {
        // Redundancy check: skip if externalId already exists
        if (item.externalId) {
          const existing = await prisma.eventItem.findUnique({
            where: { externalId: item.externalId },
          });
          if (existing) continue;
        }

        const newEvent = await prisma.eventItem.create({
          data: {
            externalId: item.externalId || null,
            badge: item.badge || "Event",
            title: item.title,
            tagline: item.tagline || "",
            description: item.description || "",
            dateRange: item.dateRange || "",
            date: item.date || "",
            day: item.day || "",
            month: item.month || "",
            time: item.time || "",
            venue: item.venue || "",
            category: item.category || "Event",
            color: item.color || "blue",
            categoryBadgeBg: item.categoryBadgeBg || "bg-blue-50 text-blue-600 border-blue-200",
            image: item.image || "",
            ctaText: item.ctaText || "Register Now",
            ctaLink: item.ctaLink || "#",
            isFeatured: item.isFeatured || false,
            isRegistrationRequired: item.isRegistrationRequired !== false,
          },
        });
        createdEvents.push(newEvent);
      }

      return NextResponse.json(
        { success: true, count: createdEvents.length, events: createdEvents },
        { status: 201 }
      );
    }

    // Single item creation
    if (body.externalId) {
      const existing = await prisma.eventItem.findUnique({
        where: { externalId: body.externalId },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Event already exists in database", existing },
          { status: 409 }
        );
      }
    }

    const newEvent = await prisma.eventItem.create({
      data: {
        externalId: body.externalId || null,
        badge: body.badge || "Event",
        title: body.title,
        tagline: body.tagline || "",
        description: body.description || "",
        dateRange: body.dateRange || "",
        date: body.date || "",
        day: body.day || "",
        month: body.month || "",
        time: body.time || "",
        venue: body.venue || "",
        category: body.category || "Event",
        color: body.color || "blue",
        categoryBadgeBg: body.categoryBadgeBg || "bg-blue-50 text-blue-600 border-blue-200",
        image: body.image || "",
        ctaText: body.ctaText || "Register Now",
        ctaLink: body.ctaLink || "#",
        isFeatured: body.isFeatured || false,
        isRegistrationRequired: body.isRegistrationRequired !== false,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events DB error:", error.message);
    return NextResponse.json(
      { error: "Failed to create event item", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/events - Update existing event
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    const updated = await prisma.eventItem.update({
      where: { id: body.id },
      data: {
        badge: body.badge,
        title: body.title,
        tagline: body.tagline,
        description: body.description,
        dateRange: body.dateRange,
        date: body.date,
        day: body.day,
        month: body.month,
        time: body.time,
        venue: body.venue,
        category: body.category,
        color: body.color,
        categoryBadgeBg: body.categoryBadgeBg,
        image: body.image,
        ctaText: body.ctaText,
        ctaLink: body.ctaLink,
        isFeatured: body.isFeatured,
        isRegistrationRequired: body.isRegistrationRequired,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/events DB error:", error.message);
    return NextResponse.json(
      { error: "Failed to update event item", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/events?id=XYZ - Delete event
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    await prisma.eventItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("DELETE /api/events DB error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete event item", details: error.message },
      { status: 500 }
    );
  }
}
