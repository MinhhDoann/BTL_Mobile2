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
  const activeIconColor = '#FFFFFF';
  const inactiveIconColor = '#94A3B8';
  const inactiveLabelColor = '#94A3B8';

  return (
    <TouchableOpacity
      style={[styles.tabButton, disabled && styles.btnDisabled]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.iconWrapper}>
        {icon ? (
          <IconSymbol name={icon as any} size={22} color={active ? activeIconColor : inactiveIconColor} />
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
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 6) }, style]}>
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
    paddingTop: 6,
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
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
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