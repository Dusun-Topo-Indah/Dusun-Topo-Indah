import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const secret = searchParams.get("secret");

    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (!tag) {
      return NextResponse.json({ message: "Missing tag param" }, { status: 400 });
    }

    revalidateTag(tag, "max");

    if (tag === "global-config" || tag === "berita" || tag === "galeri") {
       revalidateTag("homepage-data", "max");
       revalidateTag("dashboard-stats", "max");
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error("Revalidation Error:", error);
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
