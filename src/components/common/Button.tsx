import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const variantStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    danger: styles.dangerButton,
  };

  const variantTextStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    danger: styles.dangerText,
  };

  return (
    <TouchableOpacity
      style={[variantStyles[variant], style, (loading || disabled) && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[variantTextStyles[variant], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

