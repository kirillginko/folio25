# Mux Video Integration Guide

## ⚠️ SECURITY WARNING
**Your Mux credentials were shared publicly. IMMEDIATELY:**
1. Go to https://dashboard.mux.com/settings/access-tokens
2. Delete the exposed token: `94948b8d-8643-4cdf-9135-c78fe41587dd`
3. Create a new token with limited permissions
4. Update `.env.local` with the new credentials

## Setup Complete ✅

The following has been configured:

### 1. Dependencies Installed
- `@mux/mux-node` - Server-side Mux SDK
- `@mux/mux-player-react` - React video player component

### 2. Environment Variables (`.env.local`)
```env
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
```

### 3. Mux Utility (`src/app/lib/mux.js`)
Helper functions for:
- `uploadVideoFromUrl()` - Upload video from URL
- `createDirectUpload()` - Get upload URL for client-side uploads
- `getAsset()` - Retrieve asset details
- `getPlaybackId()` - Get playback ID
- `deleteAsset()` - Delete an asset

### 4. API Route (`src/app/api/mux/upload/route.js`)
- POST `/api/mux/upload` - Creates a direct upload URL

### 5. ImageGallery Component Updated
Now supports three media types:
- `type: "image"` - Standard images
- `type: "video"` - Regular HTML5 videos
- `type: "mux"` - Mux videos with 16:9 aspect ratio

## How to Add a Mux Video

### Option 1: Upload a Video to Mux

1. **Upload video from URL:**
```javascript
import { uploadVideoFromUrl } from '@/app/lib/mux';

const asset = await uploadVideoFromUrl('https://example.com/video.mp4', {
  // Optional metadata
});

console.log('Playback ID:', asset.playback_ids[0].id);
```

2. **Or use direct upload (from client):**
```javascript
// Client-side: Get upload URL
const response = await fetch('/api/mux/upload', { method: 'POST' });
const { uploadUrl, uploadId } = await response.json();

// Upload your video file to the uploadUrl
// Then wait for Mux to process it
```

### Option 2: Add to ImageGallery

Once you have a Mux playback ID, add it to `src/app/images.js`:

```javascript
{
  id: 18,
  playbackId: "YOUR_MUX_PLAYBACK_ID", // Replace with actual playback ID
  title: "Your Video Title",
  description: "Video description",
  year: 2025,
  technologies: "Mux, Video Streaming",
  link: "",
  type: "mux",
  aspectRatio: "16:9", // Default is 16:9
}
```

## Using the Mux Dashboard

1. Go to https://dashboard.mux.com
2. Upload videos directly or use the API
3. Get playback IDs from the Assets section
4. Monitor video analytics and performance

## Aspect Ratio Support

The MuxPlayer in ImageGallery supports:
- **16:9** (default) - Widescreen
- **4:3** - Standard
- **1:1** - Square
- **9:16** - Vertical/Mobile

Specify in the image object:
```javascript
aspectRatio: "16:9"
```

## Features

When expanded, Mux videos will:
- ✅ Auto-play with sound
- ✅ Loop continuously
- ✅ Maintain 16:9 aspect ratio
- ✅ Adaptive bitrate streaming
- ✅ Optimized delivery

When minimized:
- ✅ Muted playback on hover
- ✅ Square thumbnail (200x200)
- ✅ Low bandwidth usage

## Next Steps

1. **Rotate your Mux credentials** (see Security Warning above)
2. Upload your first video to Mux
3. Get the playback ID
4. Replace `YOUR_MUX_PLAYBACK_ID_HERE` in `images.js`
5. Test the gallery!

## Troubleshooting

**Video not playing:**
- Check that the playback ID is correct
- Ensure the asset is "ready" in Mux dashboard
- Verify playback policy is set to "public"

**Player not showing:**
- Check browser console for errors
- Verify `@mux/mux-player-react` is installed
- Make sure `type: "mux"` is set correctly

## Resources

- [Mux Dashboard](https://dashboard.mux.com)
- [Mux Docs](https://docs.mux.com)
- [Mux Player React](https://github.com/muxinc/elements/tree/main/packages/mux-player-react)
