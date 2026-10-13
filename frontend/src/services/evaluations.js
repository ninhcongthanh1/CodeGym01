const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}`, ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(e => `${e.loc?.at(-1) || 'Dữ liệu'}: ${e.msg}`).join('; ') : 'Không kết nối được với máy chủ';
    throw new Error(response.status === 401 ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' : message);
  }
  return data;
}
export const getAssignedInterns = () => request('/api/mentor/interns');
export const saveEvaluation = (internId, payload) => request(`/api/mentor/evaluations/${internId}`, { method: 'PUT', body: JSON.stringify(payload) });
