# Generated by Django 5.0.2 on 2024-05-07 14:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0007_chatmessage_room_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='OTP',
            field=models.BooleanField(default=False),
        ),
    ]
