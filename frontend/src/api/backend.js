const BASE_URL = import.meta.env.VITE_API_URL || 'https://dry-beans-end-to-end.onrender.com';

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Backend no disponible');
  return res.json();
}

export async function trainModel() {
  const res = await fetch(`${BASE_URL}/train`, { method: 'POST' });
  if (!res.ok) throw new Error(`Error ${res.status} al entrenar el modelo`);
  return res.json();
}
