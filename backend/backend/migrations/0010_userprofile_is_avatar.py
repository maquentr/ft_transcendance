# Generated by Django 5.0.2 on 2024-05-18 13:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0009_userprofile_blocked'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_avatar',
            field=models.BooleanField(default=False),
        ),
    ]
