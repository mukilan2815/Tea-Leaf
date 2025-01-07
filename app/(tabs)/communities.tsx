import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
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
        <Text style={styles.headerTitle}>🌐 Group Chat</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 60, // Leave space for input area
  },
  chatContent: {
    paddingVertical: 16,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "80%",
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#E3F2FD",
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E0",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#37474F",
  },
  messageText: {
    fontSize: 14,
    color: "#1F2937",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    width: "100%",
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
    backgroundColor: "#1565C0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
