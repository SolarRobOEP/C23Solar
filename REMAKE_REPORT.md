# Remake report — C23 Solar site

**Status: not complete as a faithful remake.** The reference page could not be opened from this session, so it was never inspected. What exists is a C23 Solar lead-generation site modelled on what web search showed of the reference plus the standard layout for this kind of site.

An earlier version of this report declared the remake complete. That was wrong: a remake cannot be signed off against a page that was never seen.

To finish it, one of these is needed:

- `www.projectsolaruk.com` allowed in this session's network settings, or
- full-page screenshots of the reference (desktop and phone).

Even then, the result will follow the reference's layout and flow with C23 Solar's own words, images and branding. It will not be a pixel-for-pixel copy of another company's site.

Reference: the Project Solar UK homepage (`www.projectsolaruk.com`).
Result: `index.html`, `styles.css`, `main.js`, `assets/` on branch `claude/award-winning-website-h8afnt`.

## How the reference was studied

The session's network blocks the reference site and the request to allow it was declined, so the page was never loaded. Its content was read through web search results only:

- The homepage is built around a "Get My Free Quote" button and a phone line.
- The quote form starts with postcode and whether you own your home; an adviser then follows up.
- It promotes average savings and payback figures, finance plans, and battery storage alongside panels.
- Its FAQ limits installs to homeowners; other pages cover about us, locations, blog and contact.

The visual design of the reference (colours, imagery, exact section order) was not seen and is not reproduced.

## What was remade for C23 Solar

| Reference feature | C23 Solar version |
| --- | --- |
| Phone line and free-quote button throughout | Teal top bar with 07525 743786, "Get my free quote" in the nav, hero, calculator, closing band and a fixed bar on phones |
| Quote form starting with postcode and ownership | Three-step form: postcode, ownership and property type; interest and monthly bill; name, phone and email |
| Savings message | Interactive savings calculator in pounds, with every assumption printed beneath it |
| Solar panels and battery storage | Product cards for solar panels, battery storage and solar for business |
| How the process works | Four steps from free quote to switch-on |
| About us | "About C23 Solar" section |
| FAQs, including who is eligible | Seven questions, including who can get solar from C23 Solar |
| Footer with contact details | Logo lockup, links, phone, email and website |

## Deliberately not copied

- Their wording, images, logo, colours and product names.
- Their savings and payback figures, review scores and "largest installer" claim, which are theirs and would be false for C23 Solar.
- Finance offers and the regulatory footer. Advertising credit needs FCA authorisation, so nothing about finance appears.
- EV chargers, locations pages and a blog, because it is not known whether C23 Solar offers or wants them.

## Checks run

Headless Chromium at 1440×900 and 390×844:

- No script errors and no sideways scrolling at either size.
- Quote form: blocks an empty step, rejects an invalid postcode, advances through all three steps, and validates contact details.
- Calculator: 10 south-facing panels with a battery gives 4,133 kWh and £899 a year, matching a hand calculation from the stated assumptions.

Not tested: other browsers, a live host, or the final step actually sending an email (it opens the visitor's email app).

## Needs the owner before launch

1. Confirm `enquiries@c23solar.co.uk` is live, or choose a form backend so enquiries send from the site.
2. Confirm or replace the calculator assumptions (25p/kWh bought, 12p/kWh exported, 950 kWh per kWp, 40% or 75% used at home).
3. Review all copy and FAQ answers; they are drafts and read as claims by the business.
4. Supply real reviews, accreditations and installation photos; none are invented here.
5. Say whether EV chargers, finance, area pages or a blog should be added.

## Sources

- https://www.projectsolaruk.com/
- https://www.projectsolaruk.com/solar-battery-storage/
- https://www.projectsolaruk.com/about-us/
- https://www.projectsolaruk.com/locations/
- https://www.projectsolaruk.com/contact-us/
- https://fmb.org.uk/homepicks/solar-panels/project-solar-solar-panels-review
- https://uk.trustpilot.com/review/projectsolaruk.com
