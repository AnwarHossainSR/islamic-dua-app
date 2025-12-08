import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  style?: ViewStyle;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  style,
}: PaginationProps) {
  const { colors } = useTheme();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't render if only one page or no items
  if (totalItems <= itemsPerPage) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <View style={[styles.container, { borderTopColor: colors.border }, style]}>
      {showInfo && (
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          {startItem}-{endItem} of {totalItems}
        </Text>
      )}

      <View style={styles.buttonsContainer}>
        {/* First Page */}
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.secondary },
            isFirstPage && styles.buttonDisabled,
          ]}
          onPress={() => onPageChange(1)}
          disabled={isFirstPage}
        >
          <ChevronsLeft color={isFirstPage ? colors.muted : colors.foreground} size={18} />
        </Pressable>

        {/* Previous Page */}
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.secondary },
            isFirstPage && styles.buttonDisabled,
          ]}
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={isFirstPage}
        >
          <ChevronLeft color={isFirstPage ? colors.muted : colors.foreground} size={18} />
        </Pressable>

        {/* Page Indicator */}
        <View style={[styles.pageIndicator, { borderColor: colors.border }]}>
          <Text style={[styles.pageText, { color: colors.foreground }]}>
            {currentPage} / {totalPages}
          </Text>
        </View>

        {/* Next Page */}
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.secondary },
            isLastPage && styles.buttonDisabled,
          ]}
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={isLastPage}
        >
          <ChevronRight color={isLastPage ? colors.muted : colors.foreground} size={18} />
        </Pressable>

        {/* Last Page */}
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.secondary },
            isLastPage && styles.buttonDisabled,
          ]}
          onPress={() => onPageChange(totalPages)}
          disabled={isLastPage}
        >
          <ChevronsRight color={isLastPage ? colors.muted : colors.foreground} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  infoText: {
    fontSize: 13,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  pageText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
