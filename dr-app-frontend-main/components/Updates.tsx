import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from "react-native";
import {
  Button,
  Card,
  Paragraph,
  FAB,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons"; // Make sure to install this package

type Post = {
  id: number;
  title: string;
  description: string;
  author: string;
  comments: number;
  authority?: boolean;
};

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Joey Tribbiani",
    description:
      "We're organizing a food drive to support families affected by the disaster. Please donate non-perishable items at the community center.",
    author: "John Doe",
    comments: 15,
  },
  {
    id: 2,
    title: "Ross Geller",
    description:
      "If anyone needs shelter or knows someone who does, please reach out! We have a safe space available for those in need.",
    author: "Jane Smith",
    comments: 10,
    authority: true,
  },
  {
    id: 3,
    title: "Rachel Green",
    description:
      "Medical supplies are running low at the local clinic. Please help by donating any first aid items or medications you can spare.",
    author: "Dr. Emily",
    comments: 30,
  },
];

const CommunityPosts = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      // For demonstration, you can re-fetch the posts or reset them as needed
      setRefreshing(false);
    }, 1000);
  };

  const handleCommentsPress = (title: string) => {
    Alert.alert(`Comments for: ${title}`, "Navigating to comments...");
  };

  return (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {posts.map((post) => (
        <Card
          key={post.id}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View style={styles.postContent}>
              <Card.Title
                title={
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", paddingTop: 5 }}>
                      {post.title}
                    </Text>
                    {post.authority && (
                      <View
                        style={{
                          backgroundColor: "#45b7ff",
                          borderRadius: 5,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          paddingHorizontal: 8,
                        }}
                      >
                        <Icon
                          color="white"
                          name="check"
                        />
                        <Text
                          style={{
                            color: "#fff",
                            // paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                          variant="bodySmall"
                        >
                          Verified Local Authority
                        </Text>
                      </View>
                    )}
                  </View>
                }
                titleVariant="bodyMedium"
                subtitle="Sep 27 at 3:30 pm"
                subtitleStyle={{ paddingBottom: 12, color: "#7b7b7b" }}
              />
              <Card.Content>
                <Paragraph style={{ color: "#7b7b7b", marginTop: -10 }}>
                  {post.description}
                </Paragraph>
              </Card.Content>
              <View style={styles.postActions}>
                <Button
                  icon="comment"
                  labelStyle={styles.buttonLabel}
                  onPress={() => handleCommentsPress(post.title)}
                >
                  {post.comments} Comments
                </Button>
              </View>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const NewsFeed = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNews = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${"hurricane%20helene"}&apiKey=979f7b95c14e4900a79731209c13f879`
      );
      const sortedArticles = response.data.articles.sort((a: any, b: any) => {
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      });
      setNews(sortedArticles);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        animating={true}
        size="small"
        style={styles.loadingIndicator}
      />
    );
  }

  return (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {news.map(
        (article, index) =>
          article.description &&
          article.url && (
            <Card
              key={index}
              style={styles.card}
              onPress={() => Linking.openURL(article.url)}
            >
              <View style={styles.cardContent}>
                {article.urlToImage && (
                  <Card.Cover
                    style={{ borderRadius: 5 }}
                    source={{ uri: article.urlToImage }}
                  />
                )}
                <Card.Title
                  titleNumberOfLines={3}
                  title={article.title}
                  titleVariant="bodyMedium"
                  titleStyle={{ fontWeight: "bold", paddingVertical: 15 }}
                  subtitle={`${new Date(
                    article.publishedAt
                  ).toLocaleDateString()}`}
                  subtitleStyle={{ color: "#7b7b7b", marginBottom: 10 }}
                />
                <Card.Content>
                  <Paragraph style={{ color: "#7b7b7b", marginBottom: 15 }}>
                    {article.description.length > 150
                      ? `${article.description.slice(0, 150)}...`
                      : article.description}
                  </Paragraph>
                </Card.Content>
              </View>
            </Card>
          )
      )}
    </ScrollView>
  );
};

const Updates = () => {
  const [activeTab, setActiveTab] = useState<"community" | "news">("news");

  const handleNewPost = () => {
    Alert.alert("Create New Post", "Navigating to the new post screen...");
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Button
          mode={activeTab === "news" ? "contained" : "outlined"}
          onPress={() => setActiveTab("news")}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === "news" ? "#FFB248" : undefined,
          }}
          labelStyle={{ color: activeTab === "news" ? "white" : "black" }}
          contentStyle={{ paddingVertical: 4 }}
        >
          News Feed
        </Button>
        <Button
          mode={activeTab === "community" ? "contained" : "outlined"}
          onPress={() => setActiveTab("community")}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === "community" ? "#FFB248" : undefined,
          }}
          labelStyle={{ color: activeTab === "community" ? "white" : "black" }}
          contentStyle={{ paddingVertical: 4 }}
        >
          Community Posts
        </Button>
      </View>

      {activeTab === "community" ? <CommunityPosts /> : <NewsFeed />}

      {activeTab === "community" && (
        <FAB
          style={styles.fab}
          icon="plus"
          label=""
          onPress={handleNewPost}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  card: {
    borderRadius: 5,
    backgroundColor: "white",
    shadowOpacity: 0.0001,
    shadowColor: "#ddd",
    marginBottom: 15,
  },
  cardContent: {
    flexDirection: "column",
    padding: 10,
  },
  postContent: {
    flex: 1,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonLabel: {
    fontSize: 12,
    color: "#FFB248",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 10,
    backgroundColor: "#FFB248",
    borderRadius: 100,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
  },
});

export default Updates;
