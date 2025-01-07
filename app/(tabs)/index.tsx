import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Camera as ExpoCamera } from "expo-camera";

import { Ionicons } from "@expo/vector-icons"; // For the camera icon
import md5 from "md5";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const email = "johndoe@example.com";
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(
    email
  )}?d=identicon`;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const weather = {
    location: "New York",
    temperature: 24,
    condition: "Sunny",
  };

  const reports = [
    { id: 1, title: "Report 1", description: "Details of report 1" },
  ];

  const news = [
    {
      id: 1,
      title: "Breaking News 1",
      description: "Description of article 1",
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 2,
      title: "Breaking News 2",
      description: "Description of article 2",
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 3,
      title: "Breaking News 3",
      description: "Description of article 3",
      image: "https://via.placeholder.com/300x200",
    },
  ];

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  console.log("Camera:", Camera);
  console.log("Ionicons:", Ionicons);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Mukilan !!</Text>
        <View style={styles.headerIcons}>
          <Image source={{ uri: gravatarUrl }} style={styles.profileImage} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        <View style={[styles.card, styles.weatherCard]}>
          <Text style={styles.cardTitle}>🌤️ Weather</Text>
          <Text style={styles.weatherText}>📍 {weather.location}</Text>
          <Text style={styles.weatherDetails}>
            {weather.temperature}°C - {weather.condition}
          </Text>
        </View>

        {reports.map((report) => (
          <View key={report.id} style={[styles.card, styles.reportsCard]}>
            <Text style={styles.cardTitle}>📊 {report.title}</Text>
            <Text style={styles.reportDescription}>{report.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.newsSection}>
        <Text style={styles.newsTitle}>📰 News</Text>
        <FlatList
          data={news}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.newsCard}>
              <Image source={{ uri: item.image }} style={styles.newsImage} />
              <Text style={styles.newsCardTitle}>{item.title}</Text>
              <Text style={styles.newsCardDescription}>{item.description}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
        />
      </View>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          {Camera && hasPermission ? (
            <Camera style={styles.camera} />
          ) : (
            <Text>Camera not available</Text>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCameraVisible(false)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => setCameraVisible(true)}
      >
        <Ionicons name="camera" size={64} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1E88E5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 20,
    padding: 12,
    height: 120,
    width: 200,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherCard: {
    backgroundColor: "#E3F2FD",
  },
  reportsCard: {
    backgroundColor: "#FFF8E1",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1F2937",
  },
  weatherText: {
    fontSize: 14,
    color: "#1565C0",
    marginBottom: 4,
  },
  weatherDetails: {
    fontSize: 12,
    color: "#555",
  },
  reportDescription: {
    fontSize: 12,
    color: "#616161",
  },
  newsSection: {
    paddingHorizontal: 16,
    marginBottom: 250,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1F2937",
  },
  newsCard: {
    width: width - 32,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  newsCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 10,
    color: "#37474F",
  },
  newsCardDescription: {
    fontSize: 12,
    marginHorizontal: 10,
    marginBottom: 10,
    color: "#616161",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  cameraButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#1E88E5",
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
});
