'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, ExternalLink, Mail } from 'lucide-react';
import { MarketingButton } from '@/components/ui/marketing-button';
import type { FooterContent } from '@/types/content';

type FooterProps = {
  content: FooterContent;
};

export default function Footer({ content }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const copyright = content.copyrightText.replace(
    '{year}',
    String(new Date().getFullYear()),
  );

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.status === 409) {
        setStatus('duplicate');
        setErrorMessage(data.error ?? 'Already subscribed');
        return;
      }

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className='border-t border-border bg-card'>
      <div className='container-main py-16 md:py-20'>
        <div className='grid grid-cols-2 gap-10 md:grid-cols-6 lg:grid-cols-12 lg:gap-8'>
          {/* Brand */}
          <div className='col-span-2 md:col-span-6 lg:col-span-3'>
            <Link
              href='/'
              className='font-display text-xl font-bold tracking-tight text-foreground'
            >
              <span className='text-gradient'>QTO</span>-ERP
            </Link>
            <p className='mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground'>
              {content.brandBlurb}
            </p>
            <a
              href={content.builtByUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
            >
              {content.builtByLabel} <ExternalLink className='h-3 w-3' />
            </a>
          </div>

          {content.linkGroups.map((group) => (
            <div key={group.title} className='md:col-span-1 lg:col-span-2'>
              <h4 className='mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground'>
                {group.title}
              </h4>
              <ul className='space-y-2.5'>
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.url}-${link.label}`}>
                    {link.external ? (
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
                      >
                        {link.label}
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className='text-sm text-muted-foreground transition-colors hover:text-foreground'
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className='col-span-2 md:col-span-6 lg:col-span-3'>
            <h4 className='mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground'>
              {content.newsletterHeading}
            </h4>
            <p className='mb-5 text-sm leading-relaxed text-muted-foreground'>
              {content.newsletterCopy}
            </p>
            <form onSubmit={handleSubscribe} className='space-y-3'>
              <label className='sr-only' htmlFor='footer-newsletter-email'>
                Email address
              </label>
              <div className='relative'>
                <Mail className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='footer-newsletter-email'
                  type='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error' || status === 'duplicate') {
                      setStatus('idle');
                      setErrorMessage('');
                    }
                  }}
                  placeholder='you@company.com'
                  required
                  disabled={isLoading}
                  className='w-full rounded-xl border border-input bg-background py-3 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60'
                />
              </div>
              <MarketingButton
                type='submit'
                size='sm'
                className='w-full'
                disabled={isLoading}
                iconSlide={!isLoading && status !== 'success'}
              >
                {status === 'success' ? (
                  <>
                    <CheckCircle className='size-4' />
                    Subscribed
                  </>
                ) : isLoading ? (
                  'Subscribing…'
                ) : (
                  'Subscribe'
                )}
              </MarketingButton>
            </form>
            {status === 'success' ? (
              <p className='mt-2 flex items-center gap-1.5 text-xs text-success'>
                <CheckCircle className='size-3.5 shrink-0' />
                You&apos;re on the list.
              </p>
            ) : null}
            {status === 'duplicate' || status === 'error' ? (
              <p className='mt-2 flex items-center gap-1.5 text-xs text-destructive'>
                <AlertCircle className='size-3.5 shrink-0' />
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className='mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row'>
          <p className='text-xs text-muted-foreground'>{copyright}</p>
          <div className='flex gap-4'>
            {content.bottomLinks.map((link) =>
              link.external ? (
                <a
                  key={`${link.url}-${link.label}`}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={`${link.url}-${link.label}`}
                  href={link.url}
                  className='text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
