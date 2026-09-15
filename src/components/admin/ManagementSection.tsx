import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ManagementSectionProps {
  title: string;
  description?: string;
  fields: Array<{
    label: string;
    value: string;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
    onChangeText: (text: string) => void;
  }>;
  primaryLabel: string;
  onSubmit: () => void;
  submitting?: boolean;
}

export function ManagementSection({
  title,
  description,
  fields,
  primaryLabel,
  onSubmit,
  submitting = false,
}: ManagementSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}

      {fields.map((field, index) => (
        <View key={`${title}-${index}`}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            value={field.value}
            onChangeText={field.onChangeText}
            placeholder={field.placeholder}
            placeholderTextColor="#64748B"
            multiline={field.multiline}
            keyboardType={field.keyboardType ?? 'default'}
            style={[styles.input, field.multiline && styles.textarea]}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.primaryButton} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? 'Đang lưu...' : primaryLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  sectionDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#052E16',
    fontWeight: '700',
    fontSize: 16,
  },
});
