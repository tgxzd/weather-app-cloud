import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function Logo() {
  // Animation for the sun icon
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Animation styles
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  // Start animations when component mounts
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }), 
      -1, // infinite repetitions
      false // no reverse
    );
    
    scale.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite repetitions
      true // reverse
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyles}>
        <Ionicons name="partly-sunny" size={80} color="#FFD700" />
      </Animated.View>
      <Text style={styles.text}>Weather<Text style={styles.highlight}>App</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  highlight: {
    color: '#FFD700',
  }
}); 