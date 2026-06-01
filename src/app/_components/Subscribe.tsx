'use client';
import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder='Enter your email'
              required
              disabled={isLoading}
              className='w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60'
            />
          </div>

          <Button
            type='submit'
            className='px-6 py-6'
            size={'lg'}
            disabled={isLoading}
          >
            {submitted ? (
              <>
                <CheckCircle className='w-5 h-5' />
                <span>Subscribed</span>
              </>
            ) : isLoading ? (
              <span>Subscribing...</span>
            ) : (
              <span>Subscribe</span>
            )}
          </Button>
        </form>

        {error && (
          <p className='flex items-center justify-center gap-2 text-sm text-red-600'>
            <AlertCircle className='w-4 h-4 shrink-0' />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
