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
    backgroundColor: "#101218",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EC4899",
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: "#A0A6B4",
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: "#222433",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#2E3242",
  },
  signOutText: {
    color: "#B85450",
    fontSize: 14,
    fontWeight: "bold",
  },
});
