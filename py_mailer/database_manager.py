import psycopg2

class DatabaseManager:
    def __init__(self, db_name, db_user, db_password, tunnel):
        self.db_name = db_name
        self.db_user = db_user
        self.db_password = db_password
        self.tunnel = tunnel
        self.conn = None

    def connect(self):
        self.conn = psycopg2.connect(
            database=self.db_name,
            user=self.db_user,
            password=self.db_password,
            host='localhost',
            port=self.tunnel.local_bind_port
        )

    def close_connection(self):
        if self.conn:
            self.conn.close()
