import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  Linking,
  Platform,
} from "react-native";
import { Button, List, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

type ShelterRouteParams = {
  shelter: {
    latitude: number;
    longitude: number;
    name: string;
    place: string; // This is the place ID
  };
  userLocation: {
    latitude: number;
    longitude: number;
  };
};

const Shelter: React.FC = () => {
  const route = useRoute<RouteProp<{ params: ShelterRouteParams }, "params">>();
  const { shelter, userLocation } = route.params;

  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Random resources availability state
  const [resources, setResources] = useState<{
    food: boolean;
    water: boolean;
    electricity: boolean;
    firstAid: boolean;
    beds: number;
  }>({
    food: false,
    water: false,
    electricity: false,
    firstAid: false,
    beds: 0,
  });

  // Haversine formula implementation
  const haversineDistance = (
    coords1: { latitude: number; longitude: number },
    coords2: { latitude: number; longitude: number }
  ) => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(coords2.latitude - coords1.latitude);
    const dLon = toRadians(coords2.longitude - coords1.longitude);
    const lat1 = toRadians(coords1.latitude);
    const lat2 = toRadians(coords2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Fetch place details using the Google Places API
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY; // Replace with your API Key

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shelter.place.slice(
            7
          )}&fields=name,formatted_address,formatted_phone_number,website,photos&key=${API_KEY}`
        );

        if (response.data.result) {
          const place = response.data.result;
          setPlaceDetails(place);

          // Check if the place has any photos and get the first photo reference
          if (place.photos && place.photos.length > 0) {
            const photoReference = place.photos[0].photo_reference;
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;
            setPhotoUrl(photoUrl);
          }
        } else {
          console.log("Place details not found.");
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
      }
    };

    fetchPlaceDetails();
  }, [shelter.place]);

  // Calculate the distance between user location and shelter
  useEffect(() => {
    const userCoords = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };
    const shelterCoords = {
      latitude: shelter.latitude,
      longitude: shelter.longitude,
    };

    const dist = haversineDistance(userCoords, shelterCoords);
    setDistance(dist / 1.609); // Convert kilometers to miles
  }, [userLocation, shelter]);

  // Randomly assign resources availability when the component mounts
  useEffect(() => {
    const randomResourceAvailability = () => {
      const randomBeds = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
      setResources({
        food: Math.random() < 0.5,
        water: Math.random() < 0.5,
        electricity: Math.random() < 0.5,
        firstAid: Math.random() < 0.5,
        beds: randomBeds,
      });
    };

    randomResourceAvailability();
  }, []);

  // Function to handle navigation to the shelter
  const navigateToShelter = () => {
    const scheme = Platform.select({
      ios: `maps:0,0?q=${shelter.latitude},${shelter.longitude}`,
      android: `geo:0,0?q=${shelter.latitude},${shelter.longitude}(${shelter.name})`,
    });
    const url = scheme
      ? scheme
      : `https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`;

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred while trying to open maps: ", err)
    );
  };

  return (
    <View style={styles.container}>
      {/* Display the place photo if available, otherwise fallback to default image */}
      {photoUrl && (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: "100%", height: 160 }}
        />
      )}

      <ScrollView style={{ padding: 20, gap: 0 }}>
        <View style={{ gap: 5 }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
            <Text
              style={{ fontWeight: "bold" }}
              variant="titleLarge"
            >
              {shelter.name}
            </Text>
            <View
              style={{
                backgroundColor: "#45b7ff",
                padding: 4,
                borderRadius: 50,
              }}
            >
              <Icon
                color="white"
                name="check"
              />
            </View>
          </View>
          {/* Display the calculated distance */}
          <Text style={{ color: "#707070" }}>
            {distance
              ? `${distance.toFixed(2)} mi from your location`
              : "Calculating distance..."}
          </Text>
        </View>

        {/* Display place details if available */}
        {placeDetails && (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Address: </Text>
              <Text>{placeDetails.formatted_address}</Text>
            </View>
          </>
        )}

        {/* Resources available */}
        <View style={{ gap: 0, marginTop: 10 }}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold" }}
          >
            Resources available
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: "#707070" }}
          >
            Last updated: 55 min ago
          </Text>
        </View>

        <View style={{ gap: 0, marginTop: 10 }}>
          {resources.food && (
            <List.Item
              title="Food"
              titleStyle={{ fontSize: 14 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="food"
                />
              )}
            />
          )}
          {resources.beds > 0 && (
            <List.Item
              title={`${resources.beds} Beds`}
              titleStyle={{ fontSize: 14 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="bed"
                />
              )}
            />
          )}
          {resources.water && (
            <List.Item
              title="Water"
              titleStyle={{ fontSize: 14 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="water"
                />
              )}
            />
          )}
          {resources.electricity && (
            <List.Item
              title="Electricity"
              titleStyle={{ fontSize: 14 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="power-plug"
                />
              )}
            />
          )}
          {resources.firstAid && (
            <List.Item
              title="First Aid"
              titleStyle={{ fontSize: 14 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="pill"
                />
              )}
            />
          )}
        </View>

        {/* Contact Info */}
        <Text
          variant="titleMedium"
          style={{ fontWeight: "bold", marginTop: 15 }}
        >
          Contact Info
        </Text>

        <View style={{ marginTop: 6, gap: 5 }}>
          {placeDetails?.formatted_phone_number && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Icon
                color="#707070"
                name="phone"
                size={20}
              />
              <Text>{placeDetails.formatted_phone_number}</Text>
            </View>
          )}
          {placeDetails?.website && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Icon
                color="#707070"
                name="web"
                size={20}
              />
              <Text
                style={{ color: "#007bff" }}
                onPress={() => Linking.openURL(placeDetails.website)}
              >
                {placeDetails.website}
              </Text>
            </View>
          )}
        </View>

        {/* Navigate to Shelter Button */}
        <Button
          mode="contained"
          style={{ marginTop: 20, backgroundColor: "#FFB248", borderRadius: 5 }}
          onPress={navigateToShelter}
        >
          Get Directions
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default Shelter;
