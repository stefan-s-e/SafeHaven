from django.urls import path
from .views import UpdateUserLocationView, FetchAndSaveSheltersView,fetchShelterResrouces,UnverifiedShelterListView,UnverifiedShelterUpdateView, UnverifiedShelterCreateView
urlpatterns = [
    path('update-location/', UpdateUserLocationView.as_view(), name='update-location'),
    path('fetch-shelters/', FetchAndSaveSheltersView.as_view(), name='get-shelters-save'),
    path('shelter-resources/',fetchShelterResrouces.as_view(), name='shelter-resources'),
    path('unverified-shelters/', UnverifiedShelterCreateView.as_view(), name='unverified-shelter-create'),
    path('unverified-shelters/<int:id>/', UnverifiedShelterUpdateView.as_view(), name='unverified-shelter-update'),
    path('api/unverified-shelters/', UnverifiedShelterListView.as_view(), name='unverified-shelter-list'),
]