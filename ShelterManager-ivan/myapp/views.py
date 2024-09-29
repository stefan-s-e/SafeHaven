
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserLocation,ShelterLocation, ShelterResources,UnverifiedShelter
from .serializers import UserLocationSerializer,CoordinatesListSerializer,ShelterResourcesSerializer,ShelterSerializer,UnverifiedShelterSerializer
from . secrets import get_api_key
import requests
import json
from rest_framework import generics, status


def get_most_recent_location():
    try:
        location = UserLocation.objects.latest('timestamp')
        return location.latitude, location.longitude
    except UserLocation.DoesNotExist:
        return 33.7501, 84.3885
class UpdateUserLocationView(APIView):
    def post(self, request, *args, **kwargs):



        # Extract latitude and longitude from the request
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if not latitude or not longitude:
            return Response({"error": "Latitude and Longitude are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Update or create a new location record for the user
        location, created = UserLocation.objects.update_or_create(
            defaults={'latitude': latitude, 'longitude': longitude}
        )
        serializer = UserLocationSerializer(location)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FetchAndSaveSheltersView(APIView):
    def searchfunct(self):
        try:
            location = UserLocation.objects.latest('timestamp')
            latitude,longitude= location.latitude, location.longitude
        except UserLocation.DoesNotExist:
            latitude,longitude=33.7501, 84.3885

        url="https://places.googleapis.com/v1/places:searchText"
        apikey=get_api_key()
        data={
          "textQuery": "emergency shelters at"+f"{latitude} , {longitude}",
    
        }

        header = {
            "Content-Type": 'application/json',
            "X-Goog-Api-Key": apikey,
            "X-Goog-FieldMask": "places.displayName,places.location,places.name"
        }
        response = requests.post(url, headers=header, data=json.dumps(data))
        return response.json()
    
    def get(self,request):
        coordinates=[]
        response = self.searchfunct()

        for lipo in response.get('places',[]):
            name=lipo.get('displayName').get('text')
            latitude=lipo.get('location').get('latitude')
            longitude=lipo.get('location').get('longitude')
            place=lipo.get('name')


            if name is not None and latitude is not None and longitude is not None:
                ShelterLocation.objects.update_or_create(
                    name=name,
                    defaults={'latitude': latitude, 'longitude': longitude,'place': place})
                coordinates+=[{'latitude': latitude, 'longitude': longitude,'place':place,"name":name}]
        serializer = CoordinatesListSerializer(data={"coordinates": coordinates})

        if serializer.is_valid():
            return Response(serializer.data)  # Return serialized data in the response (when accessing the api should return)
        else:
            return Response(serializer.errors, status=400)
class fetchShelterResrouces(APIView):
    def get(self, request, *args, **kwargs):
        name = request.GET.get('name')
        if not name:
            return Response({"error": "Shelter name is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            obj = ShelterResources.objects.get(name=name)
            pot=ShelterLocation.objects.get(name=name)
        except ShelterResources.DoesNotExist:
            return Response({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ShelterResourcesSerializer(obj)
        sero=ShelterSerializer(pot)
        '''

        shelter = ShelterResources.objects.get(name=name)
        beds=shelter.beds
        food=shelter.food
        water=shelter.water
        electricity=shelter.electricity
        first_aid=shelter.first_aid'''
        data= {
                'name' : serializer.data.get('name'),
                'food' : serializer.data.get('food'),
                'beds' : serializer.data.get('beds'),
                'water' : serializer.data.get('water'),
                'electricity' : serializer.data.get('electricity'),
                'first_aid': serializer.data.get('first_aid'),
                'place' : sero.data.get("place")

        }

        return Response(data)# Return serialized data in the response (when accessing the api should return)
    def post(self, request):
        beds = request.data.get('beds')
        food = request.data.get('food')
        first_aid = request.data.get('first_aid')

        name= request.data.get('name')
        water=request.data.get('water')
        electricity=request.data.get('electricity')

        if beds is None or food is None or first_aid is None or name is None :
            Response({"error": "Latitude and Longitude are required"}, status=status.HTTP_400_BAD_REQUEST)
        resource,created=ShelterResources.objects.update_or_create(
            defaults={'name': name, 'food': food, 'beds': beds, 'water': water,'electricity': electricity,'first_aid': first_aid},)


        serializer = ShelterResourcesSerializer(resource)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UnverifiedShelterCreateView(APIView):
    def post(self, request):
        serializer = UnverifiedShelterSerializer(data=request.data)
        if serializer.is_valid():
            data = request.data  # Use request.data instead of serializer.validated_data
            UnverifiedShelter.objects.create(
                name=data['name'],
                latitude=data['location']['latitude'],
                longitude=data['location']['longitude'],
                available_beds=data['amenities']['numberOfBeds'],
                available_food=data['amenities']['food'],
                available_medical_supplies=data['amenities']['firstAid'],
                water=data['amenities']['water'],
                electricity=data['amenities']['electricity'],
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnverifiedShelterUpdateView(generics.RetrieveUpdateAPIView):
    queryset = UnverifiedShelter.objects.all()
    serializer_class = UnverifiedShelterSerializer
    lookup_field = 'id'  


class UnverifiedShelterListView(APIView):
    def get(self, request):
        shelters = UnverifiedShelter.objects.all()
        serializer = UnverifiedShelterSerializer(shelters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)





