import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const IMAGES_BUCKET = "article-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Fallback to use data URLs for development
const useDataUrl = true;

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be less than 5MB");
      return null;
    }

    // For development: use FileReader to create data URL
    if (useDataUrl || !import.meta.env.VITE_SUPABASE_URL) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          toast.success("Image loaded successfully");
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          toast.error("Failed to load image");
          reject(new Error("Failed to load image"));
        };
        reader.readAsDataURL(file);
      });
    }

    // If Supabase storage is available, try to upload
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `${timestamp}-${randomString}.${extension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(IMAGES_BUCKET)
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.warn("Supabase storage error:", error);
        // Fallback to data URL if upload fails
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            toast.success("Image loaded (stored locally)");
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            reject(new Error("Failed to load image"));
          };
          reader.readAsDataURL(file);
        });
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(IMAGES_BUCKET)
        .getPublicUrl(data.path);

      toast.success("Image uploaded successfully");
      return publicData.publicUrl;
    } catch (storageError) {
      console.warn("Storage upload error:", storageError);
      // Fallback to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          toast.success("Image loaded (stored locally)");
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        reader.readAsDataURL(file);
      });
    }
  } catch (error) {
    console.error("Image handling error:", error);
    toast.error("Failed to process image");
    return null;
  }
};
