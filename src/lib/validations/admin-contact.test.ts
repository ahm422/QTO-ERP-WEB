import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  upsertContactPageContentSchema,
  upsertContactSupportContentSchema,
} from "./admin-contact";

const validSupport = {
  tag: "Support",
  title: "How We Support You",
  description: "We're here to help.",
  cards: [{ iconKey: "clock", title: "Fast", description: "Quick replies" }],
  responseTimes: { typical: "2-4 hours", priority: "Within 1 hour" },
};

const validPage = {
  sideTitle: "We're Here To Help",
  sideDescription: "Send us a message.",
  formFieldOptions: {
    labels: {
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      company: "Company",
      companySize: "Company Size",
      subject: "Subject",
      message: "Message",
    },
    placeholders: {
      name: "John Doe",
      email: "john@x.com",
      phone: "+1",
      company: "Acme",
      companySize: "Select",
      subject: "Select",
      message: "How can we help?",
    },
    companySizes: [{ value: "1-10", label: "1-10 Employees" }],
    subjects: [{ value: "general", label: "General Inquiry" }],
  },
  faqTag: "FAQ",
  faqTitle: "Quick Support Guide",
  faqDescription: "Find quick answers.",
};

describe("upsertContactSupportContentSchema — knowledge base", () => {
  it("passes without the optional knowledge-base fields", () => {
    assert.equal(
      upsertContactSupportContentSchema.safeParse(validSupport).success,
      true,
    );
  });

  it("accepts a relative knowledge-base href", () => {
    assert.equal(
      upsertContactSupportContentSchema.safeParse({
        ...validSupport,
        knowledgeBaseLabel: "Visit KB",
        knowledgeBaseHref: "/blog",
      }).success,
      true,
    );
  });

  it("rejects a javascript: knowledge-base href", () => {
    assert.equal(
      upsertContactSupportContentSchema.safeParse({
        ...validSupport,
        knowledgeBaseHref: "javascript:alert(1)",
      }).success,
      false,
    );
  });
});

describe("upsertContactPageContentSchema — SEO", () => {
  it("passes without meta fields", () => {
    assert.equal(
      upsertContactPageContentSchema.safeParse(validPage).success,
      true,
    );
  });

  it("accepts optional meta fields", () => {
    assert.equal(
      upsertContactPageContentSchema.safeParse({
        ...validPage,
        metaTitle: "Contact Us",
        metaDescription: "Get in touch.",
      }).success,
      true,
    );
  });

  it("rejects an oversized meta title", () => {
    assert.equal(
      upsertContactPageContentSchema.safeParse({
        ...validPage,
        metaTitle: "x".repeat(201),
      }).success,
      false,
    );
  });
});
