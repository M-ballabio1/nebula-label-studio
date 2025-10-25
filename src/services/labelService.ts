import { Label } from "@/types/annotation";
import { apiService } from "./api";
import { API_CONFIG } from "@/config/apiConfig";
import { INITIAL_LABELS } from "@/config/sampleData";

export interface CreateLabelDto {
  name: string;
  color: string;
  hotkey?: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
  hotkey?: string;
}

class LabelService {
  async getLabels(): Promise<Label[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return INITIAL_LABELS;
    }

    return apiService.get<Label[]>(API_CONFIG.ENDPOINTS.LABELS);
  }

  async getLabelById(id: string): Promise<Label> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const label = INITIAL_LABELS.find((l) => l.id === id);
      if (!label) throw new Error(`Label ${id} not found`);
      return label;
    }

    return apiService.get<Label>(API_CONFIG.ENDPOINTS.LABEL_BY_ID(id));
  }

  async createLabel(data: CreateLabelDto): Promise<Label> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return {
        id: `label-${Date.now()}`,
        ...data,
      };
    }

    return apiService.post<Label>(API_CONFIG.ENDPOINTS.LABELS, data);
  }

  async updateLabel(id: string, data: UpdateLabelDto): Promise<Label> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const label = INITIAL_LABELS.find((l) => l.id === id);
      if (!label) throw new Error(`Label ${id} not found`);
      return { ...label, ...data };
    }

    return apiService.patch<Label>(API_CONFIG.ENDPOINTS.LABEL_BY_ID(id), data);
  }

  async deleteLabel(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return;
    }

    return apiService.delete<void>(API_CONFIG.ENDPOINTS.LABEL_BY_ID(id));
  }
}

export const labelService = new LabelService();
