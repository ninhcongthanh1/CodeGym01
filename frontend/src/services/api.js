const API_URL = import.meta.env.VITE_API_URL || "";

export async function getInterns(token) {
  const response = await fetch(`${API_URL}/api/interns/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách thực tập sinh");
  }

  return response.json();
}