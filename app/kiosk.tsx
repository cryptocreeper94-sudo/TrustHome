import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/ui/Header';
import { useRouter } from 'expo-router';

export default function OpenHouseKioskScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', agentWorking: false });

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      Alert.alert("Missing Fields", "Please fill in your name and email.");
      return;
    }
    Alert.alert(
      "Thank You!",
      `Welcome to the Open House, ${form.firstName}! Your info has been saved.`,
      [{ text: "OK", onPress: () => setForm({ firstName: '', lastName: '', email: '', phone: '', agentWorking: false }) }]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: '#111' }]}>
      <View style={styles.exitWrap}>
        <Pressable onPress={() => router.back()} style={styles.exitBtn}>
          <Ionicons name="close" size={24} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 6 }}>Exit Kiosk</Text>
        </Pressable>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>OPEN HOUSE SIGN-IN</Text>
          <Text style={styles.subtitle}>123 LUXURY LANE, BEVERLY HILLS</Text>

          <View style={styles.row}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>First Name</Text>
              <TextInput style={styles.input} placeholderTextColor="#888" placeholder="John" value={form.firstName} onChangeText={t => setForm({...form, firstName: t})} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput style={styles.input} placeholderTextColor="#888" placeholder="Smith" value={form.lastName} onChangeText={t => setForm({...form, lastName: t})} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholderTextColor="#888" placeholder="jsmith@email.com" keyboardType="email-address" value={form.email} onChangeText={t => setForm({...form, email: t})} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholderTextColor="#888" placeholder="(555) 123-4567" keyboardType="phone-pad" value={form.phone} onChangeText={t => setForm({...form, phone: t})} />
            </View>
          </View>

          <View style={styles.agentWrap}>
            <Text style={styles.agentLabel}>ARE YOU CURRENTLY WORKING WITH AN AGENT?</Text>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleText, !form.agentWorking ? styles.toggleTextActive : {}]}>NO</Text>
              <Pressable style={styles.toggleTrack} onPress={() => setForm({...form, agentWorking: !form.agentWorking})}>
                <View style={[styles.toggleKnob, form.agentWorking ? { transform: [{translateX: 24}] } : {}]} />
              </Pressable>
              <Text style={[styles.toggleText, form.agentWorking ? styles.toggleTextActive : {}]}>YES</Text>
            </View>
          </View>

          <Pressable style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>SUBMIT</Text>
          </Pressable>

          <Text style={styles.footer}>Powered by APEX CRM</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  exitWrap: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  exitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 700, backgroundColor: 'rgba(20,20,20,0.8)', padding: 40, borderRadius: 24, borderWidth: 1, borderColor: '#333' },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 8, letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#AAA', textAlign: 'center', marginBottom: 40, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  inputWrap: { flex: 1 },
  label: { fontSize: 14, color: '#CCC', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 16, fontSize: 18, color: '#FFF' },
  agentWrap: { alignItems: 'center', marginVertical: 30 },
  agentLabel: { fontSize: 14, color: '#CCC', marginBottom: 16, fontWeight: '600', letterSpacing: 0.5 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  toggleText: { fontSize: 16, color: '#666', fontWeight: 'bold' },
  toggleTextActive: { color: '#007AFF' },
  toggleTrack: { width: 56, height: 32, borderRadius: 16, backgroundColor: '#333', padding: 4, justifyContent: 'center' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#007AFF' },
  submitBtn: { backgroundColor: '#0055FF', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  footer: { textAlign: 'center', color: '#555', marginTop: 30, fontSize: 12 }
});
