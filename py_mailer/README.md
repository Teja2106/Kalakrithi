## Mail Merge + Ticket Generator

The `main.py` application, when run, pulls the names and emails in a given PostgreSQL database and sends them emails, with an attached QR Code ticket.

The template of the ticket can be easily modified by replacing the foreground.png file with the tempate of your choice and modifying the `ticket_editor.py` code to adjust the positioning of the QR code on the template.

Do note that this program requires a `.env` file in the below template to work.

```apache
server=
port=
sender_email=
password=

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
TABLE_NAME=

USE_SSH_TUNNEL = False

SSH_HOST=
SSH_PORT=
SSH_USERNAME=
SSH_PASSWORD=

SUBJECT=Your Ticket is here!
```

This code is an email automation script that fetches data from a PostgreSQL database, generates a QR code for each recipient, and sends a personalized email with the QR code attached. Here's a breakdown of the code:

1. Import required libraries:
   * `os`: Provides functions for interacting with the operating system.
   * `jinja2`: A templating engine for Python.
   * `smtplib`: A library for sending emails using SMTP.
   * `dotenv`: A library for loading environment variables from a .env file.
   * `email`: A library for creating email messages.
   * `qrcode`: A library for generating QR codes.
   * `pandas`: A library for data manipulation and analysis.
   * `hashlib`: A library for cryptographic hashing in Python.
   * `psycopg2`: A PostgreSQL adapter for Python.
   * `photoeditor`: A custom library for editing QR code images (not a standard Python library).
2. Load environment variables from the .env file, including email credentials, SMTP server information, and database connection details.
3. Connect to the PostgreSQL database and create a cursor object.
4. Load the Jinja2 template for the email.
5. Execute a query to fetch the `name`, `email`, and `txn_id` columns from the specified table in the database.
6. Iterate over the rows and process each recipient:
   * Encrypt the recipient's email using SHA-256.
   * Update the `hashed_email` column in the specified table for the recipient.
   * Render the HTML template with the recipient's name and txn_id.
   * Create a message container for the email.
   * Attach the HTML content to the email.
   * Generate a QR code image with the recipient's hashed email.
   * Save the QR code image to a temporary file and edit it using the `ticket_editor` library.
   * Attach the QR code image to the email as a file.
   * Attach the edited QR code image to the email as an embedded image.
   * Connect to the SMTP server and send the email.
7. Close the cursor and the database connection.

This script is useful for sending personalized emails with unique QR codes to a list of recipients stored in a PostgreSQL database. The QR code contains the recipient's hashed email, which can be used for verification or tracking purposes.
