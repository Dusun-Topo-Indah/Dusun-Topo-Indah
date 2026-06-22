import "server-only";
import crypto from "crypto";

export async function deleteFromCloudinary(secureUrl: string): Promise<boolean> {
  if (!secureUrl || !secureUrl.includes("cloudinary.com")) return false;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary API credentials missing. Cannot delete image.");
    return false;
  }

  try {
    const uploadIndex = secureUrl.indexOf("/upload/");
    if (uploadIndex === -1) return false;
    
    const afterUpload = secureUrl.substring(uploadIndex + 8);
    const versionMatch = afterUpload.match(/^v\d+\//);
    const pathWithoutVersion = versionMatch ? afterUpload.substring(versionMatch[0].length) : afterUpload;
    
    const lastDotIndex = pathWithoutVersion.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 ? pathWithoutVersion.substring(0, lastDotIndex) : pathWithoutVersion;

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.result === "ok";
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return false;
  }
}
