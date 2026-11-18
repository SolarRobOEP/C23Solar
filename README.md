# C23 Solar

Marketing and lead-generation site for C23 Solar. Static — no build step: open `index.html` or serve the folder.

- `index.html` — content
- `styles.css` — design
- `main.js` — pop-up quote form, savings calculator, tabs and section menu
- `manifest.webmanifest`, `sw.js`, `assets/icons/` — make the site installable as an app and usable offline (bump `VERSION` in `sw.js` after changing any file)
- `assets/` — logo SVGs converted from the brand EPS artwork
- `assets/photos/` — installation photos from the OEP SharePoint folder `OEP-Solar / 10. Branding_OK / Images for Mollie / Domestic`, resized with metadata removed

Before launch:

- Confirm the enquiries address (`data-email` on the quote form in `index.html`). The form currently opens the visitor's email app; swap in a form backend when hosting is chosen.
- Review the draft copy and the calculator assumptions (constants at the top of the calculator block in `main.js`, mirrored in the small print under it).
- Add real accreditations and reviews. No battery or inverter photo was found, so the battery card shows a solar-powered home; swap in a battery photo when one exists.
- Picture rule: only C23 Solar logos and OEP/OENW installation photos. Never another company's people, projects, text or logos.

The earlier scroll-driven "day of sunlight" design is in the git history.
