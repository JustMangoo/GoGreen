import { supabase } from "../lib/supabaseClient";

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'method-images')
 * @returns The public URL of the uploaded image
 */
export async function uploadMethodImage(
  file: File,
  bucket: string = "method-images"
): Promise<string> {
  // Generate unique filename to avoid collisions
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full URL of the image to delete
 * @param bucket - The storage bucket name
 */
export async function deleteMethodImage(
  imageUrl: string,
  bucket: string = "method-images"
): Promise<void> {
  // Extract the file path from the URL
  const urlParts = imageUrl.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) {
    throw new Error("Invalid image URL format");
  }
  const filePath = urlParts[1];

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

/**
 * Update method with new image - uploads new image and optionally deletes old one
 */
export async function updateMethodImage(
  methodId: string,
  newImageFile: File,
  oldImageUrl?: string
): Promise<string> {
  // Upload new image
  const newImageUrl = await uploadMethodImage(newImageFile);

  // Update method record
  const { error: updateError } = await supabase
    .from("methods")
    .update({ image_url: newImageUrl })
    .eq("id", methodId);

  if (updateError) {
    // If update fails, clean up the uploaded image
    await deleteMethodImage(newImageUrl).catch(console.error);
    throw updateError;
  }

  // Delete old image if it exists and is from Supabase Storage
  if (oldImageUrl && oldImageUrl.includes("supabase")) {
    await deleteMethodImage(oldImageUrl).catch(console.error);
  }

  return newImageUrl;
}
