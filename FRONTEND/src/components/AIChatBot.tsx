import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendChatMessage } from '../api/ai';
import { useAuth } from '../context/AuthContext';

export default function AIChatBot({ visible, onClose }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { id: '1', role: 'model', parts: ['Hi there! I am your AI Cafe Assistant. ☕ How can I help you find the perfect vibe today?'] }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingDots, setTypingDots] = useState('');

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setTypingDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
    } else {
      setTypingDots('');
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (visible) {
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
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = () => {
    onClose && onClose();
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message to UI immediately
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', parts: [userMessage] }];
    setMessages(newMessages);
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Prepare history format for API
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'model') // Just safety check
        .map(m => ({ role: m.role, parts: m.parts }));

      const response = await sendChatMessage(history, userMessage, token);
      
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'model', parts: [response.response] }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'model', parts: ["Sorry, I'm having trouble connecting right now."] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </View>
        )}
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.parts[0]}
        </Text>
      </View>
    );
  };

  return (
    <>
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
              styles.chatContainer,
              { transform: [{ translateY: slideAnim }], opacity: fadeAnim }
            ]}
          >
            <BlurView intensity={80} tint="light" style={styles.blurView}>
              {/* Header */}
              <LinearGradient colors={['#690b22', '#9c1c38']} style={styles.chatHeader}>
                <View style={styles.headerTitleRow}>
                  <Ionicons name="sparkles" size={18} color="#FAF3DD" />
                  <Text style={styles.headerTitle}>AI Assistant</Text>
                </View>
                <TouchableOpacity onPress={handleClose} hitSlop={10}>
                  <Ionicons name="close" size={24} color="#FAF3DD" />
                </TouchableOpacity>
              </LinearGradient>

              {/* Chat Area */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.chatList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListFooterComponent={() => 
                  isLoading ? (
                    <View style={[styles.messageBubble, styles.aiBubble, { width: 60 }]}>
                      <View style={styles.aiAvatar}>
                        <Ionicons name="sparkles" size={12} color="#fff" />
                      </View>
                      <Text style={[styles.messageText, styles.aiText]}>{typingDots}</Text>
                    </View>
                  ) : null
                }
              />

              {/* Input Area */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ask me about cafes..."
                  placeholderTextColor="#888"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
                  onPress={sendMessage}
                  disabled={!inputText.trim()}
                >
                  <Ionicons name="send" size={18} color="#FAF3DD" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  chatContainer: {
    height: '80%',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(250, 243, 221, 0.9)', // Fallback if blur fails
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  blurView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FAF3DD',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  chatList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#690b22',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#690b22',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  userText: {
    color: '#FAF3DD',
  },
  aiText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#690b22',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
