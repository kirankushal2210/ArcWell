// Arcwell's legal pages (D106): Privacy Policy, Terms of Use (the end-user licence), Copyright
// policy (DMCA-style notice and takedown, plus India's IT Rules grievance route) and how to delete
// an account (Google Play needs a web page for it). One source for both places they appear:
// - in the app, drawn natively by app/legal/[doc].tsx, so they work offline;
// - as static HTML in app/public/legal/, built by `npm run legal:build` for the website and the
//   Play Console links (`npm run legal:check` fails when the HTML is out of date).
//
// DRAFT: written from how the app actually handles data, but not legal advice. A lawyer must review
// it before launch, and every [bracketed] detail in OPERATOR must be filled in (docs/legal/README.md).
//
// This file is plain data with no imports, so the Node build script can load it directly.

/** Who runs Arcwell and how to reach them. Bracketed values are still to be confirmed. */
export const OPERATOR = {
  app: "Arcwell",
  legalName: "[Registered company name]",
  address: "[Registered office address], India",
  site: "arcwell.app",
  supportEmail: "support@arcwell.app",
  privacyEmail: "privacy@arcwell.app",
  copyrightEmail: "copyright@arcwell.app",
  grievanceOfficer: "[Grievance Officer name]",
  courtsCity: "[City]",
} as const;

/** Shown on every page; bump with POLICY_VERSION (lib/supabase.ts) when the text changes. */
export const LEGAL_VERSION = "2026-11";
export const LEGAL_UPDATED = "14 November 2026";

export type LegalSlug = "privacy" | "terms" | "copyright" | "delete-account";

/**
 * A paragraph, or a bulleted list. Text may hold links written as [label](target), where target is
 * doc:<slug>, mailto:<address> or an https URL.
 */
export type Block = string | { list: string[] };
export type Section = { heading: string; blocks: Block[] };
export type LegalDoc = {
  slug: LegalSlug;
  title: string;
  /** One line for menus. */
  short: string;
  /** The page's opening paragraph. */
  summary: string;
  sections: Section[];
};

const O = OPERATOR;
const mail = (a: string) => `[${a}](mailto:${a})`;

const contact: Section = {
  heading: "Contact and grievances",
  blocks: [
    `${O.app} is run by ${O.legalName}, ${O.address}.`,
    `Questions or complaints about your data or this page: ${mail(O.privacyEmail)}. Our Grievance Officer is ${O.grievanceOfficer}, at the same address. We acknowledge complaints within 24 hours and resolve them within 15 days.`,
    "If you're not satisfied with our answer, you can complain to the Data Protection Board of India.",
  ],
};

