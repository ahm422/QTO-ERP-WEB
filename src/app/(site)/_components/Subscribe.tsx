'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { MarketingButton } from '@/components/ui/marketing-button';
import { Card } from '@/components/ui/card';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';

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
    <section className='w-full bg-muted/40 px-4 py-20'>
      <div className='mx-auto max-w-2xl'>
        <div className='mb-10 text-center'>
          <div className='mb-4 flex justify-center'>
            <EyebrowBadge label='Newsletter' variant='accent' icon={Mail} />
          </div>
          <h2 className='mb-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
            Stay Updated
          </h2>
          <p className='text-lg text-muted-foreground'>
            Subscribe to get the latest updates and insights.
          </p>
        </div>

        <Card variant='default' radius='lg' padding='lg'>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-3 sm:flex-row'
          >
            <div className='relative flex-1'>
              <div className='pointer-events-none absolute top-1/2 left-4 -translate-y-1/2'>
                <Mail className='size-5 text-muted-foreground' />
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
                className='w-full rounded-xl border border-input bg-background py-3 pr-4 pl-12 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60'
              />
            </div>

            <MarketingButton
              type='submit'
              size='lg'
              disabled={isLoading}
              iconSlide={!submitted && !isLoading}
            >
              {submitted ? (
                <>
                  <CheckCircle className='size-5' />
                  <span>Subscribed</span>
                </>
              ) : isLoading ? (
                <span>Subscribing...</span>
              ) : (
                <span>Subscribe</span>
              )}
            </MarketingButton>
          </form>

          {error ? (
            <p className='mt-4 flex items-center justify-center gap-2 text-sm text-destructive'>
              <AlertCircle className='size-4 shrink-0' />
              {error}
            </p>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
