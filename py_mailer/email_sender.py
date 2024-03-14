import smtplib
from email.mime.multipart import MIMEMultipart

class EmailSender:
    def __init__(self, smtp_server, smtp_port, sender_email, sender_password):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = sender_email
        self.sender_password = sender_password
        self.server = smtplib.SMTP(self.smtp_server, self.smtp_port)

    def send_email(self, recipient_email, msg):
        self.server.starttls()
        self.server.login(self.sender_email, self.sender_password)
        self.server.sendmail(self.sender_email, recipient_email, msg.as_string())

    def close(self):
        self.server.quit()
