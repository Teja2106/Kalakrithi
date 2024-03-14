from sshtunnel import SSHTunnelForwarder

class SSHTunnelManager:
    def __init__(self, ssh_host, ssh_port, ssh_username, ssh_password, db_host, db_port):
        self.ssh_host = ssh_host
        self.ssh_port = ssh_port
        self.ssh_username = ssh_username
        self.ssh_password = ssh_password
        self.db_host = db_host
        self.db_port = db_port
        self.tunnel = None

    def create_tunnel(self):
        self.tunnel = SSHTunnelForwarder(
            (self.ssh_host, self.ssh_port),
            ssh_username=self.ssh_username,
            ssh_password=self.ssh_password,
            remote_bind_address=(self.db_host, self.db_port)
        )
        self.tunnel.start()

    def close_tunnel(self):
        if self.tunnel:
            self.tunnel.stop()
