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
      primary: '#2563eb',
      primaryText: '#ffffff',
      danger: '#dc2626',
      success: '#16a34a',
      tint: '#2563eb',
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
