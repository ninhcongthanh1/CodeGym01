const API_URL = "http://127.0.0.1:8000";

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
export const getMySchedules = async () => {
  const response = await api.get('/schedules/my-schedule');
  return response.data;
};