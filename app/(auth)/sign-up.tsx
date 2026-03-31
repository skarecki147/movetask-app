import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { useAuthFacade } from '@/modules/auth/application/useAuthFacade';
import { Screen } from '@/shared/ui/Screen';
import { AppButton } from '@/shared/ui/AppButton';
import { AppInput } from '@/shared/ui/AppInput';
import { AppText } from '@/shared/ui/AppText';
import { tokens } from '@/shared/theme/tokens';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signUpState } = useAuthFacade();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    try {
      await signUp({ email, password }).unwrap();
      router.replace('/(app)/(tabs)/projects');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    }
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppText variant="heading" style={styles.heading}>
          Create account
        </AppText>
        <AppInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AppInput label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        {error ? (
          <AppText variant="caption" style={styles.err}>
            {error}
          </AppText>
        ) : null}
        <AppButton title="Sign up" onPress={onSubmit} loading={signUpState.isLoading} />
        <View style={styles.footer}>
          <AppText variant="body" muted>
            Have an account?{' '}
          </AppText>
          <Link href="/(auth)/sign-in">
            <AppText variant="label">Sign in</AppText>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: tokens.spacing.lg, marginBottom: tokens.spacing.lg },
  err: { color: '#dc2626', marginBottom: tokens.spacing.sm },
  footer: { flexDirection: 'row', marginTop: tokens.spacing.lg, alignItems: 'center' },
});
