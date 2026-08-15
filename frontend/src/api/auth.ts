const API_BASE_URL = 'http://127.0.0.1:8001'

interface LoginResponse {
  access_token: string
  token_type: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Login failed')
  }

  return response.json()
}

interface SignupResponse {
  id: number
  username: string
  email: string
}

export async function signup(
  username: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Signup failed')
  }

  return response.json()
}