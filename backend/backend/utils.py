import pyotp
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings

def send_otp(request):
    totp = pyotp.TOTP(pyotp.random_base32(), interval=60)
    otp = totp.now()
    request.session['otp_secret_key'] = totp.secret
    valid_date = datetime.now() + timedelta(minutes=1)
    request.session['otp_valid_date'] = str(valid_date)

    send_mail(
        'Your OTP Code',
        f'Your OTP is {otp}',
        settings.EMAIL_HOST_USER,
        ['aurelien.sanson@yahoo.fr'],
        fail_silently=False,
    )
