import { duasApi } from "@/api/duas.api";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Loader,
} from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import type { Dua } from "@/types";
import { useRoute } from "@react-navigation/native";
import { Book, Info, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function DuaDetailScreen() {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const [dua, setDua] = useState<Dua | null>(null);
  const [loading, setLoading] = useState(true);

  const { duaId } = route.params || {};

  useEffect(() => {
    if (duaId) loadDua();
  }, [duaId]);

  const loadDua = async () => {
    try {
      const data = await duasApi.getById(duaId);
      setDua(data);
    } catch (error) {
      console.error("Error loading dua:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!dua) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.foreground }}>Dua not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Book color={colors.primary} size={24} />
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <CardTitle style={styles.title}>{dua.title_bn}</CardTitle>
                {dua.is_important && (
                  <Star color="#eab308" size={18} fill="#eab308" />
                )}
              </View>
              {dua.title_ar && (
                <Text
                  style={[
                    styles.arabicTitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {dua.title_ar}
                </Text>
              )}
              {dua.category && (
                <Badge variant="secondary" style={styles.categoryBadge}>
                  {dua.category}
                </Badge>
              )}
            </View>
          </View>
        </CardHeader>
      </Card>

      {/* Arabic Text */}
      {dua.dua_text_ar && (
        <Card>
          <CardHeader>
            <CardTitle style={styles.sectionTitle}>দোয়া (আরবি)</CardTitle>
          </CardHeader>
          <CardContent>
            <View
              style={[
                styles.arabicContainer,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text style={[styles.arabicText, { color: colors.foreground }]}>
                {dua.dua_text_ar}
              </Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Transliteration */}
      {dua.transliteration && (
        <Card>
          <CardHeader>
            <CardTitle style={styles.sectionTitle}>উচ্চারণ</CardTitle>
          </CardHeader>
          <CardContent>
            <Text
              style={[styles.transliteration, { color: colors.foreground }]}
            >
              {dua.transliteration}
            </Text>
          </CardContent>
        </Card>
      )}

      {/* Translation */}
      {dua.translation_bn && (
        <Card>
          <CardHeader>
            <CardTitle style={styles.sectionTitle}>অনুবাদ</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={[styles.translation, { color: colors.foreground }]}>
              {dua.translation_bn}
            </Text>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {dua.benefits && (
        <Card>
          <CardHeader>
            <CardTitle style={styles.sectionTitle}>ফযীলত</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={[styles.benefits, { color: colors.foreground }]}>
              {dua.benefits}
            </Text>
          </CardContent>
        </Card>
      )}

      {/* Reference */}
      {(dua.source || dua.reference) && (
        <Card>
          <CardHeader>
            <View style={styles.refHeaderRow}>
              <Info color={colors.mutedForeground} size={18} />
              <CardTitle style={styles.sectionTitle}>রেফারেন্স</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            {dua.source && (
              <Text style={[styles.refText, { color: colors.mutedForeground }]}>
                সূত্র: {dua.source}
              </Text>
            )}
            {dua.reference && (
              <Text style={[styles.refText, { color: colors.mutedForeground }]}>
                রেফারেন্স: {dua.reference}
              </Text>
            )}
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
  },
  arabicTitle: {
    fontSize: 16,
    marginTop: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
  },
  arabicContainer: {
    padding: 20,
    borderRadius: 12,
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 48,
    textAlign: "right",
    fontFamily: "System",
  },
  transliteration: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
  },
  translation: {
    fontSize: 15,
    lineHeight: 24,
  },
  benefits: {
    fontSize: 15,
    lineHeight: 24,
  },
  refHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
});
