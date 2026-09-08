import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './icon-symbol';

export interface FooterAction {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  icon?: string;
  active?: boolean;
}

interface FooterProps {
  actions: FooterAction[];
  style?: StyleProp<ViewStyle>;
}

export function FooterButton({ title, onPress, variant = 'secondary', disabled, icon, active }: FooterAction) {
  const inactiveIconColor = '#FFFFFF';
  const inactiveLabelColor = '#94A3B8';

  return (
    <TouchableOpacity
      style={[styles.tabButton, disabled && styles.btnDisabled]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.iconBubble, active && styles.iconBubbleActive]}>
        {icon ? (
          <IconSymbol name={icon as any} size={20} color={active ? '#0B1120' : inactiveIconColor} />
        ) : null}
      </View>
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : { color: inactiveLabelColor }]} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export function Footer({ actions, style }: FooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }, style]}>
      {actions.map((action, index) => (
        <View key={index} style={styles.tabItem}>
          <FooterButton {...action} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    backgroundColor: '#0B1120',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1E293B',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  iconBubbleActive: {
    backgroundColor: '#FFFFFF',
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