const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  short: "What we collect, why, and who sees it",
  summary: `${O.app} helps you train, eat and recover, alone, with our AI coach, or with a human coach. To do that it handles health data, so this page says plainly what we collect, why, who can see it and how to remove it. We follow India's Digital Personal Data Protection Act, 2023 (DPDP). We don't sell your data and we don't show ads.`,
  sections: [
    {
      heading: "What this covers",
      blocks: [
        `The ${O.app} Android app and the ${O.site} website, for athletes and coaches. "We" means ${O.legalName}.`,
      ],
    },
    {
      heading: "What we collect",
      blocks: [
        {
          list: [
            "**Account:** your name, email address and role (athlete or coach). If you sign in with Google, we get your name, email and profile photo from Google, never your password.",
            "**About you:** age, height, weight, sex (optional), body fat, goals, activity, training experience, injuries and diet. Women can choose to answer two questions about hormonal health (such as PCOS, thyroid conditions or pregnancy). These are optional and only adjust your targets.",
            "**What you log:** workouts and sets, cardio and races, foods and water, bodyweight and measurements, sleep, morning check-ins, stress and habits.",
            "**Photos and files:** progress and check-in photos (optional), your profile photo, meal photos you scan, and images or PDFs you send in chat.",
            "**Messages** between you and your coach.",
            "**Connected devices:** if you connect a device through Health Connect, the data you allow, such as sleep, heart rate, heart rate variability and steps.",
            "**Location:** only if you allow it, to sort gyms by distance. It's used on your phone and we don't keep a location history. Gyms work without it.",
            "**Enhanced tracking:** only for competitive bodybuilders whose coach asks and who say yes. Arcwell stores what you record about substances and bloodwork, visible to you and your coach only. You can stop sharing at any time.",
            "**Purchases:** whether you have Arcwell Plus, from Google Play through RevenueCat. Coaches pay through Razorpay. We never see your card or bank details.",
            "**Coaches' records:** what a coach records to run their business, such as client notes, packages, fees and payment status, and leads (a prospect's name, phone number or Instagram handle).",
            "**Technical data:** app version, device model, operating system, error reports, the token that delivers notifications, and IP addresses in server logs.",
          ],
        },
        "We don't use advertising IDs, ad networks or third-party analytics trackers.",
      ],
    },
    {
      heading: "Why we use it",
      blocks: [
        {
          list: [
            "To run the app: your plans, targets, logs, progress and reminders.",
            "To let your coach coach you, if you join one (see below).",
            "For AI features, only if you pay for Arcwell Plus and turn on AI. Coached athletes never get AI.",
            "To keep accounts secure, prevent abuse and fix problems.",
            "To answer support requests and meet our legal duties.",
          ],
        },
        "We don't sell your data, use it for advertising, or use your health data to train AI models.",
      ],
    },
    {
      heading: "Your consent",
      blocks: [
        "When you sign up, you agree to Arcwell storing your health data to run the app. AI (for Arcwell Plus) and progress photos each have their own permission, and saying no never blocks the rest of the app.",
        "You can change these at any time in Menu → Account → Privacy and permissions. Turning something off stops it from then on.",
      ],
    },
    {
      heading: "Who can see your data",
      blocks: [
        {
          list: [
            '**Your coach**, if you join one: what you log from the day you join. Older history only if you turn on "Share my history from before I joined", which you can turn off. Access ends the moment you leave. Your coach can only use your photos in a transformation post if you approve, and you can withdraw that later.',
            "**Nobody else in the app.** Other athletes never see your data. A coach's profile is shown on their invite page and to their own clients.",
            "**Our service providers**, only to run Arcwell and bound by contract: Supabase (database, sign-in and file storage, in Mumbai, India); Groq (AI requests, only for Arcwell Plus members with AI on); Google (sign-in, Google Play billing, Health Connect); RevenueCat (subscription status); Razorpay (coach billing); Expo (notification delivery).",
            "**Authorities**, when the law requires it.",
            "**A buyer or successor**, if Arcwell is sold or merged. This page would still apply to your data.",
          ],
        },
      ],
    },
    {
      heading: "Where it's stored",
      blocks: [
        "Your data is stored in India (Mumbai). AI requests may be processed by our AI provider outside India, only as the DPDP Act allows. We send only what the request needs, such as the meal photo for a meal scan, or your question and this week's numbers for the AI coach. Your AI coach chat is kept only on your phone, for that day; we don't store it.",
      ],
    },
    {
      heading: "How long we keep it",
      blocks: [
        "We keep your data while your account is open.",
        "When you delete your account, we remove your data from our live systems within 30 days and from backups within 90 days.",
        "We keep billing records for as long as tax law requires.",
        "If you leave your coach, you keep everything. If a coach deletes their account, their clients keep their own data.",
      ],
    },
    {
      heading: "Your rights",
      blocks: [
        {
          list: [
            "**See and download it:** Menu → Account → Export my data.",
            "**Correct it:** edit your profile and logs in the app, or ask us.",
            "**Delete it:** Menu → Account → Delete account, or see [how to delete your account](doc:delete-account).",
            "**Withdraw consent:** in Privacy and permissions.",
            "**Name a nominee** to act for you if you die or can't act. Email us to set this up.",
            `**Complain:** write to ${mail(O.privacyEmail)}.`,
          ],
        },
      ],
    },
    {
      heading: "Security",
      blocks: [
        "Data is encrypted in transit.",
        "Every table checks who is asking, so a coach can see only their own clients.",
        "Photos and files sit in private storage, opened through links that expire within minutes.",
        "Only a few people at Arcwell can reach production data, and only when they need to.",
        "No system is perfect. If a breach affects you, we'll tell you and the Data Protection Board as the law requires.",
      ],
    },
    {
      heading: "Age",
      blocks: [
        "Arcwell is for people aged 18 and over. We don't knowingly collect data from anyone younger. If you think we have, write to us and we'll delete it.",
      ],
    },
    {
      heading: "Changes to this page",
      blocks: [
        "If we change how we use your data, we'll update this page and tell you in the app before the change applies. Where the law needs it, we'll ask for your consent again.",
      ],
    },
    contact,
  ],
};

