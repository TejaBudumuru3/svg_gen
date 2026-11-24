import { NextResponse } from "next/server";
import { processConcept } from "@/app/lib/pipeline";

export const maxDuration = 60;

export async function POST(req: Request) {
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body || typeof body.title !== "string" || typeof body.text !== "string") {
        return NextResponse.json({ error: "Title and text are required strings" }, { status: 400 });
    }

    const title = body.title.trim();
    const text = body.text.trim();
    const details = typeof body.details === "string" ? body.details.trim() : undefined;

    if (!title || !text) {
        return NextResponse.json({ error: "Title and text cannot be empty" }, { status: 400 });
    }

    if (title.length > 60 || text.length > 400) {
        return NextResponse.json(
            { error: "Title must be up to 60 characters and text up to 400 characters" },
            { status: 400 }
        );
    }

    try {
        const result = await processConcept({
            id: 0,
            title,
            text,
            details,
        });
        return NextResponse.json(result, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? "Generation failed" }, { status: 502 });
    }
}
