import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateNotifications } from '../../api/dashboard';

export default function SettingsPanel({ notifications, onRefresh }) {
  if (!notifications) return null;

  const [saving, setSaving] = useState(false);
  const [localNotifs, setLocalNotifs] = useState({
    notify_occupancy_alerts: notifications.notify_occupancy_alerts ?? true,
    notify_reservation: notifications.notify_reservation ?? true,
    notify_favorite_alerts: notifications.notify_favorite_alerts ?? true,
    notify_ai_updates: notifications.notify_ai_updates ?? true,
    notify_nearby_cafes: notifications.notify_nearby_cafes ?? false,
  });

  const toggleSwitch = async (key) => {
    const newValue = !localNotifs[key];
    setLocalNotifs({ ...localNotifs, [key]: newValue });
    setSaving(true);
    try {
      await updateNotifications({ [key]: newValue });
      onRefresh();
    } catch (e) {
      alert("Failed to update notification settings");
      setLocalNotifs({ ...localNotifs, [key]: !newValue });
    } finally {
      setSaving(false);
    }
  };

  const NotifRow = ({ label, field, icon }) => (
    <View style={styles.row}>
      <View style={styles.leftPart}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={18} color="#690b22" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        trackColor={{ false: "#d1d5db", true: "#fbcfe8" }}
        thumbColor={localNotifs[field] ? "#690b22" : "#f4f3f4"}
        onValueChange={() => toggleSwitch(field)}
        value={localNotifs[field]}
        disabled={saving}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        {saving && <ActivityIndicator size="small" color="#690b22" />}
      </View>
      
      <View style={styles.card}>
        <NotifRow label="Occupancy Alerts" field="notify_occupancy_alerts" icon="people-outline" />
        <View style={styles.divider} />
        <NotifRow label="Reservation Reminders" field="notify_reservation" icon="calendar-outline" />
        <View style={styles.divider} />
        <NotifRow label="Favorite Cafe Alerts" field="notify_favorite_alerts" icon="heart-outline" />
        <View style={styles.divider} />
        <NotifRow label="AI Recommendation Updates" field="notify_ai_updates" icon="sparkles-outline" />
        <View style={styles.divider} />
        <NotifRow label="Nearby Cafes (Location)" field="notify_nearby_cafes" icon="location-outline" />
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionRow}>
          <View style={styles.leftPart}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#690b22" />
            </View>
            <Text style={styles.label}>Privacy Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionRow}>
          <View style={styles.leftPart}>
            <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
            </View>
            <Text style={[styles.label, { color: '#dc2626' }]}>Delete Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leftPart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(105, 11, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  }
});
