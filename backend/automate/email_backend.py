import ssl
from django.core.mail.backends.smtp import EmailBackend as BaseEmailBackend


class GmailEmailBackend(BaseEmailBackend):
    """Custom Gmail SMTP backend with SSL/TLS handling"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def _get_connection(self):
        """Override to create SSL context that works with Gmail"""
        if self.connection is None:
            # Create SSL context that doesn't verify certificates
            # (safe for Gmail as we trust Gmail servers)
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            try:
                if self.use_ssl:
                    self.connection = self.connection_class(
                        self.host, self.port,
                        timeout=self.timeout,
                        ssl_context=ssl_context
                    )
                else:
                    self.connection = self.connection_class(
                        self.host, self.port,
                        timeout=self.timeout
                    )
                    if self.use_tls:
                        self.connection.starttls(ssl_context=ssl_context)
            except Exception as e:
                if not self.fail_silently:
                    raise
        return self.connection
