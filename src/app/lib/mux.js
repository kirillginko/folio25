import Mux from "@mux/mux-node";

// Initialize Mux client (server-side only)
export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

/**
 * Upload a video to Mux from a URL
 * @param {string} videoUrl - The URL of the video to upload
 * @param {object} metadata - Optional metadata for the video
 * @returns {Promise<object>} - The created asset
 */
export async function uploadVideoFromUrl(videoUrl, metadata = {}) {
  try {
    const asset = await mux.video.assets.create({
      input: [{ url: videoUrl }],
      playback_policy: ["public"],
      mp4_support: "standard",
      aspect_ratio: "16:9",
      ...metadata,
    });

    return asset;
  } catch (error) {
    console.error("Error uploading video to Mux:", error);
    throw error;
  }
}

/**
 * Create a direct upload URL for uploading videos from the client
 * @returns {Promise<object>} - Upload URL and ID
 */
export async function createDirectUpload() {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        mp4_support: "standard",
        aspect_ratio: "16:9",
      },
      cors_origin: "*", // Change this to your domain in production
    });

    return {
      uploadUrl: upload.url,
      uploadId: upload.id,
    };
  } catch (error) {
    console.error("Error creating direct upload:", error);
    throw error;
  }
}

/**
 * Get asset information including playback ID
 * @param {string} assetId - The Mux asset ID
 * @returns {Promise<object>} - Asset details
 */
export async function getAsset(assetId) {
  try {
    const asset = await mux.video.assets.retrieve(assetId);
    return asset;
  } catch (error) {
    console.error("Error retrieving asset:", error);
    throw error;
  }
}

/**
 * Get playback ID from asset
 * @param {string} assetId - The Mux asset ID
 * @returns {Promise<string>} - Playback ID
 */
export async function getPlaybackId(assetId) {
  try {
    const asset = await getAsset(assetId);
    return asset.playback_ids?.[0]?.id || null;
  } catch (error) {
    console.error("Error getting playback ID:", error);
    throw error;
  }
}

/**
 * Delete an asset from Mux
 * @param {string} assetId - The Mux asset ID
 * @returns {Promise<void>}
 */
export async function deleteAsset(assetId) {
  try {
    await mux.video.assets.delete(assetId);
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
}
