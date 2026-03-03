'use client';
import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className='w-full bg-linear-to-b from-white to-accent/10 py-20 px-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
            Stay Updated
          </h2>
          <p className='text-gray-600 text-lg'>
            Subscribe to get the latest updates and insights.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='flex flex-col sm:flex-row gap-3 mb-8'
        >
          <div className='flex-1 relative'>
            <div className='absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none'>
              <Mail className='w-5 h-5 text-gray-400' />
            </div>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
              className='w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
            />
          </div>

          <Button type='submit' className='px-6 py-6' size={'lg'}>
            {submitted ? (
              <>
                <CheckCircle className='w-5 h-5' />
                <span>Subscribed</span>
              </>
            ) : (
              <span>Subscribe</span>
            )}
          </Button>
        </form>

      
      </div>
    </div>
  );
}
