// HomeScreen.js

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import md5 from "md5";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
// If using environment variables
// import { BACKEND_URL } from "@env";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { t } = useTranslation();
  const email = "johndoe@example.com";
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(
    email
  )}?d=identicon`;

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pastImages, setPastImages] = useState([]);
  const [loadingPastImages, setLoadingPastImages] = useState(false);

  const weather = {
    location: "New York",
    temperature: 24,
    condition: "Sunny",
  };

  const reports = [
    { id: 1, title: "Report 1", description: "Details of report 1" },
    { id: 2, title: "Report 2", description: "Details of report 2" },
    { id: 3, title: "Report 3", description: "Details of report 3" },
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

  useEffect(() => {
    fetchPastImages();
  }, []);

  const fetchPastImages = async () => {
    try {
      setLoadingPastImages(true);
      const backendURL = "http://localhost:5000/api/images"; // Update this if necessary
      const response = await axios.get(backendURL);
      if (response.status === 200) {
        setPastImages(response.data);
      } else {
        Alert.alert(t("error"), t("fetch_images_failed"));
      }
    } catch (error) {
      console.error("Fetch Images Error:", error);
      Alert.alert(t("error"), t("fetch_images_failed"));
    } finally {
      setLoadingPastImages(false);
    }
  };

  const openCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("permission_denied"), t("camera_permission_required"));
        return;
      }

      // Launch camera
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Capture only images
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Compress the image to reduce upload size
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setSelectedImage(image.uri);
        // Optionally, upload the image immediately after selection
        uploadImage(image);
      } else {
        Alert.alert(t("no_image_selected"), t("please_capture_image"));
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert(t("error"), t("camera_error"));
    }
  };

  const uploadImage = async (image) => {
    try {
      setUploading(true);

      // Prepare the form data
      const formData = new FormData();
      const localUri = image.uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("file", {
        uri: localUri,
        name: filename,
        type: type,
      });
      const backendURL = "http://192.168.29.144:5000/api/images/upload"; // Update this
      const response = await axios.post(backendURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        Alert.alert(t("success"), t("image_uploaded_successfully"));
        // Refresh past images
        fetchPastImages();
      } else {
        Alert.alert(t("error"), t("image_upload_failed"));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert(t("error"), t("image_upload_failed"));
    } finally {
      setUploading(false);
    }
  };

  const renderPastImage = ({ item }) => (
    <Image
      source={{ uri: `http://192.168.29.144:5000/api/images/${item.filename}` }} // Update if necessary
      style={styles.pastImage}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("welcome", { name: "Mukilan" })}
        </Text>
        <Image source={{ uri: gravatarUrl }} style={styles.profileImage} />
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Weather and Reports */}
        <View style={styles.topSection}>
          {/* Weather Card */}
          <View style={[styles.card, styles.weatherCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t("weather")}</Text>
            </View>
            <Text style={styles.weatherLocation}>{weather.location}</Text>
            <Text style={styles.weatherDetails}>
              {t("temperature", {
                temp: weather.temperature,
                condition: weather.condition,
              })}
            </Text>
          </View>

          {/* Reports Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reportsScroll}
          >
            {reports.map((report) => (
              <View key={report.id} style={[styles.card, styles.reportsCard]}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDescription}>
                  {report.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* News Section */}
        <View style={styles.newsSection}>
          <Text style={styles.newsTitle}>{t("news")}</Text>
          <FlatList
            data={news}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.newsCard}>
                <Image source={{ uri: item.image }} style={styles.newsImage} />
                <View style={styles.newsContent}>
                  <Text style={styles.newsCardTitle}>{item.title}</Text>
                  <Text style={styles.newsCardDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Past Images Section */}
        <View style={styles.pastImagesSection}>
          <Text style={styles.pastImagesTitle}>Past Images</Text>
          {loadingPastImages ? (
            <ActivityIndicator size="large" color="#1E88E5" />
          ) : (
            <FlatList
              data={pastImages}
              keyExtractor={(item) => item._id.toString()}
              renderItem={renderPastImage}
              numColumns={5}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Display Selected Image */}
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Text style={styles.selectedImageTitle}>{t("selected_image")}</Text>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />
          </View>
        )}

        {/* Display Uploading Indicator */}
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text style={styles.uploadingText}>{t("uploading_image")}</Text>
          </View>
        )}
      </ScrollView>

      {/* Camera Button */}
      <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
        <MaterialIcons
          name="camera-alt"
          size={24}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.cameraButtonText}>{t("open_camera")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 40 : 60, // Adjust for status bar
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E88E5",
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 100,
  },
  topSection: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  weatherCard: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#1F2937",
  },
  weatherLocation: {
    fontSize: 16,
    color: "#1565C0",
    marginBottom: 4,
  },
  weatherDetails: {
    fontSize: 14,
    color: "#555",
  },
  reportsScroll: {
    paddingVertical: 8,
  },
  reportsCard: {
    width: width * 0.6,
    backgroundColor: "#FFF8E1",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  reportDescription: {
    fontSize: 14,
    color: "#616161",
  },
  newsSection: {
    flex: 1,
    marginBottom: 24,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1F2937",
  },
  newsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    marginBottom: 16,
  },
  newsImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  newsContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  newsCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#37474F",
    marginBottom: 4,
  },
  newsCardDescription: {
    fontSize: 14,
    color: "#616161",
  },
  separator: {
    height: 16,
  },
  pastImagesSection: {
    marginBottom: 24,
  },
  pastImagesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1F2937",
  },
  pastImage: {
    width: (width - 48) / 5, // Adjust for margins (16px padding * 3 between images)
    height: (width - 48) / 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  selectedImageContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  selectedImageTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
  },
  selectedImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 12,
  },
  cameraButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    backgroundColor: "#1E88E5",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cameraButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  uploadingContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
  },
});
