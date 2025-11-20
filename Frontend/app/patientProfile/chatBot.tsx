import { Feather } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  StyleSheet,
  Modal,
  SafeAreaView
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { chatService } from '../../services/chatService';

const { width, height } = Dimensions.get('window');

export interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
  time: string;
}

interface ChatBotModalProps {
  isVisible: boolean;
  onClose: () => void;
}

function ChatBotModal({ isVisible, onClose }: ChatBotModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your LifeFile health assistant. How can I help you track your health today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatScale = useSharedValue(0);
  const chatScrollRef = useRef<FlatList>(null);

  useEffect(() => {
    if (isVisible) {
      chatScale.value = withSpring(1);
    } else {
      chatScale.value = withSpring(0);
    }
  }, [isVisible, chatScale]);

  const chatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chatScale.value }],
    opacity: chatScale.value,
  }));

  const getBotResponse = async (userMessage: string): Promise<string> => {
    const msg = userMessage.toLowerCase();
    
    // Check if the message is about symptoms or health concerns
    if (msg.includes('experiencing') || 
        msg.includes('symptoms') || 
        msg.includes('feeling') || 
        msg.includes('pain') || 
        msg.includes('sick') ||
        msg.includes('unwell') ||
        msg.includes('suffering') ||
        msg.includes('fever') ||
        msg.includes('headache') ||
        msg.includes('fatigue')) {
      console.log('Detected health concern, routing to prediction service...');
      // Use the chatService for health-related queries
      return await chatService.processHealthQuery(userMessage);
    } 
    // Handle other types of queries
    else if (msg.includes('blood pressure') || msg.includes('bp')) {
      return "I can help you log your blood pressure readings. What were your systolic and diastolic numbers?";
    } else if (msg.includes('weight')) {
      return "Great! I'll help you track your weight. What's your current weight?";
    } else if (msg.includes('medication') || msg.includes('medicine')) {
      return "I can help you manage your medications. Would you like to add a new medication or check your current schedule?";
    } else if (msg.includes('appointment')) {
      return "I can help you track upcoming appointments. When is your next doctor visit?";
    } else if (msg.includes('help') || msg.includes('what can you do')) {
      return "I can help you with:\n• Analyzing symptoms and health concerns\n• Logging vital signs (blood pressure, weight, etc.)\n• Managing medications\n• Tracking appointments\n• General health questions";
    } else {
      return "I'm here to help with your health tracking needs. You can tell me about any symptoms you're experiencing, or ask about logging vitals, medications, appointments, or any health-related questions!";
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      type: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Add a processing indicator
    const typingMessage: ChatMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: '🤔 Analyzing your health concern...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      console.log('Processing message:', message);
      // Get bot response
      const responseText = await getBotResponse(message);
      console.log('Received response:', responseText);
      
      // Replace typing indicator with actual response
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => prev.slice(0, -1).concat(botResponse));
    } catch (error: any) {
      console.error('Error in chat processing:', error);
      // Handle any errors
      const errorResponse: ChatMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: `I'm sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => prev.slice(0, -1).concat(errorResponse));
    }
    
    // Auto scroll to bottom
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userMessage : styles.botMessage
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'user' ? styles.userMessageText : styles.botMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          item.type === 'user' ? styles.userMessageTime : styles.botMessageTime
        ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.chatContainer, chatAnimatedStyle]}>
          <KeyboardAvoidingView 
            style={styles.chatWindow}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <Feather name="activity" size={20} color="#dbc2f5ff" />
                <Text style={styles.headerTitle}>Health Assistant</Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                style={styles.headerButton}
              >
                <Feather name="x" size={20} color="#dbc2f5ff" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              ref={chatScrollRef}
              data={messages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id.toString()}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={sendMessage}
                placeholder="Type your message..."
                style={styles.textInput}
                multiline
                returnKeyType="send"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={styles.sendButton}
              >
                <Feather name="send" size={16} color="#f7f7f7ff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    width: width * 0.9,
    height: height * 0.75,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  chatWindow: {
    flex: 1,
  },
  chatHeader: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    padding: 4,
    borderRadius: 4,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#a57ffeff',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#fdfafaff',
  },
  botMessageText: {
    color: '#374151',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    padding: 10,
    borderRadius: 20,
  },
});

// Main page component that renders the modal
export default function ChatBotPage() {
  const router = useRouter();
  const [chatVisible, setChatVisible] = useState(true);

  const handleClose = () => {
    setChatVisible(false);
    // Go back to previous screen
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatBotModal isVisible={chatVisible} onClose={handleClose} />
    </SafeAreaView>
  );
}