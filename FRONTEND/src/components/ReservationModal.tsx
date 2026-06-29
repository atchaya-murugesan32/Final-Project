import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createReservation } from '../api/reservations';

export default function ReservationModal({ visible, onClose, cafe }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [numPeople, setNumPeople] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      setSuccess(false);
      setError(null);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!date || !time || numPeople < 1) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createReservation({
        cafe_id: cafe.id,
        cafe_name: cafe.name,
        reservation_date: date,
        reservation_time: time,
        num_people: numPeople,
        special_request: specialRequest
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      if (err.message === "Could not validate credentials") {
        setError("Your session has expired. Please go to Account, log out, and log back in.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!cafe) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
        </Animated.View>

        <Animated.View
          style={[
            styles.contentContainer,
            { transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: fadeAnim }
          ]}
        >
          <BlurView intensity={90} tint="light" style={styles.blurView}>
            
            {!success ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                  <Text style={styles.title}>Reserve a Table</Text>
                  <Text style={styles.subtitle}>{cafe.name}</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={20} color="#ff3b30" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder="e.g. 2026-07-01"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Time</Text>
                  <View style={styles.timeSelector}>
                    {['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM'].map((t) => (
                      <TouchableOpacity 
                        key={t} 
                        style={[styles.timeChip, time === t && styles.timeChipActive]}
                        onPress={() => setTime(t)}
                      >
                        <Text style={[styles.timeText, time === t && styles.timeTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Number of People</Text>
                  <View style={styles.peopleSelector}>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <TouchableOpacity 
                        key={num} 
                        style={[styles.peopleChip, numPeople === num && styles.peopleChipActive]}
                        onPress={() => setNumPeople(num)}
                      >
                        <Text style={[styles.peopleText, numPeople === num && styles.peopleTextActive]}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Special Request (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={specialRequest}
                    onChangeText={setSpecialRequest}
                    placeholder="Window seat, anniversary, etc."
                    placeholderTextColor="#999"
                    multiline
                  />
                </View>

                <TouchableOpacity 
                  style={styles.confirmButton} 
                  onPress={handleConfirm}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#8a1a36', '#c4284d']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#34c759" />
                <Text style={styles.successTitle}>Reservation Confirmed!</Text>
                <Text style={styles.successText}>We look forward to seeing you at {cafe.name}.</Text>
              </View>
            )}

          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    marginTop: 'auto',
    maxHeight: '90%',
  },
  blurView: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  header: {
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeChipActive: {
    backgroundColor: '#8a1a36',
    borderColor: '#8a1a36',
  },
  timeText: {
    color: '#666',
    fontWeight: '600',
  },
  timeTextActive: {
    color: '#fff',
  },
  peopleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  peopleChip: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleChipActive: {
    backgroundColor: '#8a1a36',
    borderColor: '#8a1a36',
  },
  peopleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  peopleTextActive: {
    color: '#fff',
  },
  confirmButton: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5e5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});
