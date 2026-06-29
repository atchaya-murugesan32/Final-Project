import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { updatePreferences } from '../../api/dashboard';

export default function PreferencesManager({ preferences, onRefresh }) {
  if (!preferences) return null;

  const [saving, setSaving] = useState(false);
  const [localPrefs, setLocalPrefs] = useState({
    wifi_required: preferences.wifi_required || false,
    charging_ports_required: preferences.charging_ports_required || false,
    pet_friendly: preferences.pet_friendly || false,
    parking_required: preferences.parking_required || false,
    budget_range: preferences.budget_range || 'Any',
    seating: preferences.seating || 'Any',
  });

  const toggleSwitch = async (key) => {
    const newValue = !localPrefs[key];
    setLocalPrefs({ ...localPrefs, [key]: newValue });
    setSaving(true);
    try {
      await updatePreferences({ [key]: newValue });
      onRefresh();
    } catch (e) {
      alert("Failed to update preferences");
      // Revert on fail
      setLocalPrefs({ ...localPrefs, [key]: !newValue });
    } finally {
      setSaving(false);
    }
  };

  const PreferenceRow = ({ label, field }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        trackColor={{ false: "#d1d5db", true: "#fbcfe8" }}
        thumbColor={localPrefs[field] ? "#690b22" : "#f4f3f4"}
        onValueChange={() => toggleSwitch(field)}
        value={localPrefs[field]}
        disabled={saving}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Saved Preferences</Text>
        {saving && <ActivityIndicator size="small" color="#690b22" />}
      </View>
      <View style={styles.card}>
        <PreferenceRow label="Wi-Fi Required" field="wifi_required" />
        <View style={styles.divider} />
        <PreferenceRow label="Charging Ports" field="charging_ports_required" />
        <View style={styles.divider} />
        <PreferenceRow label="Pet Friendly" field="pet_friendly" />
        <View style={styles.divider} />
        <PreferenceRow label="Parking Available" field="parking_required" />
        
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.label}>Budget</Text>
          <Text style={styles.valueText}>{localPrefs.budget_range}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.label}>Preferred Seating</Text>
          <Text style={styles.valueText}>{localPrefs.seating}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 16,
    color: '#690b22',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  }
});
