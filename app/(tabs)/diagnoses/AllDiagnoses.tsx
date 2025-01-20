// app/diagnoses/AllDiagnoses.tsx

import React, { useEffect, useState } from "react";
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
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface Diagnosis {
  image: string; // URI string
  processed_image: string; // Predicted processed image URI string
  prediction: string;
  remedy: string;
  time: string;
}

export default function AllDiagnosesScreen() {
  const [allDiagnoses, setAllDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(
    null
  );
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        const savedDiagnoses = await AsyncStorage.getItem("recentDiagnoses");
        if (savedDiagnoses) {
          setAllDiagnoses(JSON.parse(savedDiagnoses));
        }
      } catch (error) {
        console.error("Error loading diagnoses:", error);
        Alert.alert("Error", "Failed to load diagnoses.");
      } finally {
        setIsLoading(false);
      }
    };
    loadDiagnoses();
  }, []);

  const handleDiagnosisClick = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setIsModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("all_diagnoses")}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{t("back")}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#3A8E44" />
      ) : allDiagnoses.length === 0 ? (
        <Text style={styles.noDiagnosesText}>{t("no_diagnoses_yet")}</Text>
      ) : (
        allDiagnoses.map((diagnosis, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDiagnosisClick(diagnosis)}
            style={styles.diagnosisTouchable}
          >
            <View style={styles.diagnosisCard}>
              {/* Predicted Image */}
              <Image
                source={{ uri: diagnosis.processed_image }}
                style={styles.diagnosisImage}
                onError={(e) =>
                  console.error("Image failed to load:", e.nativeEvent.error)
                }
                onLoad={() => console.log("Image loaded successfully")}
              />
              {/* Prediction Details */}
              <View style={styles.diagnosisDetails}>
                <Text style={styles.diagnosisPrediction}>
                  {diagnosis.prediction}
                </Text>
                <Text style={styles.diagnosisRemedy}>{diagnosis.remedy}</Text>
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
                    console.error("Image failed to load:", e.nativeEvent.error)
                  }
                  onLoad={() => console.log("Image loaded successfully")}
                />
                {/* Prediction Details */}
                <Text style={styles.modalTitle}>
                  {selectedDiagnosis.prediction}
                </Text>
                <Text style={styles.modalText}>
                  {t("remedy")}: {selectedDiagnosis.remedy}
                </Text>
                <Text style={styles.modalText}>
                  {t("time")}: {selectedDiagnosis.time}
                </Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100, // To avoid overlap with the camera button
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  backButton: {
    fontSize: 16,
    color: "#3A8E44",
  },
  noDiagnosesText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 50,
  },
  diagnosisTouchable: {
    marginBottom: 15,
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
  },
  diagnosisImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    objectFit: "contain",
  },
  diagnosisDetails: {
    flex: 1,
  },
  diagnosisPrediction: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  diagnosisRemedy: {
    color: "#888",
    marginBottom: 5,
  },
  diagnosisTime: {
    fontSize: 12,
    color: "#aaa",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
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
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
});
