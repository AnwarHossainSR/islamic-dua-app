import { duasApi } from "@/api/duas.api";
import { Badge, Card, CardContent, Loader } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useTheme } from "@/hooks/useTheme";
import type { Dua } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { Book, ChevronRight, Search, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DuasScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [duas, setDuas] = useState<Dua[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDuas();
  }, [search, selectedCategory]);

  const loadData = async () => {
    try {
      const [duasData, categoriesData] = await Promise.all([
        duasApi.getAll(),
        duasApi.getCategories(),
      ]);
      setDuas(duasData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading duas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDuas = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await duasApi.getAll({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: search || undefined,
      });
      setDuas(data);
    } catch (error) {
      console.error("Error loading duas:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.container}>
        {/* Search and Filter */}
        <View style={styles.filterSection}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Search color={colors.mutedForeground} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search duas..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            <Pressable
              onPress={() => setSelectedCategory("all")}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === "all"
                      ? colors.primary
                      : colors.secondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === "all"
                        ? colors.primaryForeground
                        : colors.foreground,
                  },
                ]}
              >
                All
              </Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.name_bn)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === cat.name_bn
                        ? colors.primary
                        : colors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        selectedCategory === cat.name_bn
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {cat.name_bn}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Duas List */}
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadDuas(true)}
              tintColor={colors.primary}
            />
          }
        >
          {duas.map((dua) => (
            <Pressable
              key={dua.id}
              onPress={() =>
                navigation.navigate(ROUTES.DUA_DETAIL, { duaId: dua.id })
              }
            >
              <Card style={styles.duaCard}>
                <CardContent style={styles.duaContent}>
                  <View style={styles.duaHeader}>
                    <View style={styles.duaInfo}>
                      <View style={styles.duaTitleRow}>
                        <Text
                          style={[
                            styles.duaTitle,
                            { color: colors.foreground },
                          ]}
                          numberOfLines={1}
                        >
                          {dua.title_bn}
                        </Text>
                        {dua.is_important && (
                          <Star color="#eab308" size={16} fill="#eab308" />
                        )}
                      </View>
                      {dua.category && (
                        <Badge variant="secondary" style={styles.categoryBadge}>
                          {dua.category}
                        </Badge>
                      )}
                    </View>
                    <ChevronRight color={colors.mutedForeground} size={20} />
                  </View>

                  {dua.dua_text_ar && (
                    <Text
                      style={[styles.arabicText, { color: colors.foreground }]}
                      numberOfLines={2}
                    >
                      {dua.dua_text_ar}
                    </Text>
                  )}

                  {dua.translation_bn && (
                    <Text
                      style={[
                        styles.translation,
                        { color: colors.mutedForeground },
                      ]}
                      numberOfLines={2}
                    >
                      {dua.translation_bn}
                    </Text>
                  )}
                </CardContent>
              </Card>
            </Pressable>
          ))}

          {duas.length === 0 && (
            <View style={styles.emptyState}>
              <Book color={colors.mutedForeground} size={48} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No Duas Found
              </Text>
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                {search ? "Try a different search term" : "No duas available"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  filterSection: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesScroll: {
    marginTop: 12,
  },
  categoriesContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  content: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
    paddingBottom: 32,
  },
  duaCard: {},
  duaContent: {
    paddingTop: 16,
    gap: 10,
  },
  duaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  duaInfo: {
    flex: 1,
    gap: 6,
  },
  duaTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  duaTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  categoryBadge: {
    alignSelf: "flex-start",
  },
  arabicText: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "right",
    fontFamily: "System",
  },
  translation: {
    fontSize: 13,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
