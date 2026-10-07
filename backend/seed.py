from getpass import getpass

from database import SessionLocal
from models.user import User
from services.auth_service import hash_password


DEMO_USERS = [
    {
        "username": "admin01",
        "email": "admin01@example.com",
        "full_name": "System Administrator",
        "role": "admin"
    },
    {
        "username": "hr01",
        "email": "hr01@example.com",
        "full_name": "HR User",
        "role": "hr"
    },
    {
        "username": "mentor01",
        "email": "mentor01@example.com",
        "full_name": "Mentor User",
        "role": "mentor"
    },
    {
        "username": "intern01",
        "email": "intern01@example.com",
        "full_name": "Intern User",
        "role": "intern"
    }
]


def seed_users():
    db = SessionLocal()

    try:
        print("=== Create demo users ===")

        for user_data in DEMO_USERS:
            existing_user = db.query(User).filter(
                User.username == user_data["username"]
            ).first()

            if existing_user:
                print(
                    f"{user_data['username']} already exists. Skipping."
                )
                continue

            password = getpass(
                f"Enter password for {user_data['username']}: "
            )

            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=hash_password(password),
                full_name=user_data["full_name"],
                role=user_data["role"],
                is_active=True
            )

            db.add(user)

        db.commit()

        print("Demo users created successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()