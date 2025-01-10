import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");
const API_KEY = "9dac1789f6909ca2205c94277b32f8bd";

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newsImages, setNewsImages] = useState({
    firstImageError: false,
    secondImageError: false,
  });
  const [predictedImage, setPredictedImage] = useState(null);
  const [predictionText, setPredictionText] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  interface Diagnosis {
    image: string;
    prediction: string;
    remedy: string;
    time: string;
  }

  const [recentDiagnoses, setRecentDiagnoses] = useState<Diagnosis[]>([]);
  const [Name, setName] = useState("");
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );

      setWeatherData(response.data);
    } catch (error) {
      setLocationError("Unable to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };
  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    // Simulate OTP request
    Alert.alert("OTP Sent", "An OTP has been sent to your phone.");
    setShowPhoneModal(false);
    setShowOtpModal(true);
  };

  const handleOtpSubmit = async () => {
    if (otp !== "1234") {
      Alert.alert("Invalid OTP", "Please enter the correct OTP.");
      return;
    }

    Alert.alert("Success", "Welcome to the application!");
    setShowOtpModal(false);
  };
  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera access is required to capture images."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Compress the image
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setSelectedImage(image.uri); // Display selected image
        uploadImage(image); // Upload the captured image
      } else {
        Alert.alert("No Image Selected", "Please capture an image to upload.");
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert("Error", "An error occurred while accessing the camera.");
    }
  };

  interface Image {
    uri: string;
  }

  interface Diagnosis {
    image: string;
    prediction: string;
    remedy: string;
    time: string;
  }

  const uploadImage = async (image: Image): Promise<void> => {
    try {
      setUploading(true);

      const formData = new FormData();
      const localUri = image.uri;
      const filename = localUri.split("/").pop() || "";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("file", { uri: localUri, name: filename, type: type });

      const backendURL = "http://192.168.29.144:8000/predict/";
      const response = await axios.post(backendURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // Expect a binary blob (image) in the response
      });

      if (response.status === 200) {
        const blob = response.data;

        // Convert Blob to a Base64 URI
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;

          // Extract metadata from headers
          const predictionHeader = response.headers["x-prediction"];
          const remedyHeader = response.headers["x-remedy"];

          // Create a new diagnosis object
          const newDiagnosis: Diagnosis = {
            image: base64data, // Base64 image
            prediction: predictionHeader || "No prediction provided.",
            remedy: remedyHeader || "No remedy provided.",
            time: new Date().toLocaleString(),
          };

          // Update the recent diagnoses state
          setRecentDiagnoses((prev) => [newDiagnosis, ...prev]);
        };
        reader.readAsDataURL(blob);
        console.log(response.headers);
        Alert.alert("Success", "Prediction received!");
      } else {
        Alert.alert("Error", `Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "An error occurred while uploading the image.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const loadDiagnoses = async () => {
      const savedDiagnoses = await AsyncStorage.getItem("recentDiagnoses");
      if (savedDiagnoses) {
        setRecentDiagnoses(JSON.parse(savedDiagnoses));
      }
    };
    loadDiagnoses();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("recentDiagnoses", JSON.stringify(recentDiagnoses));
  }, [recentDiagnoses]);

  useEffect(() => {
    AsyncStorage.setItem("recentDiagnoses", JSON.stringify(recentDiagnoses));
  }, [recentDiagnoses]);

  const renderWeatherCard = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#3A8E44" />;
    }

    if (locationError) {
      return <Text style={styles.errorText}>{locationError}</Text>;
    }

    if (weatherData) {
      return (
        <View style={styles.weatherCard}>
          <Text style={styles.weatherLocation}>{weatherData.name}</Text>
          <Text style={styles.weatherTemperature}>
            {Math.round(weatherData.main.temp)}°C
          </Text>
          <Text style={styles.weatherDescription}>
            {weatherData.weather[0].description}
          </Text>
        </View>
      );
    }

    return null;
  };
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "bn", label: "বাংলা" },
  ];
  const [currentLanguage, setCurrentLanguage] = useState("en");

  interface Language {
    code: string;
    label: string;
  }
  const { t, i18n } = useTranslation();

  const switchLanguage = (itemValue: string, languageCode: string): void => {
    i18n.changeLanguage(languageCode); // Change language
    setCurrentLanguage(itemValue);
    Alert.alert("Language Switched", `Current language: ${itemValue}`);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Greetings and Weather Card */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t("welcome_back")} 👋</Text>
            <Text style={styles.headerSubtitle}>Mukilan T</Text>
          </View>
          <Image
            source={{
              uri: `https://i.pravatar.cc/150?img=${Math.floor(
                Math.random() * 70
              )}`,
            }}
            style={styles.profileImage}
          />
        </View>
        {renderWeatherCard()}

        {/* News Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          <View style={styles.newsCard}>
            <Image
              source={
                newsImages.firstImageError
                  ? { uri: "https://via.placeholder.com/300x200" }
                  : { uri: "https://source.unsplash.com/random/300x200/?farm" }
              }
              style={styles.newsImage}
              onError={() =>
                setNewsImages((prevState) => ({
                  ...prevState,
                  firstImageError: true,
                }))
              }
            />
            <Text style={styles.newsTitle}>{t("news_tea_leaf_diseases")}</Text>
            <Text style={styles.newsSubtitle}>
              {t("news_ai_tea_diseases_description")}
            </Text>
          </View>
          <View style={styles.newsCard}>
            <Image
              source={
                newsImages.secondImageError
                  ? { uri: "https://via.placeholder.com/300x200" }
                  : {
                      uri: "https://source.unsplash.com/random/300x200/?plants",
                    }
              }
              style={styles.newsImage}
              onError={() =>
                setNewsImages((prevState) => ({
                  ...prevState,
                  secondImageError: true,
                }))
              }
            />
            <Text style={styles.newsTitle}>{t("news_crop_health")}</Text>
            <Text style={styles.newsSubtitle}>
              {t("news_crop_health_description")}
            </Text>
          </View>
        </ScrollView>

        {/* Scan Card */}
        <View style={styles.scanCard}>
          <Text style={styles.scanTitle}>{t("scan_card_title")}</Text>
          <Text style={styles.scanSubtitle}>{t("scan_card_description")}</Text>
          <TouchableOpacity style={styles.scanButton} onPress={openCamera}>
            <Text style={styles.scanButtonText}>{t("scan_now")}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Diagnoses Section */}
        <View style={styles.recentDiagnoses}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("recent_diagnoses")}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t("see_all")}</Text>
            </TouchableOpacity>
          </View>
          {recentDiagnoses.length === 0 ? (
            <Text style={{ color: "#666", fontStyle: "italic" }}>
              {t("no_diagnoses_yet")}
            </Text>
          ) : (
            recentDiagnoses.map((diagnosis, index) => (
              <View key={index} style={styles.diagnosisItem}>
                {/* Predicted Image */}
                <Image
                  source={{ uri: diagnosis.image }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    marginRight: 10,
                  }}
                />
                {/* Prediction Details */}
                <View>
                  <Text style={styles.diagnosisText}>
                    {diagnosis.prediction}
                  </Text>
                  <Text style={styles.remedyText}>{diagnosis.remedy}</Text>
                  <Text style={styles.diagnosisDate}>{diagnosis.time}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Phone Details Modal */}
      <Modal visible={showPhoneModal} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("enter_details")}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t("name_placeholder")}
              keyboardType="default"
              value={Name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={t("phone_placeholder")}
              keyboardType="number-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t("switch_language")}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={currentLanguage}
                  onValueChange={(itemValue) => switchLanguage(itemValue)}
                  style={styles.picker}
                  mode="dropdown"
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
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePhoneSubmit}
            >
              <Text style={styles.modalButtonText}>{t("submit")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* OTP Modal */}
      <Modal visible={showOtpModal} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("enter_otp")}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t("otp_placeholder")}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleOtpSubmit}
            >
              <Text style={styles.modalButtonText}>{t("verify_otp")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Large Camera Button */}
      <View style={styles.cameraButtonContainer}>
        <TouchableOpacity style={styles.largeCameraButton} onPress={openCamera}>
          <Text style={styles.largeCameraButtonText}>{t("open_camera")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: "#E7F5DC",
  },
  mainContent: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3A8E44",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },

  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#3A8E44",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  weatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    marginBottom: 24,
  },
  weatherLocation: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A8E44",
  },
  weatherTemperature: {
    fontSize: 48,
    fontWeight: "700",
    color: "#3A8E44",
  },
  weatherDescription: {
    fontSize: 16,
    color: "#666",
  },
  newsCard: {
    width: 280, // Adjust card width to be more compact
    marginRight: 16, // Spacing between cards
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12, // Slightly reduced padding for a more spacious look
    shadowColor: "#000", // Optional: adds a shadow effect for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // For Android shadow
    alignItems: "center", // Center the content inside the card
  },

  newsImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 12, // Space between image and text
  },

  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3A8E44",
    marginBottom: 8, // Adds a gap between title and subtitle
    textAlign: "center", // Center the title for a balanced look
  },

  newsSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center", // Center the subtitle as well
  },
  scanCard: {
    width: 320, // Compact width for advertisement banner
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000", // Adds depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // Android shadow
  },

  scanTitle: {
    fontSize: 16, // Slightly smaller font for the title
    fontWeight: "600",
    color: "#3A8E44",
    marginBottom: 8,
    textAlign: "center", // Centers the title for a balanced look
  },

  scanSubtitle: {
    fontSize: 12, // Reduced font size for a more compact appearance
    color: "#666",
    marginBottom: 16,
    textAlign: "center", // Center subtitle
  },

  scanButton: {
    backgroundColor: "#3A8E44",
    paddingVertical: 10, // Slightly smaller padding for a compact button
    paddingHorizontal: 24,
    borderRadius: 24,
  },

  scanButtonText: {
    fontSize: 14, // Smaller font size for the button text
    fontWeight: "600",
    color: "#FFFFFF",
  },
  recentDiagnoses: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A8E44",
  },
  seeAllText: {
    marginLeft: -10,
    fontSize: 14,
    color: "#3A8E44",
  },
  diagnosisItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  diagnosisText: {
    fontSize: 16,
    color: "#37474F",
  },
  diagnosisDate: {
    fontSize: 14,
    color: "#666",
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  largeCameraButton: {
    backgroundColor: "#3A8E44",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    elevation: 5,
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
    minWidth: "100%",
    width: "100%",
  },

  largeCameraButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
