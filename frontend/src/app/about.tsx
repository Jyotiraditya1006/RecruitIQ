import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../ThemeContext';

export default function AboutPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={themeStyles.safeArea} edges={['top', 'left', 'right']}>
      <View style={themeStyles.navbar}>
        <View style={themeStyles.navLogoContainer}>
          <Text style={themeStyles.navLogo}>RecruitIQ</Text>
        </View>
        <View style={themeStyles.navLinks}>
          <TouchableOpacity onPress={() => router.push('/')} style={themeStyles.backBtn}>
            <Text style={themeStyles.navLink}>Back to Workspace</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={themeStyles.themeToggleBtn}>
            <Text style={themeStyles.themeToggleText}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={themeStyles.content}>
        <Text style={themeStyles.title}>What is RecruitIQ?</Text>
        <View style={themeStyles.card}>
          <Text style={themeStyles.text}>
            RecruitIQ is a next-generation intelligent screening tool engineered specifically for high-volume recruiters and discerning hiring managers.
          </Text>
          <Text style={themeStyles.text}>
            It automates the often tedious first pass of resume screening by instantly computing mathematical and semantic overlaps between a candidate's qualifications and the core requirements of your job description.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BRAND_GREEN = '#00704A';

const lightTheme = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  navLogoContainer: { flexDirection: 'row', alignItems: 'center' },
  navLogo: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, letterSpacing: -0.5 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 6 },
  navLink: { fontSize: 14, fontWeight: '600', color: '#111827' },
  themeToggleBtn: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  themeToggleText: { color: '#111827', fontWeight: '700', fontSize: 13 },
  content: { padding: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  title: { fontSize: 36, fontWeight: '800', color: '#111827', marginBottom: 32 },
  card: { backgroundColor: '#FFFFFF', padding: 32, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  text: { fontSize: 16, color: '#4B5563', lineHeight: 28, marginBottom: 24 },
});

const darkTheme = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1121' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 20, backgroundColor: '#161E31', borderBottomWidth: 1, borderBottomColor: '#2A364E' },
  navLogoContainer: { flexDirection: 'row', alignItems: 'center' },
  navLogo: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, letterSpacing: -0.5 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#1E293B', borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
  navLink: { fontSize: 14, fontWeight: '600', color: '#F8FAFC' },
  themeToggleBtn: { backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  themeToggleText: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  content: { padding: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  title: { fontSize: 36, fontWeight: '800', color: '#F8FAFC', marginBottom: 32 },
  card: { backgroundColor: '#161E31', padding: 32, borderRadius: 12, borderWidth: 1, borderColor: '#2A364E' },
  text: { fontSize: 16, color: '#94A3B8', lineHeight: 28, marginBottom: 24 },
});
