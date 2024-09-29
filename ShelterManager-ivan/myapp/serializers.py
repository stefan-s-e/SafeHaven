from rest_framework import serializers
from .models import UserLocation, ShelterLocation,ShelterResources,UnverifiedShelter


class UserLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLocation
        fields = ['latitude', 'longitude', 'timestamp']

class ShelterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShelterLocation
        fields = ['name', 'latitude', 'longitude','place']


class CoordinateSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    name=serializers.CharField()
    place=serializers.CharField()

# Define the serializer for the list of tuples
class CoordinatesListSerializer(serializers.Serializer):
    coordinates = serializers.ListField(
        child=CoordinateSerializer()  # essentialy holds the object in dctionary kind of setting
    )
class ShelterResourcesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShelterResources
        fields = ['name','food','beds','water','electricity', 'first_aid']


class UnverifiedShelterSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()

    class Meta:
        model = UnverifiedShelter
        fields = ['name', 'location', 'amenities']

    def get_location(self, obj):
        # Ensure 'obj' is an instance of your model
        if isinstance(obj, UnverifiedShelter):
            return {
                "latitude": obj.latitude,
                "longitude": obj.longitude
            }
        return {
            "latitude": obj.get('latitude'),
            "longitude": obj.get('longitude')
        }

    def get_amenities(self, obj):
        # Ensure 'obj' is an instance of your model
        if isinstance(obj, UnverifiedShelter):
            return {
                "numberOfBeds": obj.available_beds,
                "food": obj.available_food,
                "firstAid": obj.available_medical_supplies,
                "water": obj.water,
                "electricity": obj.electricity
            }
        return {
            "numberOfBeds": obj.get('available_beds'),
            "food": obj.get('available_food'),
            "firstAid": obj.get('available_medical_supplies'),
            "water": obj.get('water'),
            "electricity": obj.get('electricity')
        }

    def validate(self, data):
        location = self.initial_data.get('location', {})
        latitude = location.get('latitude')
        longitude = location.get('longitude')

        if latitude is None or longitude is None:
            raise serializers.ValidationError("Latitude and Longitude are required.")

        existing_shelter = UnverifiedShelter.objects.filter(
            latitude=latitude,
            longitude=longitude
        )

        if self.instance:
            existing_shelter = existing_shelter.exclude(pk=self.instance.pk)

        if existing_shelter.exists():
            raise serializers.ValidationError("A shelter with this location already exists.")

        return data

    def create(self, validated_data):
        location_data = self.initial_data.get('location', {})
        amenities_data = self.initial_data.get('amenities', {})

        # Create the UnverifiedShelter object using nested fields
        return UnverifiedShelter.objects.create(
            name=validated_data.get('name'),
            latitude=location_data.get('latitude'),
            longitude=location_data.get('longitude'),
            available_beds=amenities_data.get('numberOfBeds'),
            available_food=amenities_data.get('food'),
            available_medical_supplies=amenities_data.get('firstAid'),
            water=amenities_data.get('water'),
            electricity=amenities_data.get('electricity'),
            total_capacity=validated_data.get('total_capacity', 0)  # Adjust total_capacity as needed
        )
