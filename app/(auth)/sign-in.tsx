import Button from '@/components/Button'
import Logo from '@/components/Logo'
import { useSignIn } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return
    
    setIsLoading(true)
    setError('')

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
        setError('Unable to complete sign in')
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors?.[0]?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#050f1f', '#0a1428', '#050f1f']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Animated.View 
          style={styles.logoContainer}
          entering={FadeIn.duration(1000)}
        >
          <Logo />
        </Animated.View>

        <Animated.View 
          style={styles.formContainer}
          entering={FadeIn.duration(800).delay(300)}
        >
          <Text style={styles.title}>Welcome Back</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email address"
              placeholderTextColor="rgba(255,255,255,0.5)"
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
              style={styles.input}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              value={password}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
              style={styles.input}
            />
          </View>
          
          <Button 
            title={isLoading ? "Signing in..." : "Sign In"}
            onPress={onSignInPress}
            style={styles.button}
          />
          
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/sign-up" asChild>
              <Text style={styles.linkText}>Sign up</Text>
            </Link>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 28,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'PoppinsRegular',
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    fontFamily: 'PoppinsRegular',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'PoppinsRegular',
  },
  linkText: {
    color: '#FFD700',
    fontFamily: 'PoppinsMedium',
  }
}); 