# Generated by Django 5.1.1 on 2024-09-29 00:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0005_shelterresources'),
    ]

    operations = [
        migrations.CreateModel(
            name='UnverifiedShelter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('address', models.CharField(max_length=200)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('total_capacity', models.IntegerField()),
                ('available_beds', models.IntegerField()),
                ('available_food', models.BooleanField()),
                ('available_medical_supplies', models.BooleanField()),
                ('electricity', models.BooleanField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'unique_together': {('address', 'latitude', 'longitude')},
            },
        ),
    ]
