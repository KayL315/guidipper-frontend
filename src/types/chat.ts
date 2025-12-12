export interface ChatMessage {
  id: number;
  chat_session_id: number;
  role: 'user' | 'assistant';
  content: string;
  diff_content?: string | null;
  chat_message?: string | null;
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  generated_route_id: number | null;
  created_at: string;
  updated_at: string;
  route_text?: string | null;
}

export interface ChatSessionWithRoute extends ChatSession {
  route_text: string | null;
}

export interface SendMessageRequest {
  content: string;
  route_text?: string;
}

export interface CreateSessionRequest {
  generated_route_id?: number | null;
  route_text?: string;
}

export interface AIResponse {
  chat_message: string;
  diff?: string | null;
}

export interface ApplyDiffRequest {
  message: string;
  updated_route_text: string;
}
