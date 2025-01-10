import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

export default function Communities() {
  // Fake chat data
  const messages = [
    {
      id: 1,
      sender: "Alice",
      message: "Hey everyone, how's it going?",
      isMine: false,
    },
    {
      id: 2,
      sender: "You",
      message: "Hi Alice! All good here, how about you?",
      isMine: true,
    },
    {
      id: 3,
      sender: "Bob",
      message: "Hey guys! I'm doing great too.",
      isMine: false,
    },
    {
      id: 4,
      sender: "You",
      message: "Awesome! Let's start the discussion.",
      isMine: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Tea Community</Text>
      </View>

      {/* Chat Area */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.chatBubble,
              msg.isMine ? styles.myBubble : styles.otherBubble,
            ]}
          >
            {!msg.isMine && <Text style={styles.senderName}>{msg.sender}</Text>}
            <Text style={styles.messageText}>{msg.message}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Leafy Background */}
      <Image
        source={{ uri: "https://via.placeholder.com/300x150?text=Leaves" }} // Replace with a proper leaf asset URL
        style={styles.leafImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 34,
    flex: 1,
    backgroundColor: "#F5FAF0", // Light green for agricultural theme
  },
  header: {
    backgroundColor: "#3A8E44", // Green header
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 70, // Leave space for input area
  },
  chatContent: {
    paddingVertical: 16,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "80%",
    elevation: 1,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#E3FCEF", // Light green for self messages
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF7E0", // Light earthy yellow for other messages
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#3A8E44",
  },
  messageText: {
    fontSize: 14,
    color: "#1F2937",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
    color: "#1F2937",
  },
  sendButton: {
    backgroundColor: "#3A8E44",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  leafImage: {
    position: "absolute",
    bottom: 80,
    right: -20,
    width: 120,
    height: 120,
    opacity: 0.1, // Semi-transparent
  },
});
