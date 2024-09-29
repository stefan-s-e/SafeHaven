import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Button, Switch, Text, TextInput, useTheme } from "react-native-paper";

const AddShelter = () => {
  const { colors } = useTheme();
  const [shelterName, setShelterName] = useState<string>("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [food, setFood] = useState<boolean>(false);
  const [electricity, setElectricity] = useState<boolean>(false);
  const [water, setWater] = useState<boolean>(false);
  const [firstAid, setFirstAid] = useState<boolean>(false);
  const [numberOfBeds, setNumberOfBeds] = useState<string>("");

  // Error states
  const [errors, setErrors] = useState<{
    shelterName?: string;
    location?: string;
    numberOfBeds?: string;
  }>({});

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Validation function
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!shelterName) newErrors.shelterName = "Shelter Name is required";
    if (latitude === undefined || longitude === undefined)
      newErrors.location = "Location must be selected on the map";
    if (
      !numberOfBeds ||
      isNaN(Number(numberOfBeds)) ||
      parseInt(numberOfBeds) <= 0
    )
      newErrors.numberOfBeds = "Enter a valid number of beds";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return; // Stop submission if validation fails
    }

    setLoading(true); // Set loading state to true

    const shelterData = {
      name: shelterName,
      location: {
        latitude: latitude!,
        longitude: longitude!,
      },
      amenities: {
        food,
        electricity,
        water,
        firstAid,
        numberOfBeds: parseInt(numberOfBeds),
      },
    };

    // Simulate submission delay (replace with actual submission logic)
    setTimeout(() => {
      console.log("Shelter Data: ", shelterData);
      setLoading(false); // Reset loading state after submission
    }, 2000);
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80} // Adjust this value as needed
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Add Your Shelter</Text>

        <TextInput
          label="Shelter Name"
          value={shelterName}
          onChangeText={setShelterName}
          style={styles.input}
          mode="outlined"
          error={!!errors.shelterName}
        />
        {errors.shelterName && (
          <Text style={styles.errorText}>{errors.shelterName}</Text>
        )}

        <Text
          variant="bodyLarge"
          style={{ fontWeight: "bold", paddingBottom: 10 }}
        >
          Select Location:
        </Text>

        {/* Map View for Location Picker */}
        <MapView
          style={styles.map}
          onPress={handleMapPress}
          initialRegion={{
            latitude: 33.7756,
            longitude: -84.3963,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {latitude !== undefined && longitude !== undefined && (
            <Marker
              coordinate={{ latitude, longitude }}
              draggable
            />
          )}
        </MapView>
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}

        {/* Display selected latitude and longitude */}
        <View style={styles.coordinates}>
          <Text style={{ fontWeight: "bold", fontSize: 14 }}>
            Selected location:{" "}
          </Text>
          <Text style={styles.coordinatesText}>
            {latitude !== undefined ? latitude.toFixed(6) : "Not selected"},
          </Text>
          <Text style={styles.coordinatesText}>
            {longitude !== undefined ? longitude.toFixed(6) : "Not selected"}
          </Text>
        </View>

        {/* Amenities Switches */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Food Available</Text>
          <Switch
            color="#FFB248"
            value={food}
            onValueChange={() => setFood(!food)}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Electricity Available</Text>
          <Switch
            color="#FFB248"
            value={electricity}
            onValueChange={() => setElectricity(!electricity)}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Water Available</Text>
          <Switch
            color="#FFB248"
            value={water}
            onValueChange={() => setWater(!water)}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>First Aid Available</Text>
          <Switch
            color="#FFB248"
            value={firstAid}
            onValueChange={() => setFirstAid(!firstAid)}
          />
        </View>

        {/* Number of Beds */}
        <TextInput
          label="Number of Beds"
          value={numberOfBeds}
          onChangeText={setNumberOfBeds}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          error={!!errors.numberOfBeds}
        />
        {errors.numberOfBeds && (
          <Text style={styles.errorText}>{errors.numberOfBeds}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          contentStyle={{ padding: 10 }}
          disabled={loading} // Disable button while loading
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : "Submit"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
    marginTop: 10,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  button: {
    marginTop: 5,
    borderRadius: 5,
    backgroundColor: "#FFB248",
  },
  map: {
    height: 300,
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  coordinates: {
    flexDirection: "row",
    marginBottom: 16,
  },
  coordinatesText: {
    fontSize: 14,
  },
});

export default AddShelter;
