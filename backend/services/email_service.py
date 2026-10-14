import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_meeting_email(to_email: str, intern_name: str, meeting_title: str, meeting_time: str, meeting_link: str = ""):
    """
    Hàm gửi email tự động thông báo lịch họp cho thực tập sinh
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_email = os.getenv("SMTP_USER", "your-email@gmail.com")
    sender_password = os.getenv("SMTP_PASSWORD", "your-app-password")

    # Nội dung email
    subject = f"[CodeGym] Thông báo lịch họp mới: {meeting_title}"
    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2b6cb0;">Xin chào {intern_name},</h2>
        <p>Hệ thống xin thông báo bạn có một lịch họp mới được xếp như sau:</p>
        <ul>
          <li><strong>Tên buổi họp:</strong> {meeting_title}</li>
          <li><strong>Thời gian:</strong> {meeting_time}</li>
          {f'<li><strong>Link cuộc họp:</strong> <a href="{meeting_link}">{meeting_link}</a></li>' if meeting_link else ''}
        </ul>
        <p>Vui lòng sắp xếp thời gian tham gia đúng giờ.</p>
        <br>
        <p>Trân trọng,<br><strong>Ban quản lý thực tập CodeGym</strong></p>
      </body>
    </html>
    """

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, message.as_string())
        server.quit()
        print(f"-> Đã gửi email thành công cho: {to_email}")
        return True
    except Exception as e:
        print(f"-> Lỗi khi gửi email: {e}")
        return False