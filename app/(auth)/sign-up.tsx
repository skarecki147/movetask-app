import { useContentPaddingBelowTransparentHeader } from '@/shared/lib/useContentPaddingBelowTransparentHeader';
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

export default function SignUpScreen() {
  const headerContentPadding = useContentPaddingBelowTransparentHeader();
  const { colors } = useMovetaskTheme();
  const router = useRouter();
  const { signUp, signUpState } = useAuthFacade();
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
      await signUp({ email: email.trim(), password }).unwrap();
      router.replace('/(app)/(tabs)/projects');
    } catch (e) {
      setError(rtkMutationErrorMessage(e, 'Sign up failed'));
    }
  };

  return (
    <Screen scroll contentStyle={{ paddingTop: headerContentPadding }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppText variant="heading" style={styles.heading}>
          Create account
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
  err: { marginBottom: tokens.spacing.sm },
  footer: { flexDirection: 'row', marginTop: tokens.spacing.lg, alignItems: 'center' },
});
