import sqlite3
import os
import sys
from datetime import datetime

# 1. Thêm thư mục backend vào path để import đúng hàm hash của Backend
backend_path = os.path.join(os.path.dirname(__file__), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash("123456")

# 2. Kết nối trực tiếp DB của Backend
db_path = os.path.join("backend", "sql_app.db")
if not os.path.exists(db_path):
    db_path = "sql_app.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users)")
cols_info = cursor.fetchall()
col_names = [col[1] for col in cols_info]

pwd_col = "password_hash"

# Xóa user cũ
cursor.execute("DELETE FROM users WHERE username = 'mentor01'")

now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
data = {
    "username": "mentor01",
    pwd_col: hashed_password
}

if "role" in col_names:
    data["role"] = "mentor"
if "full_name" in col_names:
    data["full_name"] = "Mentor 01"
if "email" in col_names:
    data["email"] = "mentor01@gmail.com"
if "is_active" in col_names:
    data["is_active"] = 1
if "created_at" in col_names:
    data["created_at"] = now_str
if "updated_at" in col_names:
    data["updated_at"] = now_str

cols_str = ", ".join(data.keys())
val_str = ", ".join(["?"] * len(data))

cursor.execute(f"INSERT INTO users ({cols_str}) VALUES ({val_str})", list(data.values()))
conn.commit()
conn.close()

print(">>> HOÀN TẤT ĐỒNG BỘ MENTOR01 CÙNG BACKEND! <<<")