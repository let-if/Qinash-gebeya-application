import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomAlert({ visible, title, message, onClose, type = 'success' }) {
  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialogBox}>
          <View style={[styles.iconCircle, isSuccess ? styles.successBg : styles.errorBg]}>
            <Text style={styles.iconText}>{isSuccess ? '✓' : '!'}</Text>
          </View>

          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>

          <TouchableOpacity
            style={[styles.actionBtn, isSuccess ? styles.successBtn : styles.errorBtn]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>እሺ (ተረድቻለሁ)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.2)',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  successBg: { backgroundColor: '#E7F5ED' },
  errorBg: { backgroundColor: '#FEE2E2' },
  iconText: { fontSize: 24, fontWeight: '900', color: '#0F7B4A' },
  titleText: { fontSize: 18, fontWeight: '800', color: '#102A1C', textAlign: 'center' },
  messageText: { fontSize: 13, color: '#687B6F', textAlign: 'center', marginTop: 8, lineHeight: 19 },
  actionBtn: {
    marginTop: 20,
    width: '100%',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBtn: { backgroundColor: '#0F7B4A' },
  errorBtn: { backgroundColor: '#102A1C' },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
