# Legal pages: what applies to Arcwell, and what's left before launch

Drafted 14 November 2026 (D106). The text lives in `app/src/features/legal/docs.ts`.

- **In the app**, it's at `/legal/<page>`, drawn natively and bundled, so it works offline and before sign-up.
- **On the web**, `npm run legal:build` writes the same text as static HTML to `app/public/legal/`. `npm run lint` fails if the HTML is out of date.

**Draft, not legal advice.** The text describes how the app actually handles data, but a lawyer must review it before launch. This matters especially because Arcwell processes health data under India's DPDP Act. This review replaces the "Coach Terms legal review" item in PLAN.md.

## The three suggestions, checked against Arcwell

### 1. A DMCA / copyright takedown policy: applies (`copyright`)

**Why it applies:** users upload things.

- Progress and check-in photos, profile photos, chat images and PDFs.
- Coach profiles, bios and transformation posts, which are shown on the invite page.
- Coaching templates, including spreadsheet imports.
- Custom exercises and foods.

Most of this is private between a coach and a client. Coach profiles and imported templates are where a copyright claim is most likely.

**Why it covers more than the DMCA:**

- The DMCA is US law. Its safe harbour only protects us if we have a takedown process and a designated agent.
- Arcwell is India-first, so the policy also follows India's Copyright Act, 1957 and the IT (Intermediary Guidelines) Rules, 2021. Those rules require a Grievance Officer who acknowledges complaints within 24 hours and resolves them within 15 days.
- The policy uses one contact for both systems.

**To do:**

- [ ] Choose who handles notices (the Grievance Officer can do both).
- [ ] Register a DMCA designated agent at the U.S. Copyright Office (copyright.gov/dmca-directory). It costs a small fee and must be renewed every 3 years. This is optional while we're India-only, but cheap insurance once anyone outside India can install the app.
- [ ] Set up `copyright@arcwell.app`, or change the address in `OPERATOR`.
- [ ] Later: a "Report" button on coach profiles and transformation posts. Today, reports come in by email.

### 2. "EU": read as EULA, an End User Licence Agreement: applies (`terms`)

We read "EU" as EULA, the agreement that says what users may and may not do and who owns what. It's the Terms of Use page. It covers:

- the licence to use the app;
- what users may not do;
- ownership of the app and of users' own content;
- the health disclaimer, which matters most for a fitness app;
- the coach–client relationship;
- Arcwell Plus billing through Google Play;
- extra terms for coaches (data duties and Razorpay billing);
- liability limits and Indian law.

Google Play doesn't require an EULA, but having one protects us. Apple's standard EULA would only matter for iOS, which isn't in v1.

**If "EU" meant the European Union:** GDPR applies to anyone in the EU. Arcwell is India-first and Android-only, so the simplest path is to make the app available only in India in the Play Console at launch. Then GDPR doesn't arise until we choose to expand.

**To do:**

- [ ] Fill in the city for disputes (`courtsCity`) and the company details.
- [ ] Lawyer review, especially the liability cap, the coach indemnity and the Enhanced (PED) wording.

### 3. A privacy policy, in the app and on the website: applies, and is required (`privacy`)

Google Play requires a privacy policy for any app that handles personal data, and health apps are checked more closely. It must be:

- at a public web address that isn't a PDF and isn't geo-blocked, entered in the Play Console;
- reachable inside the app.

Both are now covered:

- The `/legal/privacy` page in the app is bundled static content.
- `app/public/legal/privacy.html` is ready to host.

Apple has the same rule, but iOS isn't in v1.

**To do:**

- [ ] Host `app/public/legal/` at the final domain, for example `https://arcwell.app/legal/privacy.html`. The invite-link domain is still an open item. The Expo web build also serves these files.
- [ ] In the Play Console:
  - the privacy policy URL;
  - the **account deletion URL** (`delete-account.html`; Play requires a web page for apps with accounts);
  - the **Data safety** form, which must match the "What we collect" and "Who can see your data" sections;
  - the **Health apps** declaration.
- [ ] Confirm Groq's data terms: whether it keeps or trains on requests. The policy promises *we* don't train on health data. This was already an open item in DECISIONS.md.
- [ ] Confirm the retention times proposed in the policy: 30 days from live systems and 90 days from backups after deletion. Then build the deletion job to match.
- [ ] Decide how a user names a nominee (DPDP). The policy says "email us" for now.

## Found while drafting

- **Minimum age raised to 18.** Onboarding allowed ages from 13. Under the DPDP Act, anyone under 18 is a child, so we'd need verifiable consent from a parent, and we couldn't monitor their behaviour (which tracking does). The age picker now starts at 18, and the consent boxes say "I'm 18 or older". If teen athletes matter, that needs a parental-consent flow first.
- **Consent wording now links to real pages.** Three screens said "I agree to the Terms and Privacy Policy" with nothing behind them:
  - Save your plan;
  - the invite join screen;
  - the coach agreement.

  Each now has links under the tick box. Athlete Help, Privacy and permissions, and coach Help list all three policies.
- **Existing consent records.** `POLICY_VERSION` (`lib/supabase.ts`) is `2026-11` and matches `LEGAL_VERSION`. Bump both when the text changes in a way that needs fresh consent.

## Details still to fill in (`OPERATOR` in docs.ts)

`npm run legal:check` lists these:

- `legalName`: the registered company name;
- `address`: the registered office;
- `grievanceOfficer`: a named person in India, required by the IT Rules;
- `courtsCity`: the city for disputes.

Also confirm the `support@`, `privacy@` and `copyright@` addresses exist.
