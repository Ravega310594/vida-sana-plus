import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AppleLogo,
  FacebookLogo,
  GoogleLogo,
} from './SocialIcons';

export type SocialProviderId = 'apple' | 'google' | 'facebook';

const PROVIDERS = [
  { id: 'apple', label: 'Apple', Logo: AppleLogo },
  { id: 'google', label: 'Google', Logo: GoogleLogo },
  { id: 'facebook', label: 'Facebook', Logo: FacebookLogo },
] as const;

export default function SocialRow({
  onPress,
  disabled = false,
}: {
  onPress: (id: SocialProviderId) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      {PROVIDERS.map(({ id, label, Logo }) => (
        <Pressable
          key={id}
          accessibilityRole="button"
          accessibilityLabel={`Continuar con ${label}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onPress(id)}
          style={[styles.button, disabled && styles.buttonDisabled]}
        >
          <Logo size={30} />
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  buttonDisabled: { opacity: 0.6 },
  label: { fontSize: 14, fontWeight: '700', color: '#0f2a5a' },
});
