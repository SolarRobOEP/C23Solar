# C23 Solar

Marketing and lead-generation site for C23 Solar. Static — no build step: open `index.html` or serve the folder.

- `index.html` — content
- `styles.css` — design
- `main.js` — three-step quote form and savings calculator
- `assets/` — logo SVGs converted from the brand EPS artwork
- `assets/photos/` — installation photos from the OEP SharePoint folder `OEP-Solar / 10. Branding_OK / Images for Mollie / Domestic`, resized with metadata removed

Before launch:

- Confirm the enquiries address (`data-email` on the quote form in `index.html`). The form currently opens the visitor's email app; swap in a form backend when hosting is chosen.
- Review the draft copy and the calculator assumptions (constants at the top of the calculator block in `main.js`, mirrored in the small print under it).
- Add real accreditations and reviews, and a battery installation photo (the battery card still uses a drawing).

The earlier scroll-driven "day of sunlight" design is in the git history.
