import Button from '@/components/Button'
import Logo from '@/components/Logo'
import { useSignUp } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return
    
    setIsLoading(true)
    setError('')

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors?.[0]?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return
    
    setIsLoading(true)
    setError('')

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
        setError('Verification failed. Please try again.')
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors?.[0]?.message || 'Verification failed')
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

        {pendingVerification ? (
          <Animated.View 
            style={styles.formContainer}
            entering={FadeIn.duration(800)}
          >
            <Text style={styles.title}>Verify your email</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Text style={styles.instructions}>
              We've sent a verification code to your email.
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                value={code}
                placeholder="Verification code"
                placeholderTextColor="rgba(255,255,255,0.5)"
                onChangeText={(code) => setCode(code)}
                style={styles.input}
                keyboardType="number-pad"
                autoFocus
              />
            </View>
            
            <Button 
              title={isLoading ? "Verifying..." : "Verify Email"}
              onPress={onVerifyPress}
              style={styles.button}
            />
          </Animated.View>
        ) : (
          <Animated.View 
            style={styles.formContainer}
            entering={FadeIn.duration(800).delay(300)}
          >
            <Text style={styles.title}>Create Account</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <View style={styles.inputContainer}>
              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email address"
                placeholderTextColor="rgba(255,255,255,0.5)"
                onChangeText={(email) => setEmailAddress(email)}
                style={styles.input}
                keyboardType="email-address"
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
              title={isLoading ? "Creating..." : "Sign Up"}
              onPress={onSignUpPress}
              style={styles.button}
            />
            
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/sign-in" asChild>
                <Text style={styles.linkText}>Sign in</Text>
              </Link>
            </View>
          </Animated.View>
        )}
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
  instructions: {
    fontFamily: 'PoppinsRegular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
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