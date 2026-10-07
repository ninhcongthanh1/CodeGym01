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
export async function getMyNotifications(token) {
  const response = await fetch(`${API_URL}/api/notifications/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông báo");
  }

  return response.json();
}

export async function markNotificationRead(token, id) {
  const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể đánh dấu đã đọc");
  }

  return response.json();
}

export async function markAllNotificationsRead(token) {
  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể đánh dấu đã đọc tất cả");
  }

  return response.json();
}