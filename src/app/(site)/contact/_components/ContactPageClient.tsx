'use client';

import ContactForm from './ContactForm';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { MarketingButton } from '@/components/ui/marketing-button';
import { getContactIcon } from '@/lib/icon-map';
import {
  getCardHover,
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import type {
  ContactChannel,
  ContactPageContent,
  ContactSupportContent,
  FaqItem,
  PageHeroContent,
} from '@/types/content';

type ContactPageClientProps = {
  hero: PageHeroContent;
  support: ContactSupportContent;
  page: ContactPageContent;
  channels: ContactChannel[];
  faqs: FaqItem[];
};

type BottomContactCard = {
  kind: 'email' | 'phone' | 'office';
  iconKey: string;
  title: string;
  details: string[];
};

const CONTACT_DETAIL_LINK_CLASS =
  'block rounded-sm text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function ContactDetailLine({
  kind,
  detail,
}: {
  kind: BottomContactCard['kind'];
  detail: string;
}) {
  if (kind === 'email') {
    return (
      <a href={`mailto:${detail}`} className={CONTACT_DETAIL_LINK_CLASS}>
        {detail}
      </a>
    );
  }

  if (kind === 'phone') {
    return (
      <a
        href={`tel:${detail.replace(/\s/g, '')}`}
        className={CONTACT_DETAIL_LINK_CLASS}
      >
        {detail}
      </a>
    );
  }

  return <p className='text-sm text-muted-foreground'>{detail}</p>;
}

function splitHeroTitle(title: string): { main: string; accent: string | null } {
  const andIdx = title.indexOf(' And ');
  if (andIdx >= 0) {
    return {
      main: title.slice(0, andIdx),
      accent: title.slice(andIdx + 1),
    };
  }
  return { main: title, accent: null };
}

function pickSidePanelChannels(channels: ContactChannel[]): ContactChannel[] {
  const picked: ContactChannel[] = [];
  const priorityTypes = ['chat', 'email', 'phone'];

  for (const type of priorityTypes) {
    const match = channels.find(
      (c) => c.type === type && !picked.some((p) => p.id === c.id),
    );
    if (match) picked.push(match);
    if (picked.length >= 3) return picked;
  }

  for (const channel of channels) {
    if (picked.length >= 3) break;
    if (!picked.some((p) => p.id === channel.id)) picked.push(channel);
  }

  return picked.slice(0, 3);
}

function groupBottomContactCards(channels: ContactChannel[]): BottomContactCard[] {
  const cards: BottomContactCard[] = [];
  const emailChannels = channels.filter((c) => c.type === 'email');
  const phoneChannels = channels.filter((c) => c.type === 'phone');
  const officeChannels = channels.filter((c) => c.type === 'office');

  if (emailChannels.length > 0) {
    cards.push({
      kind: 'email',
      iconKey: emailChannels[0].iconKey,
      title: 'Email',
      details: emailChannels.map((c) => c.value),
    });
  }

  if (phoneChannels.length > 0) {
    cards.push({
      kind: 'phone',
      iconKey: phoneChannels[0].iconKey,
      title: 'Phone',
      details: phoneChannels.map((c) => c.value),
    });
  }

  for (const office of officeChannels) {
    cards.push({
      kind: 'office',
      iconKey: office.iconKey,
      title: office.label || 'Office',
      details: [office.value],
    });
  }

  return cards;
}

export default function ContactPageClient({
  hero,
  support,
  page,
  channels,
  faqs,
}: ContactPageClientProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);
  const hover = getCardHover(reduced);

  const { main: heroMain, accent: heroAccent } = splitHeroTitle(hero.title);
  const sidePanelChannels = pickSidePanelChannels(channels);
  const bottomCards = groupBottomContactCards(channels);

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
                label={hero.eyebrow}
                variant='hero'
              />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className='mb-6 font-display text-4xl font-bold leading-tight text-hero-foreground md:text-5xl'
            >
              {heroMain}
              {heroAccent ? (
                <span className='mt-2 block text-hero-accent'>{heroAccent}</span>
              ) : null}
            </motion.h1>

            <motion.p
              variants={item}
              className='mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-hero-muted-foreground'
            >
              {hero.subtitle}
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
            tag={support.tag}
            title={support.title}
            description={support.description}
          />

          <motion.div
            className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
          >
            {support.cards.map((feature) => {
              const Icon = getContactIcon(feature.iconKey);
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

      <ContactForm
        page={page}
        channels={sidePanelChannels}
        responseTimes={support.responseTimes}
      />

      <section className='section-padding border-t border-border bg-muted/30'>
        <div className='container-main'>
          <HeaderSections
            tag={page.faqTag}
            title={page.faqTitle}
            description={page.faqDescription}
          />

          <motion.div
            className='mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
          >
            {faqs.map((faq) => (
              <motion.div key={faq.id} variants={item}>
                <Card
                  variant='default'
                  radius='lg'
                  padding='md'
                  className='h-full text-left'
                >
                  <p className='mb-2 text-sm font-semibold text-foreground'>
                    {faq.question}
                  </p>
                  <p className='text-xs text-muted-foreground'>{faq.answer}</p>
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
            {bottomCards.map((contact) => {
              const Icon = getContactIcon(contact.iconKey);
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
                      <ContactDetailLine
                        key={detail}
                        kind={contact.kind}
                        detail={detail}
                      />
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
