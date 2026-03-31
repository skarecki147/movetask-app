import {
  useSessionQuery,
  useSignInMutation,
  useSignOutMutation,
  useSignUpMutation,
} from '@/store/movetaskApi';

export function useAuthFacade() {
  const session = useSessionQuery();
  const [signUp, signUpState] = useSignUpMutation();
  const [signIn, signInState] = useSignInMutation();
  const [signOut, signOutState] = useSignOutMutation();

  return {
    session,
    signUp,
    signUpState,
    signIn,
    signInState,
    signOut,
    signOutState,
  };
}
