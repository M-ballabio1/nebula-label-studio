import { useState, useEffect } from "react";
import { ImageItem } from "@/types/annotation";
import { imageService, ImageListParams } from "@/services/imageService";
import { toast } from "sonner";

export const useImages = (params?: ImageListParams) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await imageService.getImages(params);
      setImages(response.images);
      setTotal(response.total);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch images");
      setError(error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [JSON.stringify(params)]);

  const uploadImage = async (file: File): Promise<ImageItem | null> => {
    try {
      const uploadResponse = await imageService.uploadImage(file);
      const newImage: ImageItem = {
        id: uploadResponse.id,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        name: uploadResponse.name,
        annotations: { boxes: [], polygons: [], tags: [] },
      };
      setImages((prev) => [...prev, newImage]);
      toast.success("Image uploaded successfully");
      return newImage;
    } catch (err) {
      toast.error("Failed to upload image");
      return null;
    }
  };

  const deleteImage = async (id: string): Promise<boolean> => {
    try {
      await imageService.deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete image");
      return false;
    }
  };

  const updateImage = async (
    id: string,
    data: Partial<ImageItem>
  ): Promise<boolean> => {
    try {
      const updated = await imageService.updateImage(id, data);
      setImages((prev) => prev.map((img) => (img.id === id ? updated : img)));
      return true;
    } catch (err) {
      toast.error("Failed to update image");
      return false;
    }
  };

  return {
    images,
    setImages,
    loading,
    error,
    total,
    uploadImage,
    deleteImage,
    updateImage,
    refetch: fetchImages,
  };
};
