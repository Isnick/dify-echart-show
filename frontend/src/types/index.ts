export interface AuthResponse {
  token: string
  username: string
}

export interface LoginRequest {
  username: string
  password: string
  rememberMe: boolean
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface ChartRequest {
  prompt: string
}

export interface ChartStreamResult {
  fullText: string
  finalAnswer: string
}

export interface ChartResponse {
  echartConfig: Record<string, unknown>
}
