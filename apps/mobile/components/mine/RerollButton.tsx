import { StyleSheet } from "react-native";
import { PixelButton } from "../PixelButton";

interface RerollButtonProps {
  rerollsLeft: number;
  rerollsMax: number;
  onPress: () => void;
}

export function RerollButton({ rerollsLeft, rerollsMax, onPress }: RerollButtonProps) {
  const isDisabled = rerollsLeft <= 0;

  return (
    <PixelButton
      title={isDisabled ? "리롤 소진" : `다시 파기 (${rerollsLeft}/${rerollsMax})`}
      variant="secondary"
      disabled={isDisabled}
      onPress={onPress}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
});
