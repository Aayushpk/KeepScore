import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';

const CRICKET_ROLES = [
  'Batter', 
  'Bowler', 
  'All-Rounder', 
  'Wicket-Keeper'
];

export default function Profile() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);

  const handleCreateProfile = () => {
    if (name.trim() === '' || role === '') {
      alert("Please provide at least your Name and select a Role.");
      return;
    }
    setIsSetupComplete(true);
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (!isSetupComplete) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Setup Profile</Text>
          <Text style={styles.subtext}>Enter your details to create your player card.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Aayush Pratap Khadgi"
              placeholderTextColor="#555"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. player@team.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cricket Role</Text>
            <View style={styles.roleContainer}>
              {CRICKET_ROLES.map((r) => (
                <TouchableOpacity 
                  key={r} 
                  style={[styles.rolePill, role === r && styles.rolePillActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Profile Photo (Optional)</Text>
            <TouchableOpacity 
              style={[styles.photoButton, photoAdded && styles.photoButtonActive]} 
              onPress={() => setPhotoAdded(!photoAdded)}
            >
              <Text style={styles.photoButtonText}>
                {photoAdded ? "✓ Photo Attached (Tap to Remove)" : "Tap to upload photo mockup"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateProfile}>
            <Text style={styles.submitBtnText}>Create Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Profile View State
  return (
    <View style={styles.container}>
      <Text style={styles.headerDashboard}>My Profile</Text>
      
      <View style={styles.headerArea}>
        <View style={[styles.avatarPlaceholder, photoAdded && styles.avatarPhotoActive]}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>

      <Text style={styles.sectionTitle}>Career Stats</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Runs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Wickets</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.editBtn} 
        onPress={() => setIsSetupComplete(false)}
      >
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerDashboard: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
    paddingBottom: 0,
  },
  subtext: {
    color: '#888',
    fontSize: 14,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    padding: 15,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rolePill: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  rolePillActive: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  roleText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#121212',
    fontWeight: 'bold',
  },
  photoButton: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  photoButtonActive: {
    borderColor: '#4caf50',
    borderStyle: 'solid',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  photoButtonText: {
    color: '#888',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#4caf50',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerArea: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarPhotoActive: {
    backgroundColor: '#1976d2',
    borderWidth: 3,
    borderColor: '#4caf50',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  role: {
    color: '#4caf50',
    fontSize: 16,
    marginTop: 5,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#4caf50',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  editBtn: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#888',
    fontSize: 16,
  }
});
