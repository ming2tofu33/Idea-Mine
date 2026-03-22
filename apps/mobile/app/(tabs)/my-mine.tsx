import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../hooks/useSession";
import { midnight } from "../../constants/theme";

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
      <Text style={styles.title}>Camp</Text>
      <Text style={styles.email}>{session?.user?.email}</Text>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  title: {
    fontFamily: "Galmuri11-Bold",
    fontSize: 24,
    color: midnight.accent.primary,
    marginBottom: 8,
  },
  email: {
    fontFamily: "Galmuri11",
    fontSize: 14,
    color: midnight.text.secondary,
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: midnight.bg.tertiary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: midnight.border.default,
  },
  signOutText: {
    fontFamily: "Galmuri11-Bold",
    color: midnight.semantic.danger,
    fontSize: 14,
  },
});
