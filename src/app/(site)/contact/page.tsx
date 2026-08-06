'use client';

import ContactForm from './_components/ContactForm';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MessageCircle,
  Zap,
  Clock,
  Shield,
  Mail,
  Phone,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { MarketingButton } from '@/components/ui/marketing-button';
import {
  getCardHover,
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';

const features = [
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get answers within 2 hours during business hours',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your information is protected with enterprise-grade security',
  },
  {
    icon: MessageCircle,
    title: 'Multiple Channels',
    description: 'Reach us via email, phone, chat, or contact form',
  },
  {
    icon: Zap,
    title: 'Expert Support',
    description: 'Connect with our knowledgeable support specialists',
  },
];

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    details: ['support@erpqto.com', 'sales@erpqto.com'],
  },
  {
    icon: Phone,
    title: 'Phone',
    details: ['+1 (800) 123-4567', '+1 (800) 987-6543'],
  },
  {
    icon: Building2,
    title: 'Office',
    details: ['123 Business St', 'New York, NY 10001'],
  },
] satisfies {
  icon: LucideIcon;
  title: string;
  details: string[];
}[];

const faqs = [
  {
    q: 'What are your business hours?',
    a: 'Monday - Friday, 9AM - 6PM EST',
  },
  {
    q: 'How long does implementation take?',
    a: 'Typically 2-8 weeks depending on complexity',
  },
  {
    q: 'Do you offer training?',
    a: 'Yes, comprehensive training included with all plans',
  },
];

export default function ContactPage() {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);
  const hover = getCardHover(reduced);

  return (
    <main className='min-h-screen bg-background'>
      <section className='relative overflow-hidden hero-gradient section-padding'>
        <GridBackground opacity={0.12} className='absolute inset-0' />
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute top-20 right-0 size-72 rounded-full bg-hero-glow blur-3xl' />
          <div className='absolute -bottom-20 -left-20 size-96 rounded-full bg-hero-glow-alt blur-3xl' />
        </div>

        <div className='container-main relative z-10 text-center'>
          <motion.div
            variants={container}
            initial='hidden'
            animate='visible'
            className='mx-auto max-w-3xl'
          >
            <motion.div variants={item} className='mb-6 flex justify-center'>
              <EyebrowBadge
                icon={MessageCircle}
                label='Contact Our Team'
                variant='hero'
              />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className='mb-6 font-display text-5xl font-bold leading-tight text-hero-foreground md:text-6xl'
            >
              Let&apos;s Connect
              <span className='mt-2 block text-hero-accent'>
                And Build Together
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className='mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-hero-muted-foreground'
            >
              Whether you have questions, need technical support, want to
              explore a partnership, or just want to say hello—we&apos;re all
              ears.
            </motion.p>

            <motion.div
              variants={item}
              className='flex flex-wrap justify-center gap-4'
            >
              <div className='rounded-lg border border-hero-chip-border bg-hero-chip px-6 py-2 text-hero-foreground'>
                <p className='flex items-center justify-center gap-1.5 text-sm font-medium'>
                  <MessageCircle className='size-4 shrink-0' />
                  Multiple channels
                </p>
              </div>
              <div className='rounded-lg border border-hero-chip-border bg-hero-chip px-6 py-2 text-hero-foreground'>
                <p className='flex items-center justify-center gap-1.5 text-sm font-medium'>
                  <Zap className='size-4 shrink-0' />
                  Fast response
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className='section-padding bg-background'>
        <div className='container-main'>
          <HeaderSections
            tag='Support'
            title='How We Support You'
            description="We're committed to providing world-class support across every channel, whenever you need us most"
          />

          <motion.div
            className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={item}
                  whileHover={hover}
                >
                  <Card variant='interactive' radius='lg' padding='md' className='h-full'>
                    <CardContent className='p-0'>
                      <div className='mb-4 inline-flex rounded-lg bg-accent/10 p-3'>
                        <Icon className='size-6 text-accent' />
                      </div>
                      <h3 className='mb-2 font-display text-lg font-semibold text-foreground'>
                        {feature.title}
                      </h3>
                      <p className='text-sm leading-relaxed text-muted-foreground'>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <ContactForm />

      <section className='section-padding border-t border-border bg-muted/30'>
        <div className='container-main'>
          <motion.div
            variants={fadeUp}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
            className='mx-auto max-w-3xl text-center'
          >
            <h2 className='mb-4 font-display text-3xl font-bold text-foreground'>
              Quick Support Guide
            </h2>
            <p className='mb-8 text-lg text-muted-foreground'>
              Find quick answers to common questions. For more help, our support
              team is just one message away.
            </p>

            <motion.div
              className='grid grid-cols-1 gap-6 md:grid-cols-3'
              variants={container}
              initial='hidden'
              whileInView='visible'
              viewport={viewportOnce}
            >
              {faqs.map((faq) => (
                <motion.div key={faq.q} variants={item}>
                  <Card variant='default' radius='lg' padding='md' className='h-full text-left'>
                    <p className='mb-2 text-sm font-semibold text-foreground'>
                      {faq.q}
                    </p>
                    <p className='text-xs text-muted-foreground'>{faq.a}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial='hidden'
              whileInView='visible'
              viewport={viewportOnce}
              className='mt-8 flex justify-center'
            >
              <MarketingButton variant='primary' asChild>
                <Link href='/blog'>Explore Knowledge Base</Link>
              </MarketingButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className='section-padding border-t border-border bg-background'>
        <div className='container-main'>
          <motion.div
            className='grid grid-cols-1 gap-8 md:grid-cols-3'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
          >
            {contactInfo.map((contact) => {
              const Icon = contact.icon;
              return (
                <motion.div key={contact.title} variants={item} whileHover={hover}>
                  <Card
                    variant='interactive'
                    radius='lg'
                    padding='md'
                    className='h-full text-center'
                  >
                    <Icon className='mx-auto mb-3 size-8 text-accent' />
                    <h3 className='mb-3 font-display text-lg font-semibold text-foreground'>
                      {contact.title}
                    </h3>
                    {contact.details.map((detail) => (
                      <p key={detail} className='text-sm text-muted-foreground'>
                        {detail}
                      </p>
                    ))}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
