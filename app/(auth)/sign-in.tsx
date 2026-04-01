import { useHeaderHeight } from '@react-navigation/elements';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { useAuthFacade } from '@/modules/auth/application/useAuthFacade';
import { Screen } from '@/shared/ui/Screen';
import { AppButton } from '@/shared/ui/AppButton';
import { AppInput } from '@/shared/ui/AppInput';
import { AppText } from '@/shared/ui/AppText';
import { emailFormatError, passwordMinLengthError } from '@/shared/lib/authCredentialsValidation';
import { rtkMutationErrorMessage } from '@/shared/lib/rtkMutationErrorMessage';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

export default function SignInScreen() {
  const headerHeight = useHeaderHeight();
  const { colors } = useMovetaskTheme();
  const router = useRouter();
  const { signIn, signInState } = useAuthFacade();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    const eErr = emailFormatError(email);
    const pErr = passwordMinLengthError(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    setError(null);
    if (eErr || pErr) return;
    try {
      await signIn({ email: email.trim(), password }).unwrap();
      router.replace('/(app)/(tabs)/projects');
    } catch (e) {
      setError(rtkMutationErrorMessage(e, 'Sign in failed'));
    }
  };

  return (
    <Screen scroll contentStyle={{ paddingTop: headerHeight }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppText variant="heading" style={styles.heading}>
          Welcome back
        </AppText>
        <AppText variant="body" muted style={styles.sub}>
          Sign in to continue
        </AppText>
        <AppInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          error={emailError ?? undefined}
          onChangeText={(v) => {
            setEmail(v);
            setEmailError(null);
          }}
        />
        <AppInput
          label="Password"
          passwordVisibilityToggle
          value={password}
          error={passwordError ?? undefined}
          onChangeText={(v) => {
            setPassword(v);
            setPasswordError(null);
          }}
        />
        {error ? (
          <AppText variant="caption" style={[styles.err, { color: colors.danger }]}>
            {error}
          </AppText>
        ) : null}
        <AppButton title="Sign in" onPress={onSubmit} loading={signInState.isLoading} />
        <View style={styles.footer}>
          <AppText variant="body" muted>
            No account?{' '}
          </AppText>
          <Link href="/(auth)/sign-up">
            <AppText variant="label">Sign up</AppText>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: tokens.spacing.lg, marginBottom: tokens.spacing.sm },
  sub: { marginBottom: tokens.spacing.lg },
  err: { marginBottom: tokens.spacing.sm },
  footer: { flexDirection: 'row', marginTop: tokens.spacing.lg, alignItems: 'center' },
});
