import { Ionicons } from '@expo/vector-icons';
import { Button } from '@react-navigation/elements';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type AppHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightAction?: ReactNode;
};

export function AppHeader({ title, onBackPress, rightAction }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBackPress ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onBackPress}
            style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
          </Pressable>
        ) : null}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}      
      </Text>

      <View style={[styles.side, styles.rightSide]}>{rightAction}
        <Button style={styles.button}>Login</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
  },
  side: {
    alignItems: 'flex-start',
    minWidth: 44,
    marginRight: 8,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    color: '#F8FAFC',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1E293B',
    paddingRight: 20,
    paddingVertical: 8,
  },
});
