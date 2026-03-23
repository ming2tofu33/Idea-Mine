import { View, StyleSheet } from "react-native";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";

interface VaultButtonProps {
  count: number;
  isLoading: boolean;
  onPress: () => void;
}

export function VaultButton({ count, isLoading, onPress }: VaultButtonProps) {
  return (
    <View style={styles.container}>
      <PixelButton
        title={isLoading ? "반입 중..." : `Vault로 반입하기 (${count})`}
        variant="pink"
        disabled={count === 0 || isLoading}
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: midnight.border.subtle,
  },
});
