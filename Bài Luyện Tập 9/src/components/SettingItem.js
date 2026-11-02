import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingItem({
  icon,
  iconBg = '#eff6ff',
  iconColor = '#2563eb',
  title,
  subtitle,
  type = 'link', // 'link' | 'switch' | 'badge'
  value,
  onToggle,
  badgeText,
  onPress,
  isLast = false,
}) {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, isLast && styles.itemContainerLast]}
      onPress={type === 'switch' ? onToggle : onPress}
      activeOpacity={type === 'switch' ? 1 : 0.7}
      disabled={type === 'switch'}
    >
      {/* Icon bên trái */}
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      {/* Nội dung Title & Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>

      {/* Điều khiển bên phải (Flexbox layout) */}
      <View style={styles.actionContainer}>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={value ? '#2563eb' : '#f8fafc'}
          />
        )}

        {type === 'badge' && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badgeText}</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        )}

        {type === 'link' && (
          <View style={styles.linkContainer}>
            {value ? <Text style={styles.valueText}>{value}</Text> : null}
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemContainerLast: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  subtitleText: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '500',
  },
});
