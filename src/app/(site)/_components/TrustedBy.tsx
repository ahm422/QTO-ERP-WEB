import { TrustedByStrip } from '@/components/common/TrustedByStrip';

/** Calm trust strip — logo names adapted from Clientsmarquee rows. */
const TRUSTED_LOGOS = [
  { name: 'Nesma' },
  { name: 'Amreli Steels' },
  { name: 'KAPC' },
  { name: 'Haier' },
  { name: 'AkzoNobel' },
  { name: 'Honda Ring Road' },
];

export default function TrustedBy() {
  return (
    <section className='section-padding pt-0 md:pt-4'>
      <div className='container-main'>
        <TrustedByStrip logos={TRUSTED_LOGOS} />
      </div>
    </section>
  );
}