const terms: LegalDoc = {
  slug: "terms",
  title: "Terms of Use",
  short: "The rules for using Arcwell, and your licence",
  summary: `These terms are the agreement between you and ${O.legalName} for using ${O.app}. They include the licence that lets you use the app. By creating an account you accept them, and our [Privacy Policy](doc:privacy) explains how we handle your data.`,
  sections: [
    {
      heading: "Who can use Arcwell",
      blocks: [
        "You must be 18 or older and give true details about yourself. One account per person.",
        "Keep your login safe. You're responsible for what happens in your account.",
      ],
    },
    {
      heading: "Your licence to use the app",
      blocks: [
        `We give you a personal, non-exclusive, non-transferable licence to use ${O.app} on devices you own or control, while you follow these terms. You may not:`,
        {
          list: [
            "copy, change, resell or rent the app, or take apart its code, except where the law allows;",
            "get around paywalls, plan limits or the rules that keep accounts separate;",
            "scrape the app, overload it, or use bots to access it;",
            "use it to break the law or anyone's rights.",
          ],
        },
        "The app, its design, the Arcwell name and logo, the exercise library and the food data belong to us or our licensors.",
      ],
    },
    {
      heading: "Health and safety",
      blocks: [
        "Arcwell gives general fitness, nutrition and recovery guidance based on published research. It is **not medical advice** and doesn't diagnose or treat any condition.",
        {
          list: [
            "See a doctor before starting if you have a medical condition, an injury, or are pregnant or recently gave birth.",
            "Stop and get help if you feel pain, dizziness or shortness of breath.",
            "AI suggestions and calculated targets can be wrong. Use your judgement.",
            "Arcwell doesn't supply, recommend or endorse any drug or performance-enhancing substance. Enhanced tracking only records what a competitive athlete reports.",
          ],
        },
      ],
    },
    {
      heading: "Coaches and clients",
      blocks: [
        "Coaches on Arcwell are independent. The coaching relationship, its advice and its fees are between the coach and the client. Arcwell isn't a party to it.",
        "Certifications on coach profiles are self-reported. We don't check them.",
      ],
    },
    {
      heading: "Arcwell Plus subscriptions",
      blocks: [
        "Arcwell Plus is sold through Google Play, monthly or yearly. It renews automatically until you cancel in the Play Store.",
        "If you're offered a 7-day free trial, you're charged when it ends unless you cancel before then.",
        "Google Play's rules handle refunds.",
        "If Plus ends, your account goes back to Free and your history is kept.",
      ],
    },
    {
      heading: "Your content",
      blocks: [
        "What you log, upload or write stays yours.",
        "You let us store, process and show it only to run Arcwell for you and the people you share it with, such as your coach.",
        "This permission ends when you delete it or your account. Copies may stay in backups for a short time.",
        "Upload only what you have the right to share.",
      ],
    },
    {
      heading: "What's not allowed",
      blocks: [
        {
          list: [
            "Harassment, threats, hate, or sexual content.",
            "Other people's photos or personal data without their permission.",
            "Content that breaks copyright or trademarks. See our [Copyright policy](doc:copyright).",
            "Impersonating someone, or lying about qualifications.",
            "Promising cures, or selling drugs or banned substances.",
            "Spam, or messaging people who haven't agreed to hear from you.",
          ],
        },
        "We may remove content or suspend accounts that break these rules.",
      ],
    },
    {
      heading: "Extra terms for coaches",
      blocks: [
        {
          list: [
            "Use each client's data only to coach that client. Keep it confidential, and don't copy it into other tools unless you need to.",
            "Your access to a client's data ends when they leave or you mark them completed. Their earlier history is shared only if they choose.",
            "Have a lawful reason for any lead's details you record, and remove them if the person asks.",
            "Your subscription is billed monthly through Razorpay, outside the app. If a payment fails, you get 7 days' grace. After that you can't invite clients or change plans until you pay. Your clients aren't affected.",
            "You're responsible for your advice to clients, and you'll cover us for claims caused by your coaching or by breaking these terms.",
          ],
        },
      ],
    },
    {
      heading: "Ending your account",
      blocks: [
        "You can delete your account at any time in the app (see [how to delete your account](doc:delete-account)).",
        "We may suspend or close accounts that seriously or repeatedly break these terms, and we'll tell you why unless the law stops us.",
      ],
    },
    {
      heading: "Our responsibility",
      blocks: [
        "We work to keep Arcwell accurate and available, but we provide it as it is, without promises that it's error-free or always available.",
        "To the extent the law allows, we aren't liable for indirect losses, or for injury from following training or nutrition guidance.",
        "Our total liability is limited to what you paid us in the 12 months before the claim.",
        "Nothing here limits rights you have under consumer protection law.",
      ],
    },
    {
      heading: "Law and disputes",
      blocks: [
        `These terms are governed by the laws of India. Disputes go to the courts at ${O.courtsCity}, unless consumer law gives you another forum.`,
      ],
    },
    {
      heading: "Changes",
      blocks: [
        "If we change these terms, we'll tell you in the app before the change applies. If you keep using Arcwell after that, you accept the new terms. If you don't agree, you can delete your account.",
      ],
    },
    {
      heading: "Contact",
      blocks: [
        `${O.legalName}, ${O.address}. ${mail(O.supportEmail)}. Grievance Officer: ${O.grievanceOfficer}, ${mail(O.privacyEmail)}.`,
      ],
    },
  ],
};

