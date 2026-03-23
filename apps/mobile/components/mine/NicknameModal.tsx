import { useState } from "react";
import { View, Modal, TextInput, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";

interface NicknameModalProps {
  visible: boolean;
  onSubmit: (nickname: string) => void;
}

export function NicknameModal({ visible, onSubmit }: NicknameModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length >= 2 && trimmed.length <= 20) {
      onSubmit(trimmed);
    }
  };

  const isValid = name.trim().length >= 2 && name.trim().length <= 20;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <PixelText variant="title" style={styles.title}>
            광부 이름을 정해주세요
          </PixelText>
          <PixelText variant="caption" style={styles.subtitle}>
            2~20자, 나중에 변경할 수 있어요
          </PixelText>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="닉네임 입력"
            placeholderTextColor={midnight.text.muted}
            maxLength={20}
            autoFocus
          />

          <PixelButton
            title="시작하기"
            variant="primary"
            disabled={!isValid}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: midnight.bg.elevated,
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: midnight.border.default,
  },
  title: {
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: midnight.text.muted,
    marginBottom: 20,
  },
  input: {
    backgroundColor: midnight.bg.surface,
    color: midnight.text.primary,
    fontFamily: "Galmuri11",
    fontSize: 16,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: midnight.border.default,
    marginBottom: 16,
  },
});
