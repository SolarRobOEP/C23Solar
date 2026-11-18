# Remake report — C23 Solar site

**Status: REMAKE COMPLETE for structure and quote flow. Not matched for visual design.**

The live Project Solar UK homepage (`www.projectsolaruk.com`) was loaded and inspected on 18 November 2026. Its section order, navigation and quote flow were rebuilt for C23 Solar. Its styles and images are served from a separate host (`cdn-ilehnmd.nitrocdn.com`) that this session may not reach, so the page was seen unstyled; colours, spacing and imagery were not compared.

Result: `index.html`, `styles.css`, `main.js`, `assets/` on branch `claude/award-winning-website-h8afnt`.

## Section-by-section

| Reference section | C23 Solar version |
| --- | --- |
| Header: logo, Solar menu (reasons, battery), About, Blog, Contact, phone, "Get My Free Quote" | Logo, Solar dropdown (why solar, panels, battery, calculator), Our work, About, FAQs, Contact, phone, "Get My Free Quote" |
| Hero: "Solar + Battery Systems", two stat badges, quote button, review rating, hero image | Same layout: tag, headline, two badges (free home survey; fixed, itemised quote), quote button, phone, OEP installation photo. No review rating (none to show yet) |
| Featured In (press logos) | Replaced by a strip of what C23 installs. No press coverage to show |
| Sticky in-page section menu | Sticky menu: Solar savings, Why solar?, Our work, Warranties, FAQs; highlights the section in view |
| Solar Savings: average saving, bill without vs with solar | Interactive calculator with "bill without solar" and "bill with solar" bars, driven by your monthly bill; assumptions printed |
| EV charger add-on band | "Drive on sunshine" band asking about a home EV charger. No price stated |
| "An easy way to cut your bills": four expandable benefits with an image | Four tabs, each with its own OEP installation photo |
| Customer reviews | Replaced by an "Our work" gallery of OEP installations. Add real reviews when available |
| Financing | Left out: advertising credit needs FCA authorisation |
| "A team you can trust" | About section with four points: surveyed in person, designed for your home, kept informed, ongoing support |
| Warranties: four tiles | Four tiles (panels, inverter, battery, installation). Durations left out until confirmed |
| Customer story (video) | Left out: no C23 customer story yet |
| FAQs (starting with "How do I get started?") | Six FAQs, starting with how to get started and who is eligible |
| Quote form as a pop-up from every quote button: postcode → homeowner → property type (detached, semi, terraced, flat, bungalow) → name, email, phone | Same pop-up and order: postcode → homeowner → property type (plus Business) → first name, last name, email, phone. Answers are emailed to `rob@c23solar.co.uk` through the visitor's email app |

## Not copied

- Project Solar's wording, logo, photos, people, reviews, press logos, prices and savings figures.
- All pictures are C23 Solar logos or OEP installation photos (OEP is owned by C23 Solar's owner).

## Checks run

Headless Chromium at 1440×900 and 390×844: no script errors, no sideways scrolling. Quote pop-up opens, rejects a bad postcode, moves through all four steps, validates contact details and closes. Tabs switch. Calculator: £110/month, 10 south-facing panels with battery gives £899 a year benefit, bill £1,320 → £421, matching a hand calculation.

Not tested: other browsers, a live host, or the email actually sending.

## Needs the owner

1. A form service so enquiries send from the site rather than the visitor's email app.
2. Warranty durations for panels, inverter, battery and workmanship.
3. Whether to offer EV chargers (the band invites questions about them).
4. Real reviews, and whether C23 Solar is MCS-certified (if so, say it in the hero badges).
5. A read-through of all copy.
