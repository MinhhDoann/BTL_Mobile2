import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export function AdminStatCard({ label, value, accent = '#8B5CF6' }: AdminStatCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    marginBottom: 12,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  label: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 13,
  },
});
