// SettingsScreen.js

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Button,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import md5 from "md5";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";

const email = "johndoe@example.com";
const gravatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?d=identicon`;

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  // Add more languages as needed
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const switchLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    const selectedLanguage =
      languages.find((lang) => lang.code === languageCode)?.label || "English";
    Alert.alert(
      t("language_switched"),
      `${t("current_language", { language: selectedLanguage })}`
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
        setLocation({ city, region, country });
      } else {
        Alert.alert(t("error"), t("unable_fetch_location"));
      }
      setModalVisible(true);
    } catch (error) {
      Alert.alert(t("error"), t("unable_fetch_location"));
    }
  };

  return (
    <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: gravatarUrl }} style={styles.profileImage} />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profilePhone}>+1 234 567 890</Text>
        </View>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {/* Language Selection */}
        <Text style={styles.sectionTitle}>{t("switch_language")}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={currentLanguage}
            onValueChange={(itemValue) => switchLanguage(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            {languages.map((lang) => (
              <Picker.Item
                key={lang.code}
                label={lang.label}
                value={lang.code}
              />
            ))}
          </Picker>
        </View>

        {/* Other Settings Items */}
        <TouchableOpacity style={styles.settingsItem} onPress={getLocation}>
          <Text style={styles.itemText}>{t("location")}</Text>
          <Text style={styles.itemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() =>
            Alert.alert(t("help_support"), "Help and Support clicked")
          }
        >
          <Text style={styles.itemText}>{t("help_support")}</Text>
          <Text style={styles.itemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <Modal animationType="slide" visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("your_location")}</Text>
            {location ? (
              <>
                <Text>
                  {t("city")}: {location.city || t("unknown")}
                </Text>
                <Text>
                  {t("state")}: {location.region || t("unknown")}
                </Text>
                <Text>
                  {t("country")}: {location.country || t("unknown")}
                </Text>
              </>
            ) : (
              <Text>{t("fetching_location")}</Text>
            )}
            <Button title={t("close")} onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 30 : 50,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2, // For Android
    shadowColor: "#000", // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.1, // For iOS
    shadowRadius: 4, // For iOS
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
    fontWeight: "bold",
    color: "#333",
  },
  profilePhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  settingsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 10,
    elevation: 2, // For Android
    shadowColor: "#000", // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.1, // For iOS
    shadowRadius: 4, // For iOS
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#333",
  },
  pickerContainer: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  itemArrow: {
    fontSize: 18,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    elevation: 5, // For Android
    shadowColor: "#000", // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.3, // For iOS
    shadowRadius: 4, // For iOS
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
