# Supabase Auth Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expo 프론트엔드에서 Supabase Auth를 연동하여 이메일 로그인/회원가입을 구현하고, 인증 상태에 따라 탭 화면과 로그인 화면을 분기한다.

**Architecture:** `@supabase/supabase-js` 클라이언트를 `expo-secure-store` 기반 토큰 저장소와 함께 초기화한다. Expo Router의 레이아웃에서 auth 상태를 확인하고, 비인증 유저는 로그인 화면으로 리다이렉트한다. auth 상태는 React Context로 전역 관리.

**Tech Stack:** @supabase/supabase-js, expo-secure-store, expo-router, React Context

---

## File Structure

```
apps/mobile/
├── lib/
│   └── supabase.ts              # Supabase 클라이언트 초기화
├── hooks/
│   └── useSession.ts            # auth 상태 훅
├── app/
│   ├── _layout.tsx              # 수정: AuthProvider 래핑 + auth 분기
│   ├── sign-in.tsx              # 새로 생성: 로그인/회원가입 화면
│   └── (tabs)/
│       └── my-mine.tsx          # 수정: 로그아웃 버튼 추가
```

---

## Chunk 1: 라이브러리 설치 + Supabase 클라이언트

### Task 1: 의존성 설치

**Files:**
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Supabase + SecureStore 설치**

```bash
cd apps/mobile && npx expo install @supabase/supabase-js expo-secure-store
```

- [ ] **Step 2: 설치 확인**

```bash
cd apps/mobile && node -e "require('@supabase/supabase-js'); console.log('supabase OK')"
```

Expected: `supabase OK`

- [ ] **Step 3: 커밋**

```bash
git add apps/mobile/package.json apps/mobile/package-lock.json
git commit -m "deps: add @supabase/supabase-js and expo-secure-store"
```

---

### Task 2: Supabase 클라이언트 초기화

**Files:**
- Create: `apps/mobile/lib/supabase.ts`

- [ ] **Step 1: Supabase 클라이언트 작성**

```typescript
import "react-native-url-polyfill/dist/setup";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// SecureStore는 웹에서 작동하지 않으므로 플랫폼 분기
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 2: URL polyfill 설치** (React Native에서 URL 파싱에 필요)

```bash
cd apps/mobile && npm install react-native-url-polyfill
```

- [ ] **Step 3: 커밋**

```bash
git add apps/mobile/lib/supabase.ts apps/mobile/package.json apps/mobile/package-lock.json
git commit -m "feat: initialize Supabase client with SecureStore adapter"
```

---

## Chunk 2: Auth 상태 관리 + 라우팅 분기

### Task 3: useSession 훅

**Files:**
- Create: `apps/mobile/hooks/useSession.ts`

- [ ] **Step 1: Auth 세션 훅 작성**

```typescript
import { useEffect, useState, createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
};

export const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export function useSession() {
  return useContext(SessionContext);
}

export function useSessionProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, isLoading };
}
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/hooks/useSession.ts
git commit -m "feat: add useSession hook with Supabase auth state"
```

---

### Task 4: Root Layout에 Auth 분기 적용

**Files:**
- Modify: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: _layout.tsx를 AuthProvider + 분기 로직으로 교체**

```typescript
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import {
  SessionContext,
  useSession,
  useSessionProvider,
} from "../hooks/useSession";
import { View, ActivityIndicator, StyleSheet } from "react-native";

function AuthGate() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "sign-in";

    if (!session && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const sessionState = useSessionProvider();

  return (
    <SessionContext.Provider value={sessionState}>
      <AuthGate />
    </SessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#101218",
    alignItems: "center",
    justifyContent: "center",
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat: add auth gate to root layout - redirect unauthenticated users"
```

---

## Chunk 3: 로그인 화면 + 로그아웃

### Task 5: 로그인/회원가입 화면

**Files:**
- Create: `apps/mobile/app/sign-in.tsx`

- [ ] **Step 1: 이메일 로그인/회원가입 화면 작성**

```typescript
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else {
        Alert.alert("Check your email", "We sent you a confirmation link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert("Sign In Error", error.message);
      }
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>IDEA MINE</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "Create your miner account" : "Welcome back, miner"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7E8596"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7E8596"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101218",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#EC4899",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A6B4",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#222433",
    borderRadius: 8,
    padding: 14,
    color: "#C8CDD8",
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2E3242",
  },
  button: {
    backgroundColor: "#EC4899",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleText: {
    color: "#A0A6B4",
    textAlign: "center",
    fontSize: 14,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/app/sign-in.tsx
git commit -m "feat: add email sign-in/sign-up screen"
```

---

### Task 6: My Mine에 로그아웃 추가

**Files:**
- Modify: `apps/mobile/app/(tabs)/my-mine.tsx`

- [ ] **Step 1: 로그아웃 버튼 추가**

```typescript
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../hooks/useSession";

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
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/app/\(tabs\)/my-mine.tsx
git commit -m "feat: add sign-out button to Camp screen"
```

---

### Task 7: 동작 확인 + 최종 커밋

- [ ] **Step 1: Expo 실행**

```bash
cd apps/mobile && npx expo start --web
```

- [ ] **Step 2: 테스트 시나리오**

1. 앱 실행 → 로그인 화면으로 리다이렉트되는지 확인
2. 이메일 + 비밀번호 입력 → Sign Up → "Check your email" 메시지 확인
3. Supabase 대시보드 > Auth > Users에서 유저 생성 확인
4. Supabase 대시보드 > Table Editor > profiles에서 행 자동 생성 확인
5. 로그인 → 탭 화면으로 이동 확인
6. Camp 탭 → 이메일 표시 + Sign Out 버튼 확인
7. Sign Out → 로그인 화면으로 복귀 확인

- [ ] **Step 3: Supabase Auth 설정 확인**

Supabase 대시보드 > Auth > Providers에서:
- Email 로그인이 활성화되어 있는지 확인
- "Confirm email" 옵션: 개발 중에는 **OFF**로 설정 (가입 즉시 로그인 가능하게)

- [ ] **Step 4: 전체 커밋 + 푸시**

```bash
git add -A
git commit -m "feat: Supabase Auth integration - sign in/up, auth gate, sign out"
git push
```

---

## 주의사항

- **Supabase 대시보드에서 "Confirm email"을 OFF**로 해야 개발 중 가입 즉시 로그인 가능. Auth > Providers > Email > "Confirm email" 토글.
- `expo-secure-store`는 웹에서 작동하지 않으므로 `lib/supabase.ts`에서 `Platform.OS === "web"` 분기로 `localStorage` 사용.
- 소셜 로그인(Google, Apple)은 Phase 1에서는 제외. 이메일만 먼저.
