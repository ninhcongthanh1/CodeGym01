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

// Bổ sung hàm cho COD-28: Phân công mentor cho thực tập sinh
export async function assignMentor(token, internId, mentorId) {
  const response = await fetch(`${API_URL}/api/interns/${internId}/assign-mentor?mentor_id=${mentorId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể phân công mentor cho thực tập sinh");
  }

  return response.json();
}

// Bổ sung hàm cho COD-33: Lấy thống kê khối lượng công việc (workload) của mentor
export async function getMentorsWorkload(token) {
  const response = await fetch(`${API_URL}/api/interns/mentors/workload`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông tin khối lượng công việc của mentor");
  }

  return response.json();
}