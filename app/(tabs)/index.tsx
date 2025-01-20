// app/(tabs)/index.tsx

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
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for camera icon
import { useRouter } from "expo-router"; // For navigation

const { width } = Dimensions.get("window");
const API_KEY = "9dac1789f6909ca2205c94277b32f8bd"; // Replace with your actual API key

interface Diagnosis {
  image: string; // Original image URI
  processed_image: string; // Processed image URI (base64)
  prediction: string;
  remedy: string;
  recommendation: {
    name: string;
    symptoms: string[];
    control_methods: {
      biological: string[];
      chemical: string[];
      mechanical: string[];
    };
  };
  time: string;
}

export default function HomeScreen() {
  // State declarations
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newsImages, setNewsImages] = useState({
    firstImageError: false,
    secondImageError: false,
    thirdImageError: false,
    fourthImageError: false,
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [recentDiagnoses, setRecentDiagnoses] = useState<Diagnosis[]>([]);
  const [Name, setName] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(
    null
  );
  const [randomAvatar, setRandomAvatar] = useState<number>(
    Math.floor(Math.random() * 70)
  );

  // Language options
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "bn", label: "বাংলা" },
  ];
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  const { t, i18n } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    fetchWeatherData();
    loadLanguagePreference();
  }, []);

  useEffect(() => {
    const checkStoredData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("Name");
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const isVerified = await AsyncStorage.getItem("isVerified");
        if (!storedName || !storedPhoneNumber) {
          setShowPhoneModal(true);
        } else if (isVerified !== "true") {
          setShowOtpModal(true);
        } else {
          setName(storedName);
          setPhoneNumber(storedPhoneNumber);
          setShowPhoneModal(false);
          setShowOtpModal(false);
        }
      } catch (error) {
        console.error("Error checking stored data:", error);
        setShowPhoneModal(true);
      }
    };

    checkStoredData();
  }, []);

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        const savedDiagnoses = await AsyncStorage.getItem("recentDiagnoses");
        if (savedDiagnoses) {
          setRecentDiagnoses(JSON.parse(savedDiagnoses));
        }
      } catch (error) {
        console.error("Error loading diagnoses:", error);
      }
    };
    loadDiagnoses();
  }, []);

  useEffect(() => {
    const saveDiagnoses = async () => {
      try {
        await AsyncStorage.setItem(
          "recentDiagnoses",
          JSON.stringify(recentDiagnoses)
        );
      } catch (error) {
        console.error("Error saving diagnoses:", error);
      }
    };
    saveDiagnoses();
  }, [recentDiagnoses]);

  const loadLanguagePreference = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem("language");
      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
        setCurrentLanguage(storedLanguage);
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(t("location_permission_denied"));
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            units: "metric",
            appid: API_KEY,
          },
        }
      );

      setWeatherData(response.data);
    } catch (error) {
      setLocationError(t("unable_to_fetch_weather"));
      console.error("Weather fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert(
        t("invalid_phone_number_title"),
        t("invalid_phone_number_message")
      );
      return;
    }
    try {
      await AsyncStorage.setItem("Name", Name);
      await AsyncStorage.setItem("phoneNumber", phoneNumber);
      // Simulate OTP request
      Alert.alert(t("otp_sent_title"), t("otp_sent_message"));
      setShowPhoneModal(false);
      setShowOtpModal(true);
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert(t("error_title"), t("save_details_failed"));
    }
  };

  const handleOtpSubmit = async () => {
    if (otp !== "1234") {
      // Replace with actual OTP verification logic
      Alert.alert(t("invalid_otp_title"), t("invalid_otp_message"));
      return;
    }

    try {
      // Store verification status
      await AsyncStorage.setItem("isVerified", "true");
      Alert.alert(t("success_title"), t("welcome_message"));
      setShowOtpModal(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert(t("error_title"), t("verify_otp_failed"));
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permission_denied_title"),
          t("camera_permission_required")
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
        Alert.alert(
          t("no_image_selected_title"),
          t("no_image_selected_message")
        );
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert(t("error_title"), t("camera_access_error"));
    }
  };

  const switchLanguage = async (itemValue: string): Promise<void> => {
    try {
      await AsyncStorage.setItem("language", itemValue);
      i18n.changeLanguage(itemValue); // Change language
      setCurrentLanguage(itemValue);
      Alert.alert(t("language_switched_title"), t("language_switched_message"));
    } catch (error) {
      console.error("Error saving language preference:", error);
      Alert.alert(t("error_title"), t("switch_language_failed"));
    }
  };

  const uploadImage = async (
    image: ImagePicker.ImagePickerAsset
  ): Promise<void> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        name: image.uri.split("/").pop() || "image.jpg",
        type: "image/jpeg",
      });

      const response = await axios.post(
        "https://4512-152-58-249-139.ngrok-free.app/predict/", // Replace with your backend URL
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          validateStatus: (status) => status < 500, // Allow handling of 4xx responses
        }
      );

      if (response.status === 200) {
        console.log("Headers received:", response.headers);
        const { prediction, remedy, recommendation, processed_image } =
          response.data;

        // Log the prediction, remedy, and recommendation for debugging
        console.log("Prediction:", prediction);
        console.log("Remedy:", remedy);
        console.log("Recommendation:", recommendation);
        console.log("Processed Image:", processed_image);

        if (!processed_image) {
          console.warn("Processed image is missing in the response.");
        }

        // Convert base64 processed image back to a URI
        const processedImageUri = processed_image
          ? `data:image/jpeg;base64,${processed_image}`
          : null;

        // Create a new diagnosis object with all relevant data
        const newDiagnosis: Diagnosis = {
          image: image.uri,
          processed_image: processedImageUri || "",
          prediction: prediction || t("no_prediction"),
          remedy: remedy || t("no_remedy"),
          recommendation: recommendation || {
            name: t("no_recommendation_available"),
            symptoms: [],
            control_methods: { biological: [], chemical: [], mechanical: [] },
          },
          time: new Date().toLocaleString(),
        };

        // Update the recent diagnoses state
        setRecentDiagnoses((prev) => [newDiagnosis, ...prev]);
        Alert.alert(t("success_title"), t("prediction_received"));
      } else if (response.status === 204) {
        Alert.alert(t("no_prediction_title"), t("no_prediction_message"));
      } else {
        // Handle other response statuses (e.g., 400 Bad Request)
        const errorMessage = response.data?.message || t("unknown_error");
        Alert.alert("Error", errorMessage);
      }
    } catch (error: any) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        `${t("upload_error")}: ${error.message || t("unknown_error")}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDiagnosisClick = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setIsModalVisible(true);
  };

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

  // Predefined fake images for news carousel
  const fakeNewsImages = [
    "https://picsum.photos/300/200?random=1",
    "https://picsum.photos/300/200?random=2",
    "https://picsum.photos/300/200?random=3",
    "https://picsum.photos/300/200?random=4",
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Greetings and Weather Card */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t("welcome_back")} 👋</Text>
            <Text style={styles.headerSubtitle}>{Name || t("user")}</Text>
          </View>
          <Image
            source={{
              uri: `https://i.pravatar.cc/150?img=${randomAvatar}`,
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
          {fakeNewsImages.map((uri, index) => (
            <View style={styles.newsCard} key={index}>
              <Image
                source={{ uri }}
                style={styles.newsImage}
                onError={() =>
                  setNewsImages((prevState) => ({
                    ...prevState,
                    [`image${index}`]: true,
                  }))
                }
              />
              <Text style={styles.newsTitle}>
                {t(`news_title_${index + 1}`)}
              </Text>
              <Text style={styles.newsSubtitle}>
                {t(`news_description_${index + 1}`)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Scan Card */}
        <View style={styles.scanCard}>
          <Text style={styles.scanTitle}>{t("scan_card_title")}</Text>
          <Text style={styles.scanSubtitle}>{t("scan_card_description")}</Text>
          <TouchableOpacity style={styles.scanButton} onPress={openCamera}>
            <Text style={styles.scanButtonText}>{t("scan_now")}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Diagnoses */}
        <View style={styles.recentDiagnoses}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("recent_diagnoses")}</Text>
            {recentDiagnoses.length > 3 && (
              <TouchableOpacity
                onPress={() => router.push("/diagnoses/AllDiagnoses")}
              >
                <Text style={styles.seeAllText}>{t("see_all")}</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentDiagnoses.length === 0 ? (
            <Text style={styles.noDiagnosesText}>{t("no_diagnoses_yet")}</Text>
          ) : (
            recentDiagnoses.slice(0, 3).map((diagnosis, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDiagnosisClick(diagnosis)}
              >
                <View style={styles.diagnosisCard}>
                  {/* Predicted Image */}
                  <Image
                    source={{ uri: diagnosis.processed_image }}
                    style={styles.diagnosisImage}
                    onError={(e) =>
                      console.error(
                        "Image failed to load:",
                        e.nativeEvent.error
                      )
                    }
                    onLoad={() => console.log("Image loaded successfully")}
                  />
                  {/* Prediction Details */}
                  <View style={styles.diagnosisDetails}>
                    <Text style={styles.diagnosisPrediction}>
                      {diagnosis.prediction}
                    </Text>
                    <Text style={styles.diagnosisRemedy}>
                      {diagnosis.remedy}
                    </Text>
                    <Text style={styles.diagnosisTime}>{diagnosis.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Modal to Show Diagnosis Details */}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedDiagnosis && (
                  <>
                    {/* Predicted Image */}
                    <Image
                      source={{ uri: selectedDiagnosis.processed_image }}
                      style={styles.modalImage}
                      onError={(e) =>
                        console.error(
                          "Image failed to load:",
                          e.nativeEvent.error
                        )
                      }
                      onLoad={() => console.log("Image loaded successfully")}
                    />
                    {/* Prediction Details */}
                    <Text style={styles.modalTitle}>
                      {selectedDiagnosis.prediction}
                    </Text>

                    {/* Scrollable Text Content */}
                    <ScrollView
                      style={styles.modalTextContainer}
                      contentContainerStyle={styles.scrollViewContent}
                    >
                      {/* Remedy Details */}
                      <Text style={styles.modalText}>
                        {t("remedy")}: {selectedDiagnosis.remedy}
                      </Text>
                      {/* Recommendation Details */}
                      <Text style={styles.modalText}>
                        {t("recommendation_name")}:{" "}
                        {selectedDiagnosis.recommendation.name}
                      </Text>
                      <Text style={styles.modalText}>
                        {t("symptoms")}:{" "}
                        {selectedDiagnosis.recommendation.symptoms.join(", ")}
                      </Text>
                      <Text style={styles.modalText}>
                        {t("control_methods")}:{"\n"}Biological:{" "}
                        {selectedDiagnosis.recommendation.control_methods.biological.join(
                          ", "
                        )}
                        {"\n"}Chemical:{" "}
                        {selectedDiagnosis.recommendation.control_methods.chemical.join(
                          ", "
                        )}
                        {"\n"}Mechanical:{" "}
                        {selectedDiagnosis.recommendation.control_methods.mechanical.join(
                          ", "
                        )}
                      </Text>
                    </ScrollView>
                  </>
                )}
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>{t("close")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>

      {/* Phone Details Modal */}
      <Modal visible={showPhoneModal} transparent={true} animationType="slide">
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
      <Modal visible={showOtpModal} transparent={true} animationType="slide">
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

      {/* Large Camera Icon Button */}
      <View style={styles.cameraButtonContainer}>
        <TouchableOpacity style={styles.largeCameraButton} onPress={openCamera}>
          <Ionicons name="camera" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainContent: {
    padding: 20,
    paddingBottom: 100, // To avoid overlap with the camera button
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
  weatherCard: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  weatherLocation: {
    fontSize: 18,
    fontWeight: "600",
  },
  weatherTemperature: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  weatherDescription: {
    fontSize: 16,
    color: "#555",
  },
  carouselContainer: {
    paddingVertical: 10,
  },
  newsCard: {
    width: width * 0.7,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  newsImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 10,
    color: "#333",
  },
  newsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  scanCard: {
    backgroundColor: "#e6ffe6",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  scanSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: "#3A8E44",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  recentDiagnoses: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3A8E44",
  },
  diagnosisCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 15,
  },
  diagnosisImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: "cover",
  },
  diagnosisDetails: {
    flex: 1,
  },
  diagnosisPrediction: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  diagnosisRemedy: {
    color: "#888",
    marginBottom: 5,
    fontSize: 14,
  },
  diagnosisTime: {
    fontSize: 12,
    color: "#aaa",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%", // Limit the height to 80% of the screen
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: "contain",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  modalTextContainer: {
    flex: 1, // Take up remaining space
    width: "100%",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "left",
    lineHeight: 22, // Improve readability for long texts
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollViewContent: {
    paddingBottom: 20, // Ensure space at the bottom
  },
  card: {
    width: "100%",
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  noDiagnosesText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  largeCameraButton: {
    backgroundColor: "#3A8E44",
    padding: 20,
    borderRadius: 60,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButton: {
    backgroundColor: "#3A8E44",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
