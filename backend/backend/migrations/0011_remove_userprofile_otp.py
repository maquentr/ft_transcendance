# Generated by Django 5.0.2 on 2024-05-18 23:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_userprofile_is_avatar'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='OTP',
        ),
    ]
