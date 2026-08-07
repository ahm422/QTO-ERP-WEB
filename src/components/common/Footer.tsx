'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, ExternalLink, Mail } from 'lucide-react';
import { QTO_DEV_URL } from '@/lib/constants';
import { MarketingButton } from '@/components/ui/marketing-button';

const footerLinks = {
  Platform: [
    { label: 'Attendance & Time', href: '/erp/attendance' },
    { label: 'HRM', href: '/erp/hrm' },
    { label: 'Project Management', href: '/erp/project-management' },
    { label: 'All Apps', href: '/allApps' },
  ],
  Solutions: [
    { label: 'HR Teams', href: '/solution/hr-teams' },
    { label: 'Project Teams', href: '/solution/project-teams' },
    { label: 'Business Owners', href: '/solution/owners' },
  ],
  Resources: [
    { label: 'FAQ', href: '/#faq' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'QTO Dev', href: QTO_DEV_URL, external: true },
  ],
  Company: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
    { label: 'Book a Demo', href: '/demo' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

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
      <div className='container-main py-16'>
        <div className='grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-12'>
          {/* Brand */}
          <div className='col-span-2 md:col-span-6 lg:col-span-3'>
            <Link
              href='/'
              className='font-display text-xl font-bold tracking-tight text-foreground'
            >
              <span className='text-gradient'>QTO</span>-ERP
            </Link>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
              Modern ERP for growing teams. Attendance, HR, and projects — all in
              one place.
            </p>
            <a
              href={QTO_DEV_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
            >
              Built by QTO Dev <ExternalLink className='h-3 w-3' />
            </a>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className='md:col-span-1 lg:col-span-2'>
              <h4 className='mb-4 text-sm font-semibold text-foreground'>
                {title}
              </h4>
              <ul className='space-y-2.5'>
                {links.map((link) => (
                  <li key={link.href}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
                      >
                        {link.label}
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
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
            <h4 className='mb-4 text-sm font-semibold text-foreground'>
              Newsletter
            </h4>
            <p className='mb-4 text-sm leading-relaxed text-muted-foreground'>
              Product updates and construction ops insights — no spam.
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
                  className='w-full rounded-xl border border-input bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60'
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
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} QTO-ERP. A product by QTO Dev.
          </p>
          <div className='flex gap-4'>
            <Link
              href='/contact'
              className='text-xs text-muted-foreground transition-colors hover:text-foreground'
            >
              Contact
            </Link>
            <Link
              href='/demo'
              className='text-xs text-muted-foreground transition-colors hover:text-foreground'
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
