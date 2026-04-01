import { render, screen } from '@testing-library/react-native';

import { AppText } from '../AppText';

jest.mock('../../theme/ThemeContext', () => ({
  useMovetaskTheme: () => ({
    preference: 'light' as const,
    resolved: 'light' as const,
    colors: {
      background: '#fff',
      surface: '#fff',
      text: '#111827',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      primary: '#7c3aed',
      primaryText: '#ffffff',
      danger: '#ea580c',
      success: '#16a34a',
      tint: '#7c3aed',
    },
    setPreference: jest.fn(),
  }),
}));

describe('AppText', () => {
  it('renders children', () => {
    render(<AppText>Hello MoveTask</AppText>);
    expect(screen.getByText('Hello MoveTask')).toBeTruthy();
  });
});