const copyright: LegalDoc = {
  slug: "copyright",
  title: "Copyright policy",
  short: "Report content that copies your work",
  summary: `People upload photos, files, coaching templates, profiles and custom exercises to ${O.app}. We respect copyright and expect our users to as well. If you think something on Arcwell copies your work, tell us and we'll act quickly. This follows the notice-and-takedown process of the US Digital Millennium Copyright Act (DMCA), India's Copyright Act, 1957, and the Information Technology (Intermediary Guidelines) Rules, 2021.`,
  sections: [
    {
      heading: "How to report",
      blocks: [
        `Email ${mail(O.copyrightEmail)}, or write to our designated copyright agent (${O.grievanceOfficer}) at ${O.address}. Please include:`,
        {
          list: [
            "the work you say is copied (a link or description);",
            "where it is in Arcwell (the coach or account name, and a screenshot);",
            "your name, address, phone and email;",
            "a statement that you believe in good faith the use isn't allowed by the owner, their agent or the law;",
            "a statement that your notice is accurate and, under penalty of perjury, that you own the right or may act for the owner;",
            "your physical or electronic signature.",
          ],
        },
      ],
    },
    {
      heading: "What we do",
      blocks: [
        "We acknowledge your notice within 24 hours.",
        "If it's complete, we remove the content or block access to it and tell the person who posted it. We aim to finish within 15 days, sooner where the law needs it.",
        "We may ask for more details if a notice is incomplete.",
      ],
    },
    {
      heading: "If your content was removed",
      blocks: [
        "If you think it was removed by mistake, send a counter-notice to the same address with:",
        {
          list: [
            "what was removed and where it was;",
            "a statement, under penalty of perjury, that you believe in good faith it was removed by mistake or misidentified;",
            "your name, address and phone, and that you accept the courts where you live (or where Arcwell is based, if you're outside India and the US) and service from the person who complained;",
            "your signature.",
          ],
        },
        "We pass it to the person who complained. Unless they tell us within 10 to 14 working days that they've gone to court, we may put the content back.",
      ],
    },
    {
      heading: "Repeat infringers",
      blocks: [
        "We close the accounts of people who repeatedly upload content that infringes someone's rights.",
      ],
    },
    {
      heading: "False notices",
      blocks: [
        "Knowingly claiming that something infringes, or that it was removed by mistake, when that isn't true can make you liable for damages.",
      ],
    },
    {
      heading: "Other problems",
      blocks: [
        `For privacy, abuse or anything else, write to ${mail(O.privacyEmail)}. See our [Terms of Use](doc:terms) for what isn't allowed.`,
      ],
    },
  ],
};

const deleteAccount: LegalDoc = {
  slug: "delete-account",
  title: "Delete your Arcwell account",
  short: "How to delete your account and data",
  summary: `You can delete your ${O.app} account and its data at any time, from the app or by email.`,
  sections: [
    {
      heading: "In the app",
      blocks: [
        {
          list: [
            "Athletes: Menu (☰) → Account → Delete account, then confirm.",
            "Coaches: Menu (☰) → Delete account, then type to confirm.",
          ],
        },
        "If you pay for Arcwell Plus, cancel it in the Play Store too. Deleting your account doesn't stop Google Play billing. Coaches paying through Razorpay should cancel their subscription link.",
      ],
    },
    {
      heading: "Without the app",
      blocks: [
        `Email ${mail(O.privacyEmail)} from the address on your account, with the subject "Delete my account". We confirm it's you, then delete it.`,
      ],
    },
    {
      heading: "What's deleted, and when",
      blocks: [
        {
          list: [
            "Deleted: your profile, logs, photos, check-ins, messages, plans and settings. For coaches: templates, notes, leads and transformations.",
            "A coach's clients keep their own history and the plans they were given, read-only.",
            "Your data leaves our live systems within 30 days and our backups within 90 days.",
            "Billing records are kept as long as tax law requires.",
          ],
        },
        "Want a copy first? Use Menu → Account → Export my data.",
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalSlug, LegalDoc> = {
  privacy,
  terms,
  copyright,
  "delete-account": deleteAccount,
};

export const LEGAL_ORDER: LegalSlug[] = [
  "privacy",
  "terms",
  "copyright",
  "delete-account",
];

export const isLegalSlug = (s: string): s is LegalSlug => s in LEGAL_DOCS;

/** A run of inline text: plain, bold, or a link. Parses **bold** and [label](target). */
export type Inline = { text: string; bold?: boolean; href?: string };
export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let at = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > at) out.push({ text: text.slice(at, m.index) });
    if (m[1] !== undefined) out.push({ text: m[1], bold: true });
    else out.push({ text: m[2], href: m[3] });
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** Bracketed details still waiting to be filled in (shown by `npm run legal:check`). */
export const unfilled = () =>
  Object.entries(OPERATOR)
    .filter(([, v]) => /\[[^\]]+\]/.test(v))
    .map(([k]) => k);
