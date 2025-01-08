import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import md5 from "md5";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const { t } = useTranslation(); // Initialize translation
  const email = "johndoe@example.com";
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(
    email
  )}?d=identicon`;

  const weather = {
    location: "New York",
    temperature: 24,
    condition: "Sunny",
    icon: "sunny", // Placeholder for weather icon
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
    // Add more news items as needed
  ];

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
              {/* Replace with actual weather icon if available */}
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
      </ScrollView>
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
    paddingBottom: 32,
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
});
