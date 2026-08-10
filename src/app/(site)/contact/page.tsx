import ContactPageClient from "./_components/ContactPageClient";
import {
  getContactPageContent,
  getContactSupportContent,
  getPageHeroContent,
  listPublishedContactChannels,
  listPublishedFaqs,
} from "@/lib/content-db";
import { FAQ_PAGE_KEY_CONTACT } from "@/lib/faqs-defaults";
import { PAGE_HERO_KEY_CONTACT } from "@/lib/page-hero-defaults";

export default async function ContactPage() {
  const [hero, support, page, channels, faqs] = await Promise.all([
    getPageHeroContent(PAGE_HERO_KEY_CONTACT),
    getContactSupportContent(),
    getContactPageContent(),
    listPublishedContactChannels(),
    listPublishedFaqs(FAQ_PAGE_KEY_CONTACT),
  ]);

  return (
    <ContactPageClient
      hero={hero}
      support={support}
      page={page}
      channels={channels}
      faqs={faqs}
    />
  );
}
