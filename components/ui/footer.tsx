import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface FooterAction {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}

interface FooterProps {
  actions: FooterAction[];
  style?: StyleProp<ViewStyle>;
}

export function FooterButton({ title, onPress, variant = 'secondary', disabled }: FooterAction) {
  const buttonStyle = [
    styles.button,
    styles[`btn_${variant}`],
    disabled && styles.btnDisabled,
  ];

  const textStyle = [
    styles.buttonText,
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Footer({ actions, style }: FooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }, style]}>
      {actions.map((action, index) => (
        <FooterButton key={index} {...action} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#0B1120',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1E293B',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btn_primary: { backgroundColor: '#2563EB' },
  btn_secondary: { backgroundColor: '#1E293B' },
  btn_danger: { backgroundColor: '#DC2626' },
  btn_ghost: { backgroundColor: 'transparent' },
  text_primary: { color: '#FFFFFF' },
  text_secondary: { color: '#94A3B8' },
  text_danger: { color: '#FFFFFF' },
  text_ghost: { color: '#94A3B8' },
  btnDisabled: { opacity: 0.5 },
  textDisabled: { color: '#64748B' },
});