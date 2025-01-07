import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  Button,
} from "react-native";
import md5 from "md5";
import * as Location from "expo-location";

const email = "johndoe@example.com";
const gravatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?d=identicon`;

export default function SettingsScreen() {
  const [language, setLanguage] = useState("English");
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const switchLanguage = () => {
    setLanguage((prevLanguage) =>
      prevLanguage === "English" ? "Spanish" : "English"
    );
    Alert.alert("Language Switched", `Current Language: ${language}`);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }

    const locationData = await Location.getCurrentPositionAsync({});
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      const { city, region, country } = reverseGeocode[0];
      setLocation({ city, region, country });
    } else {
      Alert.alert("Error", "Unable to fetch location details.");
    }
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
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
        <SettingsItem title="Switch Language" onPress={switchLanguage} />
        <SettingsItem title="Location" onPress={getLocation} />
        <SettingsItem
          title="Help and Support"
          onPress={() => console.log("Help and Support")}
        />
      </View>

      {/* Location Modal */}
      <Modal animationType="slide" visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Location</Text>
            {location ? (
              <>
                <Text>City: {location.city || "Unknown"}</Text>
                <Text>State: {location.region || "Unknown"}</Text>
                <Text>Country: {location.country || "Unknown"}</Text>
              </>
            ) : (
              <Text>Fetching location...</Text>
            )}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

interface SettingsItemProps {
  title: string;
  onPress: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ title, onPress }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <Text style={styles.itemText}>{title}</Text>
    <Text style={styles.itemArrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
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
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  itemArrow: {
    fontSize: 18,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
