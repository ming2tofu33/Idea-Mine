import { View, Modal, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";

export interface PixelModalButton {
  text: string;
  variant?: "primary" | "secondary" | "danger" | "pink";
  onPress: () => void;
}

interface PixelModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: PixelModalButton[];
  onClose: () => void;
}

export function PixelModal({ visible, title, message, buttons, onClose }: PixelModalProps) {
  const modalButtons = buttons ?? [{ text: "확인", variant: "primary" as const, onPress: onClose }];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <PixelText variant="subtitle" style={styles.title}>{title}</PixelText>
          <PixelText variant="body" style={styles.message}>{message}</PixelText>
          <View style={styles.buttons}>
            {modalButtons.map((btn, i) => (
              <PixelButton
                key={i}
                title={btn.text}
                variant={btn.variant ?? "secondary"}
                onPress={btn.onPress}
                style={styles.button}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: pixel.overlay.modal,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  title: {
    color: midnight.accent.gold,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    color: midnight.text.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  buttons: {
    gap: 8,
  },
  button: {
    alignSelf: "stretch",
  },
});
