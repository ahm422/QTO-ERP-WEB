'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const companySizes = [
  { value: '1-10', label: '1-10 Employees' },
  { value: '11-50', label: '11-50 Employees' },
  { value: '51-200', label: '51-200 Employees' },
  { value: '201-500', label: '201-500 Employees' },
  { value: '501-1000', label: '501-1000 Employees' },
  { value: '1000+', label: '1000+ Employees' },
];

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'sales', label: 'Sales Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

const ContactForm = () => {
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
      // Simulate API call - replace with your actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus('success');
      setStatusMessage(
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

      // Reset success state after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setStatusMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='relative section-padding overflow-hidden bg-linear-to-br from-background via-background to-accent/5'>
      {/* Background Elements */}
      <div className='absolute inset-0 pointer-events-none' />
      <div className='absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl opacity-40 pointer-events-none' />
      <div className='absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-25 pointer-events-none' />

      <div className='container-main max-w-7xl relative z-10 px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className='lg:col-span-1 space-y-8'
          >
            <div>
              <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight'>
                We&apos;re Here To Help
              </h2>
              <p className='text-lg text-muted-foreground leading-relaxed'>
                Questions? Issues? Ideas? Send us a message and our dedicated
                support team will get back to you as soon as possible.
              </p>
            </div>
            {/* Contact Methods */}
            <div className='space-y-4'>
              {[
                {
                  icon: '✉️',
                  title: 'Email Support',
                  desc: 'support@erpqto.com',
                },
                {
                  icon: '☎️',
                  title: 'Phone Support',
                  desc: '+1 (800) 123-4567',
                },
                {
                  icon: '💭',
                  title: 'Live Chat',
                  desc: 'Real-time assistance',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className='flex gap-3 items-start p-3 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/40 hover:bg-accent/10 transition-all'
                >
                  <div className='text-2xl shrink-0'>{item.icon}</div>{' '}
                  <div>
                    {' '}
                    <p className='font-semibold text-foreground text-sm'>
                       {item.title}{' '}
                    </p>
                    {' '}
                    <p className='text-xs text-muted-foreground'>{item.desc}</p>
                    {' '}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Response Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='p-4 rounded-xl bg-linear-to-br from-accent/15 to-accent-dark/10 border border-accent/30 backdrop-blur-sm'
            >
              {' '}
              <p className='text-sm text-foreground font-semibold mb-2'>
                {' '}
                ⚡ Response Times{' '}
              </p>{' '}
              <p className='text-xs text-muted-foreground mb-1'>
                {' '}
                <span className='font-semibold text-foreground'>
                  {' '}
                  Typical:{' '}
                </span>{' '}
                2-4 hours{' '}
              </p>{' '}
              <p className='text-xs text-muted-foreground'>
                {' '}
                <span className='font-semibold text-foreground'>
                  {' '}
                  Priority Issues:{' '}
                </span>{' '}
                Within 1 hour{' '}
              </p>{' '}
            </motion.div>{' '}
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='lg:col-span-2'
          >
            <motion.form
              onSubmit={handleSubmit}
              className='group rounded-2xl border border-accent/30 bg-linear-to-br from-card via-card to-accent/5 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden'
            >
              {/* linear Border Effect */}
              <div className='absolute inset-0 rounded-2xl bg-linear-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none' />
              <div className='relative z-10 space-y-6'>
                {/* Name Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className='flex flex-col'
                >
                  <label
                    htmlFor='name'
                    className='text-sm font-semibold text-foreground mb-2'
                  >
                    Full Name <span className='text-accent'>*</span>
                  </label>
                  <div className='relative flex items-center'>
                    <User className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                    <input
                      type='text'
                      id='name'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      placeholder='John Doe'
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
                </motion.div>

                {/* Two Column Row - Email and Phone */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className='flex flex-col'
                  >
                    <label
                      htmlFor='email'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      Email Address <span className='text-accent'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <Mail className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                      <input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        placeholder='john@company.com'
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
                  </motion.div>

                  {/* Phone Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className='flex flex-col'
                  >
                    <label
                      htmlFor='phone'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      Phone Number <span className='text-accent'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <Phone className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                      <input
                        type='tel'
                        id='phone'
                        name='phone'
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder='+1 (555) 123-4567'
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
                  </motion.div>
                </div>

                {/* Two Column Row - Company and Company Size */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Company Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    className='flex flex-col'
                  >
                    <label
                      htmlFor='company'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      Company Name <span className='text-accent'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <Building2 className='absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none' />
                      <input
                        type='text'
                        id='company'
                        name='company'
                        value={formData.company}
                        onChange={handleChange}
                        placeholder='Acme Corporation'
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
                  </motion.div>

                  {/* Company Size Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className='flex flex-col'
                  >
                    <label
                      htmlFor='companySize'
                      className='text-sm font-semibold text-foreground mb-2'
                    >
                      Company Size <span className='text-accent'>*</span>
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
                        <option value=''>Select size</option>
                        {companySizes.map((size) => (
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
                  </motion.div>
                </div>

                {/* Subject Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                  className='flex flex-col'
                >
                  <label
                    htmlFor='subject'
                    className='text-sm font-semibold text-foreground mb-2'
                  >
                    Subject <span className='text-accent'>*</span>
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
                      <option value=''>Select subject</option>
                      {subjectOptions.map((subject) => (
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
                </motion.div>

                {/* Message Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className='flex flex-col'
                >
                  <label
                    htmlFor='message'
                    className='text-sm font-semibold text-foreground mb-2'
                  >
                    Message <span className='text-accent'>*</span>
                  </label>
                  <div className='relative flex items-start'>
                    <MessageCircle className='absolute left-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none' />
                    <textarea
                      id='message'
                      name='message'
                      value={formData.message}
                      onChange={handleChange}
                      placeholder='Tell us more about your inquiry...'
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
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.45 }}
                  className='flex gap-3 pt-4'
                >
                  <Button
                    type='submit'
                    disabled={isLoading || status === 'success'}
                    variant='default'
                    size='lg'
                    className='flex-1 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-accent/30'
                  >
                    {isLoading ? (
                      <div className='flex items-center gap-2'>
                        <div className='h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin' />
                        Sending...
                      </div>
                    ) : status === 'success' ? (
                      <div className='flex items-center gap-2'>
                        <Check className='h-4 w-4' />
                        Message Sent!
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </motion.div>

                {/* Status Messages */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className='p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3'
                  >
                    <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
                    <p className='text-sm text-destructive'>{statusMessage}</p>
                  </motion.div>
                )}

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className='p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3'
                  >
                    <Check className='h-5 w-5 text-green-600 shrink-0 mt-0.5' />
                    <p className='text-sm text-green-700'>{statusMessage}</p>
                  </motion.div>
                )}

                <p className='text-xs text-muted-foreground text-center'>
                  We respect your privacy. We&apos;ll never share your
                  information with third parties.
                </p>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
