import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { createReservation } from '../api/reservations';

type Cafe = {
  id: string;
  name: string;
} | null;

type ReservationModalProps = {
  visible: boolean;
  onClose: () => void;
  cafe: Cafe;
};

function isValidDateFormat(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseLocalDate(value: string) {
  if (!isValidDateFormat(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export default function ReservationModal({ visible, onClose, cafe }: ReservationModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [numPeople, setNumPeople] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        }),
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
  }, [visible, fadeAnim, scaleAnim, slideAnim]);

  const handleConfirm = async () => {
    if (!cafe) {
      return;
    }

    if (!date || !time || numPeople < 1) {
      setError('Please fill in all required fields.');
      return;
    }

    const selectedDate = parseLocalDate(date);
    if (!selectedDate) {
      setError('Please enter a valid date in YYYY-MM-DD format.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Please choose today or a future date.');
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
        special_request: specialRequest,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';

      if (message === 'Could not validate credentials') {
        setError('Your session has expired. Please go to Account, log out, and log back in.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => onClose();

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
            { transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: fadeAnim },
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
                        <Text style={[styles.peopleText, numPeople === num && styles.peopleTextActive]}>
                          {num}
                        </Text>
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
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
                  )}
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
    backgroundColor: '#B56A3D',
  },
  header: {
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FAF3DD',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FAF3DD',
    fontWeight: '500',
    fontFamily: 'SpaceMono',
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
    color: '#FAF3DD',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'SpaceMono',
  },
  input: {
    backgroundColor: '#FAF3DD',
    borderWidth: 1,
    borderColor: '#7A7849',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    fontFamily: 'SpaceMono',
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
    backgroundColor: '#FAF3DD',
    borderWidth: 1,
    borderColor: '#7A7849',
  },
  timeChipActive: {
    backgroundColor: '#7A7849',
    borderColor: '#7A7849',
  },
  timeText: {
    color: '#7A7849',
    fontWeight: '600',
    fontFamily: 'SpaceMono',
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
    backgroundColor: '#FAF3DD',
    borderWidth: 1,
    borderColor: '#7A7849',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleChipActive: {
    backgroundColor: '#7A7849',
    borderColor: '#7A7849',
  },
  peopleText: {
    fontSize: 16,
    color: '#7A7849',
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  peopleTextActive: {
    color: '#fff',
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: '#7A7849',
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'SpaceMono',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3DD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#7A7849',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FAF3DD',
    fontFamily: 'SpaceMono',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#FAF3DD',
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
});
