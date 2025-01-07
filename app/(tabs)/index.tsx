import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal } from "react-native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => setCameraVisible(true)}
      >
        <Ionicons name="camera" size={64} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCameraVisible(false)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    backgroundColor: "#1E88E5",
    borderRadius: 50,
    padding: 16,
    elevation: 5,
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
});
