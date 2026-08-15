const API_BASE_URL = 'http://127.0.0.1:8001'

export interface WardrobeItem {
  id: number
  name: string
  category: string
  color: string
  user_id: number
}

export async function getWardrobeItems(token: string): Promise<WardrobeItem[]> {
  const response = await fetch(`${API_BASE_URL}/wardrobe`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch wardrobe items')
  }
  return response.json()
}

export async function addWardrobeItem(
  token: string,
  item: { name: string; category: string; color: string }
): Promise<WardrobeItem> {
  const response = await fetch(`${API_BASE_URL}/wardrobe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  })

  if (!response.ok) {
    throw new Error('Failed to add wardrobe item')
  }

  return response.json()
}