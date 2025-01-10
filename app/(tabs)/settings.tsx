import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";

// Gravatar URL
const gravatarUrl = `https://www.pravatar.com/avatar/default?d=identicon`;

// Supported languages
const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("permission_denied"), t("location_access_required"));
      return;
    }

    try {
      const locationData = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { city, region, country } = reverseGeocode[0];
        setLocation({
          city: city || "",
          region: region || "",
          country: country || "",
        });
      } else {
        Alert.alert(t("error"), t("unable_to_fetch_location"));
      }
      setModalVisible(true);
    } catch (error) {
      Alert.alert(t("error"), t("unable_to_fetch_location"));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("settings")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Language Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("switch_language")}</Text>
          <Picker
            selectedValue={currentLanguage}
            onValueChange={switchLanguage}
            style={styles.picker}
          >
            {languages.map((lang) => (
              <Picker.Item
                label={lang.label}
                value={lang.code}
                key={lang.code}
              />
            ))}
          </Picker>
        </View>

        {/* Location */}
        <TouchableOpacity style={styles.card} onPress={getLocation}>
          <View style={styles.cardContent}>
            <Ionicons name="location-outline" size={24} color="#3A8E44" />
            <Text style={styles.cardText}>{t("location")}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>

        {/* Help and Support */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => Alert.alert(t("help_support"), t("contact_us"))}
        >
          <View style={styles.cardContent}>
            <Ionicons name="help-circle-outline" size={24} color="#3A8E44" />
            <Text style={styles.cardText}>{t("help_support")}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Modal */}
      <Modal animationType="slide" visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("your_location")}</Text>
            {location ? (
              <>
                <Text>{`${t("city")}: ${location.city || t("unknown")}`}</Text>
                <Text>{`${t("state")}: ${
                  location.region || t("unknown")
                }`}</Text>
                <Text>{`${t("country")}: ${
                  location.country || t("unknown")
                }`}</Text>
              </>
            ) : (
              <Text>{t("unable_to_fetch_location")}</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 30,
  },
  header: {
    backgroundColor: "#3A8E44",
    padding: 16,
    paddingTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    padding: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A8E44",
  },
  profilePhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#3A8E44",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
