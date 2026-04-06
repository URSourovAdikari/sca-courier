import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary };
export type { UploadApiResponse, UploadApiErrorResponse }

// New helper function to delete images
export async function deleteImageFromCloudinary(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;
  
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234/cake_categories/image.jpg
    // Result: cake_categories/image
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return false;
    
    // Get everything after 'upload/v1234567/' or 'upload/'
    const pathParts = parts.slice(uploadIndex + 1);
    // Remove version if present (v1234567)
    const startIndex = pathParts[0].startsWith('v') ? 1 : 0;
    const publicIdWithExt = pathParts.slice(startIndex).join('/');
    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^.]+$/, '');
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return false;
  }
}