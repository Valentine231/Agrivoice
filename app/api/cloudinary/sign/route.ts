import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary hands you one connection string that already contains your
 * cloud name, API key, and API secret:
 *
 *   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 *
 * Rather than relying on the SDK's implicit "it'll pick up CLOUDINARY_URL on
 * its own" behavior (easy to silently get wrong), we parse it ourselves once
 * and pass the pieces to cloudinary.config() explicitly.
 */
function configureCloudinary() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    throw new Error("CLOUDINARY_URL is not set — add it to .env.local");
  }

  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  const match = url.match(/^cloudinary:\/\/(\d+):([^@]+)@(.+)$/);
  if (!match) {
    throw new Error("CLOUDINARY_URL is not in the expected cloudinary://key:secret@cloud_name format");
  }
  const [, apiKey, apiSecret, cloudName] = match;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return { apiKey, apiSecret, cloudName };
}

/**
 * The browser never sees the Cloudinary API secret. It asks this route for a
 * one-time signature, then uploads the image directly to Cloudinary using that
 * signature. Only the resulting secure_url gets saved to our own database —
 * the image bytes themselves never pass through our server or DB.
 */
export async function POST() {
  let creds;
  try {
    creds = configureCloudinary();
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "agrilink/harvests";

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, creds.apiSecret);

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    apiKey: creds.apiKey,
    cloudName: creds.cloudName,
  });
}
