'use client';
import DemoForm from './_components/DemoForm';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: '30-Minute Session',
    description:
      'Tailored demonstration focused on your specific business needs and challenges',
  },
  {
    icon: Users,
    title: 'Expert Team',
    description:
      'Connect with our product specialists who understand your industry',
  },
  {
    icon: Zap,
    title: 'Live Demo',
    description: 'See real-time workflows and integrations in action',
  },
  {
    icon: CheckCircle2,
    title: 'Next Steps',
    description: 'Custom implementation roadmap tailored to your organization',
  },
];

export default function Demopage() {
  return (
    <main className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='hero-gradient section-padding relative overflow-hidden'>
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-20 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl' />
          <div className='absolute -bottom-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
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
              className='inline-block mb-4 px-4 py-2 rounded-full bg-accent/10 border border-accent/30'
            >
              <span className='text-sm font-semibold text-accent'>
                Limited Time Offer
              </span>
            </motion.div>

            <h1 className='text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight'>
              Experience ERPSuite
              <span className='block text-accent mt-2'>Your Way</span>
            </h1>

            <p className='text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed'>
              Get a personalized walkthrough of how ERPSuite can streamline your
              operations, boost productivity, and transform your business.
            </p>

            <div className='flex justify-center gap-4'>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='px-6 py-2 bg-accent/20 rounded-lg text-primary-foreground'
              >
                <p className='text-sm font-medium'>✓ No credit card required</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className='px-6 py-2 bg-accent/20 rounded-lg text-primary-foreground'
              >
                <p className='text-sm font-medium'>✓ 15 minutes to book</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className='section-padding bg-card/30'>
        <div className='container-main'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-foreground mb-4'>
              What to Expect
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Our demo process is designed to give you maximum value and insight
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
                  className='p-6 rounded-2xl border border-border/50 bg-card hover:border-accent/50 hover:shadow-lg transition-all duration-300 group'
                >
                  <div className='mb-4 inline-flex p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors'>
                    <Icon className='w-6 h-6 text-accent' />
                  </div>
                  <h3 className='text-lg font-semibold text-foreground mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <DemoForm />

      {/* Trust Badges */}
      {/* <section className='section-padding bg-linear-to-b from-accent/5 to-background border-t border-border'>
        <div className='container-main'>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'
          >
            {[
              { label: 'Companies', value: '500+' },
              { label: 'Users', value: '50K+' },
              { label: 'Countries', value: '25+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className='text-3xl font-bold text-accent mb-2'>
                  {stat.value}
                </p>
                <p className='text-sm text-muted-foreground'>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}
    </main>
  );
}
