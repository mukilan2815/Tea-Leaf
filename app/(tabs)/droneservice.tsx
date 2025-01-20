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
  Image,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { useTranslation } from "react-i18next";

export default function DroneServices() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [acreage, setAcreage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    fetchLocation();
  }, []);
  // Supported languages
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "bn", label: "বাংলা" },
  ];

  const switchLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode); // Change language
    setCurrentLanguage(languageCode);
    const selectedLanguage =
      languages.find((lang) => lang.code === languageCode)?.label || "English";
    Alert.alert(
      t("language_switched"),
      t("current_language", { selectedLanguage })
    );
  };

  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location denied."
        );
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.name || ""}, ${addr.city || ""}, ${
          addr.region || ""
        }, ${addr.country || ""}`;
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

  const handleSave = async () => {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A8E44" />
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
        <Text style={styles.headerTitle}>{t("drone_services")}</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Location Card */}
        {location && (
          <View style={styles.card}>
            <Ionicons name="location-outline" size={28} color="#3A8E44" />
            <Text style={styles.cardTitle}>{t("current_location")}</Text>
            <Text style={styles.cardText}>{address}</Text>
            <View style={styles.coordinates}>
              <Text style={styles.coordinateText}>
                {t("latitude")}: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinateText}>
                {t("longitude")}: {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}

        {/* Land Size Card */}
        <View style={styles.card}>
          <Ionicons name="analytics-outline" size={28} color="#3A8E44" />
          <Text style={styles.cardTitle}>{t("land_size")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("enter_land_size")}
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
          <Text style={styles.saveButtonText}>{t("save_details")}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("confirm_details")}</Text>

            {/* Address Input */}
            <Text style={styles.modalLabel}>{t("address")}</Text>
            <TextInput
              style={styles.modalInput}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            {/* Acreage Input */}
            <Text style={styles.modalLabel}>{t("land_size")}</Text>
            <TextInput
              style={styles.modalInput}
              value={acreage}
              onChangeText={setAcreage}
              keyboardType="numeric"
            />

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: "#F5FAF0",
  },
  header: {
    backgroundColor: "#3A8E44",
    paddingVertical: 30,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A8E44",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 8,
  },
  coordinates: {
    marginTop: 10,
  },
  coordinateText: {
    fontSize: 14,
    color: "#777",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F9FAFB",
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: "#3A8E44",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3A8E44",
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 16,
    color: "#333",
    marginTop: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F9FAFB",
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#B0BEC5",
  },
  confirmButton: {
    backgroundColor: "#3A8E44",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
