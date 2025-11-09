import { useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { chatService } from '../../services/chatService';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { chatStyles } from './AgentView';
import styles from './welcomeScreen.styles';

const { width, height } = Dimensions.get('window');


interface WalkthroughItem {
  id: string;
  image: any;
  title: string;
  description: string;
}
interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
  time: string;
}

const walkthroughData: WalkthroughItem[] = [
  {
    id: '1',
    image: require('../../assets/images/state.webp'),
    title: 'See your health come alive',
    description: 'Stay on top of your health anytime, anywhere. Track your wellness journey with clarity and confidence',
  },
  {
    id: '2',
    image: require('../../assets/images/sich.png'),
    title: 'Know your condition. Know your next step.',
    description: 'Let Arti help you understand what’s really happening inside your body.',
  },
  {
    id: '3',
    image: require('../../assets/images/walk-2.jpg'),
    title: 'Connect with care, instantly',
    description: 'Prepare, discuss, and follow up with confidence. One tap to your trusted doctor'
  },
  {
    id: '4',
    image: require('../../assets/images/walk-3.jpg'),
    title: 'Your personalized health Roadmap',
    description: 'Navigate from diagnosis to recovery with guided support'
  },

];

// Change from export function to export default function
export default function WelcomeScreen() {
  const router = useRouter();
  const [showFullContent, setShowFullContent] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your LifeFile health assistant. How can I help you track your health today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const logoScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const scrollX = useSharedValue(0);
  const chatScale = useSharedValue(0);
  const chatButtonScale = useSharedValue(1);
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0.2);

  const scrollViewRef = React.useRef<ScrollView>(null);
  const chatScrollRef = useRef<FlatList>(null);

  useEffect(() => {
    const animationTimeout = Platform.OS === 'web' ? 3000 : 3000;

    setTimeout(() => {
      logoScale.value = withSpring(0.8);
      contentOpacity.value = withTiming(1, { duration: 500 });
      setShowFullContent(true);
    }, animationTimeout);

    // Auto-scroll walkthrough
    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        const nextSlide = (currentSlide + 1) % walkthroughData.length;
        scrollViewRef.current.scrollTo({
          x: nextSlide * width,
          animated: true,
        });
        setCurrentSlide(nextSlide);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [currentSlide]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const chatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chatScale.value }],
    opacity: chatScale.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chatButtonScale.value }],
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  // Animation for the chat button
  useEffect(() => {
    const pulseAnimation = () => {
      rippleScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );

      rippleOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(0.1, { duration: 1000 })
        ),
        -1,
        true
      );

      chatButtonScale.value = withRepeat(
        withSequence(
          withSpring(1.1),
          withSpring(1)
        ),
        -1,
        true
      );
    };

    if (!chatOpen) {
      pulseAnimation();
    } else {
      chatButtonScale.value = 1;
      rippleScale.value = 1;
      rippleOpacity.value = 0.2;
    }
  }, [chatOpen, chatButtonScale, rippleScale, rippleOpacity]);

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
      text: '🤔 Analyzing your symptoms...',
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

  const toggleChat = () => {
    if (chatOpen) {
      chatScale.value = withSpring(0);
      setTimeout(() => setChatOpen(false), 200);
    } else {
      setChatOpen(true);
      chatScale.value = withSpring(1);
      setChatMinimized(false);
    }
  };

  const minimizeChat = () => {
    setChatMinimized(true);
  };

  const handleLogin = () => {
    if (Platform.OS === 'web') {
      router.push({ pathname: './login' });
    } else {
      router.push('../auth/login' as any);
    }
  };

  

  //console.log('Firebase Apps:', getApps());

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.floor(offset / slideSize);
    scrollX.value = offset;

    if (currentSlide !== currentIndex) {
      setCurrentSlide(currentIndex);
    }
  };

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      chatStyles.messageContainer,
      item.type === 'user' ? chatStyles.userMessageContainer : chatStyles.botMessageContainer
    ]}>
      <View style={[
        chatStyles.messageBubble,
        item.type === 'user' ? chatStyles.userMessage : chatStyles.botMessage
      ]}>
        <Text style={[
          chatStyles.messageText,
          item.type === 'user' ? chatStyles.userMessageText : chatStyles.botMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          chatStyles.messageTime,
          item.type === 'user' ? chatStyles.userMessageTime : chatStyles.botMessageTime
        ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundOverlay} />


      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoWrapper}>
          <View>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.heartIcon}
              resizeMode="contain"
            />
          </View>

        </View>
      </Animated.View>

      {showFullContent && (
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          <View style={styles.walkthroughContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={width}
              snapToAlignment="center"
            >
              {walkthroughData.map((item, index) => (
                <View
                  key={item.id}
                  style={styles.slide}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={item.image}
                      style={styles.walkthroughImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={styles.slideDescription}>
                    {item.description}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.pagination}>
              {walkthroughData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentSlide === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        
       
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Let’s Get You Connected</Text>
            </TouchableOpacity>

         
        
    

      {/* Chatbot Component */}
      {chatOpen && (
        <Animated.View style={[chatStyles.chatContainer, chatAnimatedStyle]}>
          {!chatMinimized ? (
            <KeyboardAvoidingView 
              style={chatStyles.chatWindow}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              {/* Chat Header */}
              <View style={chatStyles.chatHeader}>
                <View style={chatStyles.headerLeft}>
                  <Feather name="activity" size={20} color="#dbc2f5ff" />
                  <Text style={chatStyles.headerTitle}>Health Assistant</Text>
                </View>
                <View style={chatStyles.headerRight}>
                  <TouchableOpacity 
                    onPress={minimizeChat}
                    style={chatStyles.headerButton}
                  >
                    <Feather name="minimize-2" size={16} color="#dbc2f5ff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={toggleChat}
                    style={chatStyles.headerButton}
                  >
                    <Feather name="x" size={16} color="#dbc2f5ff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Messages */}
              <FlatList
                ref={chatScrollRef}
                data={messages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id.toString()}
                style={chatStyles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              />

              {/* Input */}
              <View style={chatStyles.inputContainer}>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={sendMessage}
                  placeholder="Type your message..."
                  style={chatStyles.textInput}
                  multiline
                  returnKeyType="send"
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  style={chatStyles.sendButton}
                >
                  <Feather name="send" size={16} color="#f7f7f7ff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <TouchableOpacity 
              onPress={() => setChatMinimized(false)}
              style={chatStyles.minimizedChat}
            >
              <Feather name="message-circle" size={24} color="#f9f8fcff" />
              {/* <Feather name="activity" size={16} color="#8B5CF6F" /> */}
              {/* <Text style={chatStyles.minimizedText}>CareBot</Text> */}
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Chat Toggle Button */}
      {!chatOpen && (
        <TouchableOpacity
          onPress={toggleChat}
          style={chatStyles.chatToggle}
        >
          <Animated.View style={[chatStyles.chatToggleRipple, rippleAnimatedStyle]} />
          <Animated.View style={[chatStyles.chatToggleInner, buttonAnimatedStyle]}>
            <Feather name="message-circle" size={24} color="#f9f8fcff" />
          </Animated.View>
        </TouchableOpacity>
      )}
      </View>
      </Animated.View>

      )}
    </SafeAreaView>
  );
}