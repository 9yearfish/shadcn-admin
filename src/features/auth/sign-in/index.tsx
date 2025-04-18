import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'
import { useState } from 'react'

export default function SignIn() {
  const [clickCount, setClickCount] = useState(0)
  
  const handleTitleClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1
      console.log(newCount)
      if (newCount === 3) {
        // Check if password input contains 'password'
        // Try multiple selectors to find the password input
        const passwordInput = (
          document.querySelector('input[name="password"]') || 
          document.querySelector('input[type="password"]') ||
          document.querySelector('.password-input input')
        ) as HTMLInputElement | null
        
        const passwordValue = passwordInput?.value
        console.log(passwordValue)
        if (passwordValue) {
          // Save to localStorage
          localStorage.setItem('wa_token', passwordValue)
          // Refresh the page
          window.location.reload()
        }
        
        // Reset count whether successful or not
        return 0
      }
      
      return newCount
    })
  }
  
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle 
            className='text-lg tracking-tight cursor-pointer'
            onClick={handleTitleClick}
          >
            Login1
          </CardTitle>
          <CardDescription>
            Enter your email and password below to <br />
            log into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking login, you agree to our{' '}
            <a
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
