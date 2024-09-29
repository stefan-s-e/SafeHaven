from django.contrib import admin
from django.contrib import admin
from .models import UserLocation, ShelterLocation, ShelterResources,UnverifiedShelter

admin.site.register(UserLocation)
admin.site.register(ShelterLocation)
admin.site.register(ShelterResources)
admin.site.register(UnverifiedShelter)
# Register your models here.
