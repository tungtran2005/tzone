import client from './client';
import type { AIChatRequest, AIChatResponse, ApiResponse } from '../types';

export const aiApi = {
  chat: (payload: AIChatRequest) =>
    client.post<ApiResponse<AIChatResponse>>('/api/v1/ai/chat', payload),
};

