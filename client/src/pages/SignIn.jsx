import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import { signInUser } from '../services/authService'; // <-- Import our new service
import OAuth from '../components/OAuth';

// 1. Define the validation schema with Zod
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

// Infer the TypeScript type from the schema if you were using TypeScript
// type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2. Set up React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  // 3. The new submit handler is much cleaner
  const handleFormSubmit = async (formData) => {
    try {
      dispatch(signInStart());
      const data = await signInUser(formData); // Use the service
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
      <div className='min-h-screen mt-20'>
        <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
          {/* left */}
          <div className='flex-1'>
            <Link to='/' className='font-bold dark:text-white text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Sahand's
            </span>
              Blog
            </Link>
            <p className='text-sm mt-5'>
              This is a demo project. You can sign in with your email and password
              or with Google.
            </p>
          </div>
          {/* right */}
          <div className='flex-1'>
            {/* 4. Use the handleSubmit from react-hook-form */}
            <form
                className='flex flex-col gap-4'
                onSubmit={handleSubmit(handleFormSubmit)}
            >
              <div>
                <Label value='Your email' />
                <TextInput
                    type='email'
                    placeholder='name@company.com'
                    id='email'
                    // 5. Register the input
                    {...register('email')}
                />
                {/* 6. Show field-specific errors */}
                {errors.email && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.email.message}
                    </p>
                )}
              </div>
              <div>
                <Label value='Your password' />
                <TextInput
                    type='password'
                    placeholder='**********'
                    id='password'
                    // 5. Register the input
                    {...register('password')}
                />
                {/* 6. Show field-specific errors */}
                {errors.password && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.password.message}
                    </p>
                )}
              </div>
              <Button
                  gradientDuoTone='purpleToPink'
                  type='submit'
                  disabled={loading}
              >
                {loading ? (
                    <>
                      <Spinner size='sm' />
                      <span className='pl-3'>Loading...</span>
                    </>
                ) : (
                    'Sign In'
                )}
              </Button>
              <OAuth />
            </form>
            <div className='flex gap-2 text-sm mt-5'>
              <span>Don't have an account?</span>
              <Link to='/sign-up' className='text-blue-500'>
                Sign Up
              </Link>
            </div>
            {errorMessage && (
                <Alert className='mt-5' color='failure'>
                  {errorMessage}
                </Alert>
            )}
          </div>
        </div>
      </div>
  );
}