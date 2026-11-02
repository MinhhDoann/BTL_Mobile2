import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function SettingSection({ title, children }) {
  return (
    <View style={styles.sectionContainer}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.cardWrapper}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 6,
  },
  cardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
