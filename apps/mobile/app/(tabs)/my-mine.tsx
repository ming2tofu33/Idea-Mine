import { View, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../hooks/useSession";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";

export default function MyMineScreen() {
  const { session } = useSession();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <PixelText variant="title" style={{ marginBottom: 8 }}>
        Camp
      </PixelText>
      <PixelText variant="caption" style={{ marginBottom: 32 }}>
        {session?.user?.email}
      </PixelText>

      <PixelButton variant="danger" onPress={handleSignOut}>
        Sign Out
      </PixelButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
