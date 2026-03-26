import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { signInWithOAuth } from "../lib/supabase";
import { withMinDelay } from "../lib/minDelay";
import { midnight } from "../constants/theme";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import { PixelModal } from "../components/shared/PixelModal";
import { usePixelModal } from "../hooks/usePixelModal";
import { IdCardScan } from "../components/IdCardScan";

export default function SignInScreen() {
  const { modalState, showModal, hideModal } = usePixelModal();
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  async function handleOAuth(provider: "google" | "github") {
    setLoading(provider);
    try {
      await withMinDelay(signInWithOAuth(provider), 1500);
    } catch (error: any) {
      showModal("로그인 오류", error.message);
    }
    setLoading(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <PixelText
          variant="title"
          style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}
        >
          IDEA MINE
        </PixelText>
        <PixelText
          variant="caption"
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          아이디어를 채굴해보세요
        </PixelText>

        <View style={styles.buttons}>
          {loading ? (
            <IdCardScan variant="preparing" />
          ) : (
            <>
              <PixelButton
                variant="secondary"
                size="lg"
                onPress={() => handleOAuth("google")}
                style={{ alignSelf: "stretch" }}
              >
                구글로 시작하기
              </PixelButton>

              <PixelButton
                variant="secondary"
                size="lg"
                onPress={() => handleOAuth("github")}
                style={{ alignSelf: "stretch" }}
              >
                깃허브로 시작하기
              </PixelButton>
            </>
          )}
        </View>

        <PixelText
          variant="muted"
          style={{ textAlign: "center", marginTop: 24 }}
        >
          계속하면 이용약관에 동의하는 것으로 간주합니다
        </PixelText>
      </View>

      <PixelModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        buttons={modalState.buttons}
        onClose={hideModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttons: {
    gap: 12,
    alignItems: "center",
  },
});
