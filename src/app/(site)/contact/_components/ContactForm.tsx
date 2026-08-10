'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MessageCircle,
  Tag,
  Zap,
} from 'lucide-react';
import { MarketingButton } from '@/components/ui/marketing-button';
import { getContactIcon } from '@/lib/icon-map';
import { getFadeInUp, viewportOnce } from '@/lib/motion';
import type {
  ContactPageContent,
  ContactChannel,
} from '@/types/content';
import type { ContactResponseTimes } from '@/lib/contact-page-defaults';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  companySize: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

type ContactFormProps = {
  page: ContactPageContent;
  channels: ContactChannel[];
  responseTimes: ContactResponseTimes;
};

const ContactForm = ({ page, channels, responseTimes }: ContactFormProps) => {
  const { formFieldOptions } = page;
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    companySize: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (
      !/^[\d\s\-\+\(\)]+$/.test(formData.phone) ||
      formData.phone.replace(/\D/g, '').length < 10
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Company size is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus('error');
      setStatusMessage('Please fill in all fields correctly');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setStatus('error');
        setStatusMessage(
          data.error ?? 'Something went wrong. Please try again.',
        );
        return;
      }

      setStatus('success');
      setStatusMessage(
        formFieldOptions.successMessage ??
          'Thank you for reaching out! We will get back to you shortly.',
      );
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        companySize: '',
        message: '',
      });

      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch {
      setStatus('error');
      setStatusMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='relative section-padding overflow-hidden bg-background'>
      <div className='container-main relative z-10'>
        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-3'>
          <motion.div
            variants={fadeUp}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
            className='space-y-8 lg:col-span-1'
          >
            <div>
              <h2 className='mb-3 font-display text-3xl font-bold leading-tight text-foreground md:text-4xl'>
                {page.sideTitle}
              </h2>
              <p className='text-lg text-muted-foreground leading-relaxed'>
                {page.sideDescription}
              </p>
            </div>
            <div className='space-y-4'>
              {channels.map((item) => {
                const Icon = getContactIcon(item.iconKey);
                return (
                  <div
                    key={item.id}
                    className='flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-accent/40 hover:bg-muted'
                  >
                    <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10'>
                      <Icon className='size-4 text-accent' />
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-foreground'>
                        {item.label}
                      </p>
                      <p className='text-xs text-muted-foreground'>{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='rounded-xl border border-border bg-muted/50 p-4'>
              <p className='mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                <Zap className='size-4 shrink-0 text-accent' />
                Response Times
              </p>
              <p className='mb-1 text-xs text-muted-foreground'>
                <span className='font-semibold text-foreground'>Typical: </span>
                {responseTimes.typical}
              </p>
              <p className='text-xs text-muted-foreground'>
                <span className='font-semibold text-foreground'>
                  Priority Issues:{' '}
                </span>
                {responseTimes.priority}
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
            className='lg:col-span-2'
          >
            <form
              onSubmit={handleSubmit}
              className='relative space-y-6 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[var(--card-shadow)]'
            >
              <div className='relative z-10 space-y-6'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='name'
                    className='text-sm font-semibold text-foreground mb-2'
                  >
                    {formFieldOptions.labels.name}{' '}
                    <span className='text-accent'>*</span>
                  </label>
                  <div className='relative flex items-center'>
                    <User className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                    <input
                      type='text'
                      id='name'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={formFieldOptions.placeholders.name}
                      disabled={isLoading || status === 'success'}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background/50 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${
                        errors.name
                          ? 'border-destructive focus:ring-destructive/50'
                          : 'border-border/50 hover:border-accent/40 focus:bg-background/80'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className='text-xs text-destructive mt-1.5 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' /> {errors.name}
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex flex-col'>
                    <label
                      htmlFor='email'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      {formFieldOptions.labels.email}{' '}
                      <span className='text-accent'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <Mail className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                      <input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={formFieldOptions.placeholders.email}
                        disabled={isLoading || status === 'success'}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background/50 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${
                          errors.email
                            ? 'border-destructive focus:ring-destructive/50'
                            : 'border-border/50 hover:border-border/80 focus:bg-background/80'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className='text-xs text-destructive mt-1.5 flex items-center gap-1'>
                        <AlertCircle className='h-3 w-3' /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div className='flex flex-col'>
                    <label
                      htmlFor='phone'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      {formFieldOptions.labels.phone}{' '}
                      <span className='text-accent'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <Phone className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                      <input
                        type='tel'
                        id='phone'
                        name='phone'
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={formFieldOptions.placeholders.phone}
                        disabled={isLoading || status === 'success'}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background/50 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${
                          errors.phone
                            ? 'border-destructive focus:ring-destructive/50'
                            : 'border-border/50 hover:border-border/80 focus:bg-background/80'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className='text-xs text-destructive mt-1.5 flex items-center gap-1'>
                        <AlertCircle className='h-3 w-3' /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex flex-col'>
                    <label
                      htmlFor='company'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      {formFieldOptions.labels.company}{' '}
                      <span className='text-accent'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <Building2 className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                      <input
                        type='text'
                        id='company'
                        name='company'
                        value={formData.company}
                        onChange={handleChange}
                        placeholder={formFieldOptions.placeholders.company}
                        disabled={isLoading || status === 'success'}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background/50 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${
                          errors.company
                            ? 'border-destructive focus:ring-destructive/50'
                            : 'border-border/50 hover:border-border/80 focus:bg-background/80'
                        }`}
                      />
                    </div>
                    {errors.company && (
                      <p className='text-xs text-destructive mt-1.5 flex items-center gap-1'>
                        <AlertCircle className='h-3 w-3' /> {errors.company}
                      </p>
                    )}
                  </div>

                  <div className='flex flex-col'>
                    <label
                      htmlFor='companySize'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      {formFieldOptions.labels.companySize}{' '}
                      <span className='text-accent'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <Briefcase className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                      <select
                        id='companySize'
                        name='companySize'
                        value={formData.companySize}
                        onChange={handleChange}
                        disabled={isLoading || status === 'success'}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background/50 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer backdrop-blur-sm ${
                          errors.companySize
                            ? 'border-destructive focus:ring-destructive/50'
                            : 'border-border/50 hover:border-border/80 focus:bg-background/80'
                        }`}
                      >
                        <option value=''>
                          {formFieldOptions.placeholders.companySize}
                        </option>
                        {formFieldOptions.companySizes.map((size) => (
                          <option key={size.value} value={size.value}>
                            {size.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.companySize && (
                      <p className='text-xs text-destructive mt-1.5 flex items-center gap-1'>
                        <AlertCircle className='h-3 w-3' /> {errors.companySize}
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label
                    htmlFor='subject'
                    className='text-sm font-semibold text-foreground mb-2'
                  >
                    {formFieldOptions.labels.subject}{' '}
                    <span className='text-accent'>*</span>
                  </label>
                  <div className='relative flex items-center'>
                    <Tag className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                    <select
                      id='subject'
                      name='subject'
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={isLoading || status === 'success'}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background/50 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer backdrop-blur-sm ${
                        errors.subject
                          ? 'border-destructive focus:ring-destructive/50'
                          : 'border-border/50 hover:border-border/80 focus:bg-background/80'
                      }`}
                    >
                      <option value=''>
                        {formFieldOptions.placeholders.subject}
                      </option>
                      {formFieldOptions.subjects.map((subject) => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.subject && (
                    <p className='text-xs text-destructive mt-1.5 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' /> {errors.subject}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label
                    htmlFor='message'
                    className='text-sm font-semibold text-foreground mb-2'
                  >
                    {formFieldOptions.labels.message}{' '}
                    <span className='text-accent'>*</span>
                  </label>
                  <div className='relative flex items-start'>
                    <MessageCircle className='absolute left-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none' />
                    <textarea
                      id='message'
                      name='message'
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={formFieldOptions.placeholders.message}
                      disabled={isLoading || status === 'success'}
                      rows={5}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background/50 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm resize-none ${
                        errors.message
                          ? 'border-destructive focus:ring-destructive/50'
                          : 'border-border/50 hover:border-border/80 focus:bg-background/80'
                      }`}
                    />
                  </div>
                  {errors.message && (
                    <p className='text-xs text-destructive mt-1.5 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' /> {errors.message}
                    </p>
                  )}
                </div>

                <div className='flex gap-3 pt-4'>
                  <MarketingButton
                    type='submit'
                    disabled={isLoading || status === 'success'}
                    variant='primary'
                    size='lg'
                    className='flex-1'
                    iconSlide={!isLoading && status !== 'success'}
                  >
                    {isLoading ? (
                      <>
                        <div className='size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground' />
                        Sending...
                      </>
                    ) : status === 'success' ? (
                      <>
                        <Check className='size-4' />
                        Message Sent!
                      </>
                    ) : (
                      formFieldOptions.submitLabel ?? 'Send Message'
                    )}
                  </MarketingButton>
                </div>

                {status === 'error' && (
                  <div className='p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3'>
                    <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
                    <p className='text-sm text-destructive'>{statusMessage}</p>
                  </div>
                )}

                {status === 'success' && (
                  <div className='flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4'>
                    <Check className='mt-0.5 size-5 shrink-0 text-success' />
                    <p className='text-sm text-success'>{statusMessage}</p>
                  </div>
                )}

                <p className='text-center text-xs text-muted-foreground'>
                  We respect your privacy. We&apos;ll never share your
                  information with third parties.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
