import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { updateUserProfile } from '../../api/dashboard';
import { changePassword } from '../../api/auth';

export default function UserProfile({ profile, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Initialize state when profile loads
  React.useEffect(() => {
    if (profile) {
      setName(profile.full_name || profile.name || '');
      setPhone(profile.phone_number || profile.phone || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile({ name, phone });
      setIsEditing(false);
      onUpdate();
    } catch (e) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!oldPassword || !newPassword) {
      alert("Please enter both old and new passwords.");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      alert("Password updated successfully!");
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
    } catch (e) {
      alert(e.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A';
  const lastLogin = profile?.last_login ? new Date(profile.last_login).toLocaleDateString() : 'Just now';

  return (
    <LinearGradient colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          {profile?.profile_picture ? (
            <Image source={{ uri: profile.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          {isEditing ? (
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
              placeholder="Full Name" 
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={styles.name}>{profile?.full_name || profile?.name}</Text>
          )}
          
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          
          {isEditing ? (
            <TextInput 
              style={styles.input} 
              value={phone} 
              onChangeText={setPhone} 
              placeholder="Phone Number" 
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
          ) : (
            profile?.phone_number && <Text style={styles.phone}>{profile?.phone_number}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {loading ? (
            <ActivityIndicator color="#690b22" size="small" />
          ) : (
            <Ionicons name={isEditing ? "checkmark" : "pencil"} size={20} color="#690b22" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Member Since</Text>
          <Text style={styles.statValue}>{memberSince}</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Last Login</Text>
          <Text style={styles.statValue}>{lastLogin}</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{profile?.account_status || 'Active'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.changePasswordBtn} 
        onPress={() => setIsChangingPassword(!isChangingPassword)}
      >
        <Ionicons name="lock-closed-outline" size={16} color="#690b22" />
        <Text style={styles.changePasswordText}>
          {isChangingPassword ? "Cancel" : "Change Password"}
        </Text>
      </TouchableOpacity>

      {isChangingPassword && (
        <View style={styles.passwordForm}>
          <TextInput 
            style={styles.input} 
            placeholder="Old Password" 
            secureTextEntry 
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholderTextColor="#888"
          />
          <TextInput 
            style={[styles.input, { marginTop: 10 }]} 
            placeholder="New Password" 
            secureTextEntry 
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.submitPasswordBtn} 
            onPress={handlePasswordSubmit}
            disabled={passwordLoading}
          >
            {passwordLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitPasswordText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 20,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#690b22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  username: {
    fontSize: 14,
    color: '#690b22',
    fontWeight: '600',
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#690b22',
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
    marginBottom: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statColumn: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 'bold',
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  changePasswordText: {
    marginLeft: 8,
    color: '#690b22',
    fontWeight: '600',
    fontSize: 14,
  },
  passwordForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
  },
  submitPasswordBtn: {
    marginTop: 16,
    backgroundColor: '#690b22',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitPasswordText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
