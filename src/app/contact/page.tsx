'use client';
import { Button } from '@/components/ui/button';
import ContactForm from './_components/ContactForm';
import { motion } from 'framer-motion';
import { MessageCircle, Zap, Clock, Shield, ArrowRightIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

export default function ContactPage() {
  return (
    <main className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='relative section-padding overflow-hidden bg-linear-to-br from-accent-dark/5 via-background to-accent/5'>
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-accent/15 rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl' />
        </div>

        <div className='container-main text-center relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='inline-block mb-4 px-4 py-2 rounded-full bg-accent/15 border border-accent/30'
            >
              <span className='text-sm font-semibold text-accent-dark'>
                Contact Our Team
              </span>
            </motion.div>

            <h1 className='text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight'>
              Let&apos;s Connect
              <span className='block bg-linear-to-r from-accent-dark to-accent bg-clip-text text-transparent mt-2'>
                And Build Together
              </span>
            </h1>

            <p className='text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed'>
              Whether you have questions, need technical support, want to
              explore a partnership, or just want to say hello—we&apos;re all
              ears.
            </p>

            <div className='flex justify-center gap-4 flex-wrap'>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='px-6 py-2 bg-accent/15 rounded-lg text-foreground border border-accent/20'
              >
                <p className='text-sm font-medium'>💬 Multiple channels</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className='px-6 py-2 bg-purple-500/15 rounded-lg text-foreground border border-purple-500/20'
              >
                <p className='text-sm font-medium'>⚡ Fast response</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className='section-padding bg-linear-to-b from-accent-dark/5 to-background/50'>
        <div className='container-main'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-foreground mb-4'>
              How We Support You
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              We&apos;re committed to providing world-class support across every
              channel, whenever you need us most
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  // className='p-6 rounded-2xl border border-border/30 bg-linear-to-br from-card to-card/50 hover:border-accent/50 hover:shadow-xl transition-all duration-300 group'
                >
                  <Card>
                  <CardContent>
                  <div className='mb-4 inline-flex p-3 rounded-lg bg-linear-to-br from-accent-dark/20 to-accent/20 group-hover:from-accent-dark/30 group-hover:to-accent/30 transition-colors'>
                    <Icon className='w-6 h-6 text-accent-dark' />
                  </div>
                  <h3 className='text-lg font-semibold text-foreground mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {feature.description}
                  </p>
                  </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <ContactForm />

      {/* FAQ Quick Links */}
      <section className='section-padding bg-linear-to-b from-accent/5 to-background border-t border-border/30'>
        <div className='container-main'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='text-center max-w-3xl mx-auto'
          >
            <h2 className='text-3xl font-bold text-foreground mb-4'>
              Quick Support Guide
            </h2>
            <p className='text-lg text-muted-foreground mb-8'>
              Find quick answers to common questions. For more help, our support
              team is just one message away.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {[
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
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className='p-5 rounded-xl bg-card border border-border/30 text-left'
                >
                  <p className='font-semibold text-foreground text-sm mb-2'>
                    {item.q}
                  </p>
                  <p className='text-xs text-muted-foreground'>{item.a}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='mt-8'
            >
              <a
                href='/blog'
                // className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-accent-dark to-accent text-white font-semibold hover:shadow-lg hover:shadow-accent-dark/30 transition-all duration-300'
              >
                <Button variant='default' className='px-3 py-1'>
                Explore Knowledge Base
                  <ArrowRightIcon className='w-4 h-4 ml-2' />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className='section-padding bg-linear-to-b from-background to-accent-dark/5 border-t border-border/30'>
        <div className='container-main'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='grid grid-cols-1 md:grid-cols-3 gap-8'
          >
            {[
              {
                icon: '📧',
                title: 'Email',
                details: ['support@erpqto.com', 'sales@erpqto.com'],
                color: 'from-accent/20 to-accent/5',
                border: 'border-accent/30',
              },
              {
                icon: '📞',
                title: 'Phone',
                details: ['+1 (800) 123-4567', '+1 (800) 987-6543'],
                color: 'from-purple-500/20 to-purple-500/5',
                border: 'border-purple-500/30',
              },
              {
                icon: '🏢',
                title: 'Office',
                details: ['123 Business St', 'New York, NY 10001'],
                color: 'from-pink-500/20 to-pink-500/5',
                border: 'border-pink-500/30',
              },
            ].map((contact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`p-6 rounded-xl bg-linear-to-br ${contact.color} border ${contact.border} text-center hover:shadow-lg transition-all duration-300`}
              >
                <p className='text-3xl mb-3'>{contact.icon}</p>
                <h3 className='text-lg font-semibold text-foreground mb-3'>
                  {contact.title}
                </h3>
                {contact.details.map((detail, j) => (
                  <p key={j} className='text-sm text-muted-foreground'>
                    {detail}
                  </p>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
