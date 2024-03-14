from PIL import Image

def qr_barbie(qr_path):
    # Load the images
    background = Image.open('ticket_template.png')
    qr = Image.open(qr_path)

    # Define the scale factor
    scale_factor = 1.55  # Set the scale factor here

    # Calculate the scaled size of the QR code
    scaled_size = (int(qr.width * scale_factor), int(qr.height * scale_factor))

    # Scale the QR code image
    qr_scaled = qr.resize(scaled_size)

    # Calculate the position to place the QR code
    center_y = background.height // 2
    offset_y = center_y + 100
    position = ((background.width - qr_scaled.width) // 2, offset_y)

    # Paste the QR code directly onto the background image at the specified position
    background.paste(qr_scaled, position)

    # Save the result
    background.save('qr_ticket.png')

    return 'qr_ticket.png'

qr_barbie("qr_code.png")