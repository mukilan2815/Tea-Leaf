import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import md5 from "md5";

const email = "johndoe@example.com";
const gravatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?d=identicon`;

export default function SettingsScreen() {
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
        <SettingsItem
          title="Communities"
          onPress={() => console.log("Communities")}
        />
        <SettingsItem
          title="Drone Service"
          onPress={() => console.log("Drone Service")}
        />
        <SettingsItem
          title="Location"
          onPress={() => console.log("Help and Support")}
        />
        <SettingsItem
          title="Help and Support"
          onPress={() => console.log("Help and Support")}
        />
      </View>
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
});
