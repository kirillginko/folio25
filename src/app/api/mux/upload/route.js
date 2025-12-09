import { NextResponse } from "next/server";
import { createDirectUpload } from "../../../lib/mux";

/**
 * POST /api/mux/upload
 * Create a direct upload URL for client-side video uploads
 */
export async function POST() {
  try {
    const { uploadUrl, uploadId } = await createDirectUpload();

    return NextResponse.json({
      uploadUrl,
      uploadId,
    });
  } catch (error) {
    console.error("Error creating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
