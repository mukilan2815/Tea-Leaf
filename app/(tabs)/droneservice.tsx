// DroneServices.js

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DroneServices() {
  // State variables
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [acreage, setAcreage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch location on component mount
  useEffect(() => {
    fetchLocation();
  }, []);

  // Function to fetch location
  const fetchLocation = async () => {
    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied."
        );
        setLoading(false);
        return;
      }

      // Get current location
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.name ? addr.name + ", " : ""}${
          addr.street ? addr.street + ", " : ""
        }${addr.city ? addr.city + ", " : ""}${
          addr.region ? addr.region + ", " : ""
        }${addr.postalCode ? addr.postalCode + ", " : ""}${
          addr.country ? addr.country : ""
        }`;
        setAddress(formattedAddress);
      }

      setModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching location.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle saving data
  const handleSave = async () => {
    // Validate inputs
    if (!address.trim()) {
      Alert.alert("Validation Error", "Address cannot be empty.");
      return;
    }
    if (!acreage.trim() || isNaN(acreage) || Number(acreage) <= 0) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid number for acreage."
      );
      return;
    }

    setSaving(true);

    try {
      const droneData = {
        address: address.trim(),
        acreage: Number(acreage),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      // Store data locally using AsyncStorage
      const existingData = await AsyncStorage.getItem("droneServiceData");
      let newData = [];
      if (existingData !== null) {
        newData = JSON.parse(existingData);
      }
      newData.push(droneData);
      await AsyncStorage.setItem("droneServiceData", JSON.stringify(newData));

      Alert.alert("Success", "Your details have been saved.");
      setModalVisible(false);
      setAcreage("");
    } catch (error) {
      Alert.alert("Error", "An error occurred while saving data.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Function to handle modal cancellation
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Render loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={styles.loadingText}>Fetching location...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚁 Drone Services</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Display fetched location */}
        {location && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Current Location:</Text>
            <Text style={styles.infoText}>{address}</Text>
            <View style={styles.coordinates}>
              <Text style={styles.coordinateText}>
                Latitude: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinateText}>
                Longitude: {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}

        {/* Input for Land Acreage */}
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Land Size (acres):</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter land size in acres"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={acreage}
            onChangeText={setAcreage}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.saveButtonText}>Save Details</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Address Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Confirm Your Details</Text>

              <Text style={styles.modalLabel}>Address:</Text>
              <TextInput
                style={styles.modalInput}
                value={address}
                onChangeText={setAddress}
                multiline
              />

              <Text style={styles.modalLabel}>Land Size (acres):</Text>
              <TextInput
                style={styles.modalInput}
                value={acreage}
                onChangeText={setAcreage}
                keyboardType="numeric"
              />

              {/* Display Coordinates */}
              <Text style={styles.modalLabel}>Coordinates:</Text>
              <Text style={styles.modalCoordinate}>
                Latitude: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.modalCoordinate}>
                Longitude: {location.coords.longitude.toFixed(6)}
              </Text>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: "#F0F4F7",
  },
  header: {
    backgroundColor: "#1565C0",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    padding: 20,
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  coordinates: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordinateText: {
    fontSize: 14,
    color: "#777",
  },
  inputBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F9FAFB",
  },
  saveButton: {
    backgroundColor: "#1565C0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#1565C0",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F9FAFB",
    marginTop: 8,
  },
  modalCoordinate: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#B0BEC5",
  },
  confirmButton: {
    backgroundColor: "#1565C0",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
