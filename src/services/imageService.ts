import { ImageItem } from "@/types/annotation";
import { apiService } from "./api";
import { API_CONFIG } from "@/config/apiConfig";
import { SAMPLE_IMAGES } from "@/config/sampleData";

export interface ImageUploadResponse {
  id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
}

export interface ImageListParams {
  page?: number;
  limit?: number;
  annotated?: boolean | null;
  labelIds?: string[];
}

export interface ImageListResponse {
  images: ImageItem[];
  total: number;
  page: number;
  limit: number;
}

class ImageService {
  async getImages(params?: ImageListParams): Promise<ImageListResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      return {
        images: SAMPLE_IMAGES,
        total: SAMPLE_IMAGES.length,
        page: params?.page || 1,
        limit: params?.limit || 50,
      };
    }

    return apiService.get<ImageListResponse>(API_CONFIG.ENDPOINTS.IMAGES, params);
  }

  async getImageById(id: string): Promise<ImageItem> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const image = SAMPLE_IMAGES.find((img) => img.id === id);
      if (!image) throw new Error(`Image ${id} not found`);
      return image;
    }

    return apiService.get<ImageItem>(API_CONFIG.ENDPOINTS.IMAGE_BY_ID(id));
  }

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      const url = URL.createObjectURL(file);
      return {
        id: `img-${Date.now()}`,
        url,
        thumbnailUrl: url,
        name: file.name,
      };
    }

    const formData = new FormData();
    formData.append("file", file);

    return apiService.upload<ImageUploadResponse>(
      API_CONFIG.ENDPOINTS.IMAGE_UPLOAD,
      formData
    );
  }

  async deleteImage(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      return;
    }

    return apiService.delete<void>(API_CONFIG.ENDPOINTS.IMAGE_BY_ID(id));
  }

  async updateImage(id: string, data: Partial<ImageItem>): Promise<ImageItem> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      const image = SAMPLE_IMAGES.find((img) => img.id === id);
      if (!image) throw new Error(`Image ${id} not found`);
      return { ...image, ...data };
    }

    return apiService.patch<ImageItem>(API_CONFIG.ENDPOINTS.IMAGE_BY_ID(id), data);
  }
}

export const imageService = new ImageService();
