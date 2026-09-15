import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ManagementFormProps {
  title: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    value: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
  }>;
  submitLabel: string;
  submitting: boolean;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
}

export function ManagementForm({
  title,
  fields,
  submitLabel,
  submitting,
  onChange,
  onSubmit,
}: ManagementFormProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {fields.map((field) => (
        <View key={field.key}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            value={field.value}
            onChangeText={(text) => onChange(field.key, text)}
            placeholder={field.placeholder}
            placeholderTextColor="#64748B"
            keyboardType={field.keyboardType ?? 'default'}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            style={[styles.input, field.multiline && styles.textarea]}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.primaryButton} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? 'Đang xử lý...' : submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 16,
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
    minHeight: 110,
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
