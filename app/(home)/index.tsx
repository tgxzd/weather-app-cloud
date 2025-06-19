import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { SignOutButton } from '@/components/SignOutButton';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function Index() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#050f1f', '#0a1428', '#050f1f']}
      style={styles.container}
    >
      {/* Animated Logo appears for both signed-in and signed-out users */}
      <Animated.View entering={FadeInDown.duration(1000).springify()}>
        <Logo />
      </Animated.View>
      
      <SignedIn>
        <Animated.View 
          style={styles.contentContainer} 
          entering={FadeInUp.duration(1000).delay(300)}
        >
          <Text style={styles.welcomeText}>
            Welcome to <Text style={styles.highlight}>Weather</Text>App!
          </Text>
          <Text style={styles.subtitleText}>
            Your personal weather assistant
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button 
              title="View Forecast" 
              onPress={() => {}} 
              style={styles.button}
            />
            <SignOutButton />
          </View>
        </Animated.View>
      </SignedIn>
      
      <SignedOut>
        <Animated.View 
          style={styles.contentContainer}
          entering={FadeInUp.duration(1000).delay(300)}
        >
          <Text style={styles.titleText}>
            Real-time weather at your fingertips
          </Text>
          <Text style={styles.subtitleText}>
            Sign in to access personalized forecasts
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button 
              title="Sign In" 
              onPress={() => router.push('/sign-in')}
              style={styles.button}
            />
            <Button 
              title="Sign Up" 
              onPress={() => router.push('/sign-up')}
              primary={false}
              style={styles.button}
            />
          </View>
        </Animated.View>
      </SignedOut>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  subtitleText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  highlight: {
    color: '#FFD700',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  button: {
    width: '100%',
  },
}); 