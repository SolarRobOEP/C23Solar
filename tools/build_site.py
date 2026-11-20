#!/usr/bin/env python3
"""Build the local-area pages, sitemap, 404 page and structured data for c23solar.co.uk.

index.html is the master copy: its header, footer, mobile bar and quote form are
copied into every generated page, so edit them there and re-run:

    python3 tools/build_site.py

Generated: solar-panels-<area>/index.html, 404.html, sitemap.xml, and the
blocks between the <!-- AREAS -->, <!-- FOOTAREAS --> and <!-- SCHEMA --> markers in index.html.
"""
import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.c23solar.co.uk"
PHONE = "07525 743786"
PHONE_INTL = "+447525743786"
EMAIL = "rob@c23solar.co.uk"
TODAY = date.today().isoformat()

# Each area: what makes solar there different, in plain words. Keep claims to things
# that are true of the area in general; nothing here states numbers of installs or reviews.
AREAS = [
    {
        "slug": "liverpool", "name": "Liverpool", "kind": "City",
        "council": "Liverpool City Council",
        "towns": ["Allerton", "Woolton", "Aigburth", "Childwall", "West Derby", "Crosby", "Walton", "Garston"],
        "photo": ("install-clay-tiles.jpg", "Solar panels on an orange clay-tiled roof under a blue sky", 1200, 702),
        "intro": "From Victorian terraces to post-war semis and newer estates, Liverpool homes come with every shape of roof. We survey yours in person, then design a solar and battery system around how your household actually uses electricity.",
        "points": [
            ("Terraced and semi-detached roofs", "A smaller roof can still carry a worthwhile system. We plan the layout around chimneys, dormers and roof windows so you get the most from the space you have."),
            ("Conservation areas and listed buildings", "Liverpool has many conservation areas. Panels on a listed building, or on a front roof slope in some conservation areas, can need planning permission, so we check before we design anything."),
            ("Evenings on your own power", "Most homes use the most electricity after work and school. A battery stores the midday surplus so your evenings run on what your roof made."),
        ],
    },
    {
        "slug": "wirral", "name": "Wirral", "kind": "AdministrativeArea",
        "council": "Wirral Council",
        "towns": ["Birkenhead", "Wallasey", "Heswall", "West Kirby", "Hoylake", "Bebington", "Moreton", "Neston"],
        "photo": ("install-large-roof.jpg", "Three arrays of solar panels across a large slate-grey roof", 1200, 675),
        "intro": "Across the peninsula, from Wallasey and Birkenhead to Heswall and West Kirby, we fit solar panels and batteries to homes of every age. Every system starts with a proper survey of your roof.",
        "points": [
            ("Coastal and exposed roofs", "Homes near the coast see stronger winds and salty air. We choose mounting and fixings for exposed roofs and check the roof structure during the survey."),
            ("Room for bigger systems", "Many Wirral homes have space across more than one roof face. Splitting panels east and west spreads generation across the day, which suits busy households."),
            ("Conservation villages", "Places such as Port Sunlight are conservation areas, where panels can need planning permission. We check with you before quoting."),
        ],
    },
    {
        "slug": "cheshire", "name": "Cheshire", "kind": "AdministrativeArea",
        "council": "Cheshire West and Chester Council or Cheshire East Council",
        "towns": ["Chester", "Ellesmere Port", "Northwich", "Frodsham", "Runcorn", "Knutsford", "Winsford", "Crewe"],
        "photo": ("install-barn.jpg", "Rows of solar panels along the roof of a green agricultural building", 1200, 1120),
        "intro": "From Chester and Ellesmere Port to the villages and farms in between, we install solar for family homes, rural properties and businesses across Cheshire.",
        "points": [
            ("Farms, barns and outbuildings", "Agricultural buildings, stables and workshops can carry large arrays. Where a roof isn't suitable, a ground-mounted system may be an option."),
            ("Historic towns and villages", "Chester's historic centre and many village centres are conservation areas. We advise on planning before we quote, so there are no surprises later."),
            ("Time-of-use tariffs", "On a tariff with cheaper overnight electricity, a battery can top up from the grid at night as well as from your panels during the day."),
        ],
    },
    {
        "slug": "widnes", "name": "Widnes", "kind": "City",
        "council": "Halton Borough Council",
        "towns": ["Ditton", "Hough Green", "Farnworth", "Appleton", "Upton", "Hale", "Halebank", "Runcorn"],
        "photo": ("install-blue-sky.jpg", "Solar panels fitted to a tiled house roof under a clear blue sky", 1400, 1157),
        "intro": "We install solar panels and battery storage for homes and businesses in Widnes and across Halton, with a free survey and a fixed, itemised quote.",
        "points": [
            ("Newer estates", "Many homes on Widnes estates have uncluttered roofs that suit a neat, low-profile array. All-black panels are available if you prefer a cleaner look against dark tiles."),
            ("Business units", "Industrial and business units can use solar to cover daytime demand, which is when most of their electricity is used."),
            ("Batteries for existing panels", "Already have panels? We can add a battery to most existing systems so you keep more of what they make."),
        ],
    },
    {
        "slug": "manchester", "name": "Manchester", "kind": "City",
        "council": "Manchester City Council or your local Greater Manchester council",
        "towns": ["Didsbury", "Chorlton", "Sale", "Stretford", "Salford", "Stockport", "Altrincham", "Prestwich"],
        "photo": ("install-rooflights.jpg", "Solar panels arranged around three roof windows", 1200, 900),
        "intro": "From red-brick terraces in Chorlton to family homes in Sale and Stockport, we design and install solar and battery systems across Greater Manchester.",
        "points": [
            ("Red-brick terraces", "Terraced roofs are often narrow, but a well-planned array still makes a real difference. We work around chimneys, vents and roof windows."),
            ("Flats and shared roofs", "If you live in a flat, the roof is usually shared or owned by a freeholder, so their permission is needed. We'll tell you early whether it's possible."),
            ("Charging an electric car", "If you drive electric, pairing solar with a home charger lets you top up from your own roof on days the car is at home."),
        ],
    },
    {
        "slug": "st-helens", "name": "St Helens", "kind": "City",
        "council": "St Helens Borough Council",
        "towns": ["Rainhill", "Eccleston", "Haydock", "Newton-le-Willows", "Billinge", "Thatto Heath", "Sutton", "Clock Face"],
        "photo": ("install-red-roof.jpg", "Solar panels on a red clay-tiled house roof on a sunny day", 1200, 1302),
        "intro": "We install solar panels and batteries for homes and businesses across St Helens, from Rainhill and Eccleston to Haydock and Newton-le-Willows.",
        "points": [
            ("Family semis and detached homes", "Typical St Helens semis have a good-sized rear or side roof. We position panels on the slope that gives the best year-round output."),
            ("Bungalows", "Bungalows often have large single-storey roofs that are straightforward to work on, which suits a larger array."),
            ("Warehouses and commercial roofs", "Commercial and industrial roofs around Haydock and the M6 corridor can offset a business's daytime electricity use."),
        ],
    },
    {
        "slug": "north-wales", "name": "North Wales", "kind": "AdministrativeArea",
        "council": "your local council (such as Flintshire, Wrexham, Denbighshire or Conwy)",
        "towns": ["Wrexham", "Mold", "Flint", "Deeside", "Rhyl", "Prestatyn", "Llandudno", "Colwyn Bay"],
        "photo": ("install-slate.jpg", "All-black solar panels on a natural slate roof", 1200, 1142),
        "intro": "From Deeside and Wrexham to the coast at Rhyl and Llandudno, we install solar panels and battery storage on North Wales homes, including natural slate roofs.",
        "points": [
            ("Natural slate roofs", "Slate needs the right hooks and careful handling. We fit to slate properly and replace any slate that's disturbed during installation."),
            ("Protected landscapes", "Homes in or near Eryri National Park, the Clwydian Range and Dee Valley National Landscape, or a conservation area may need planning permission. We check first."),
            ("Homes off the gas grid", "In rural homes heated by electricity or a heat pump, solar and a battery can take a real chunk out of running costs."),
        ],
    },
    {
        "slug": "warrington", "name": "Warrington", "kind": "City",
        "council": "Warrington Borough Council",
        "towns": ["Great Sankey", "Penketh", "Lymm", "Stockton Heath", "Birchwood", "Culcheth", "Appleton", "Padgate"],
        "photo": ("install-grey-tiles.jpg", "Six solar panels on a grey concrete-tiled roof", 1200, 896),
        "intro": "We install solar panels and batteries across Warrington, from new-build estates in Great Sankey to larger homes in Lymm, Appleton and Stockton Heath.",
        "points": [
            ("New-build homes", "Newer homes often have clean roofs with few obstructions, which makes for a tidy, efficient array."),
            ("Larger homes, higher usage", "Bigger households with higher bills usually benefit most from a larger array paired with a battery."),
            ("Business parks", "Commercial roofs on business parks such as Birchwood can cover daytime demand with solar."),
        ],
    },
]
BY_SLUG = {a["slug"]: a for a in AREAS}


def esc(s):
    return html.escape(s, quote=True)


def town_list(towns):
    return ", ".join(towns[:-1]) + " and " + towns[-1]


def between(text, start, end):
    i = text.index(start)
    j = text.index(end, i) + len(end)
    return text[i:j]


def relink(chunk, prefix):
    """Point the home page's relative links at the right place from another folder."""
    chunk = re.sub(r'(href|src)="(?!https?:|mailto:|tel:|/|\.\./)', lambda m: f'{m.group(1)}="{prefix}', chunk)
    return chunk.replace(f'href="{prefix}#', f'href="{prefix}#')


def replace_block(text, name, content):
    pattern = re.compile(rf"<!-- {name}:START -->.*?<!-- {name}:END -->", re.S)
    assert pattern.search(text), f"marker {name} missing from index.html"
    return pattern.sub(lambda _: f"<!-- {name}:START -->{content}<!-- {name}:END -->", text)


# ---------- home page blocks ----------

def areas_section():
    cards = "\n".join(
        f'          <a class="area" href="solar-panels-{a["slug"]}/"><b>{esc(a["name"])}</b>'
        f'<span>{esc(", ".join(a["towns"][:4]))} and nearby</span><em>Solar in {esc(a["name"])} →</em></a>'
        for a in AREAS)
    return f'''
    <section class="section section--tint" id="areas">
      <div class="wrap">
        <header class="head reveal">
          <p class="tag">Areas we cover</p>
          <h2>Solar installers across Merseyside, Cheshire, Manchester and North Wales.</h2>
          <p>We survey and install across the North West and North Wales. Choose your area for local details, or get a free quote and we’ll confirm we cover your postcode.</p>
        </header>
        <div class="areas reveal">
{cards}
        </div>
      </div>
    </section>
    '''


def footer_areas(prefix):
    links = "".join(f'<a href="{prefix}solar-panels-{a["slug"]}/">Solar panels {esc(a["name"])}</a>' for a in AREAS)
    return f'\n      <nav aria-label="Areas">\n        <h3>Areas</h3>\n        {links}\n      </nav>\n      '


def business_schema():
    area_served = [{"@type": a["kind"], "name": a["name"]} for a in AREAS]
    return {
        "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
        "@id": f"{SITE}/#business",
        "name": "C23 Solar",
        "legalName": "C23 Solar Limited",
        "slogan": "Be part of the future",
        "description": "Solar panel and battery storage installation for homes and businesses across Merseyside, Cheshire, Greater Manchester and North Wales.",
        "url": f"{SITE}/",
        "logo": f"{SITE}/assets/icons/icon-512.png",
        "image": f"{SITE}/assets/og-image.jpg",
        "telephone": PHONE_INTL,
        "email": EMAIL,
        "address": {"@type": "PostalAddress", "addressLocality": "Liverpool", "addressRegion": "Merseyside", "addressCountry": "GB"},
        "areaServed": area_served,
        "knowsAbout": ["Solar panel installation", "Solar battery storage", "Solar PV", "EV charger installation", "Commercial solar"],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Solar and battery installation",
            "itemListElement": [
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n}}
                for n in ["Solar panel installation", "Solar battery storage", "Battery retrofit for existing solar", "Commercial solar installation", "EV charger with solar"]
            ],
        },
    }


def faq_schema(page_html):
    items = re.findall(r"<details[^>]*><summary>(.*?)</summary><p>(.*?)</p></details>", page_html, re.S)
    clean = lambda s: html.unescape(re.sub(r"<[^>]+>", "", s)).strip()
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": clean(q), "acceptedAnswer": {"@type": "Answer", "text": clean(a)}} for q, a in items]}


def schema_tag(graph):
    data = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=1)
    return f'\n  <script type="application/ld+json">\n{data}\n  </script>\n  '


# ---------- area pages ----------

def area_page(a, shared):
    name, slug = a["name"], a["slug"]
    url = f"{SITE}/solar-panels-{slug}/"
    towns = town_list(a["towns"])
    photo, alt, w, h = a["photo"]
    title = f"Solar Panels {name} | Solar &amp; Battery Installers | C23 Solar"
    desc = f"Solar panels and battery storage in {name}, including {', '.join(a['towns'][:3])}. Free survey and a fixed, itemised quote. Call {PHONE}."
    others = "".join(
        f'<a class="area" href="../solar-panels-{o["slug"]}/"><b>{esc(o["name"])}</b><span>{esc(", ".join(o["towns"][:3]))}</span></a>'
        for o in AREAS if o is not a)
    points = "".join(f'<article class="point reveal"><h3>{esc(t)}</h3><p>{esc(p)}</p></article>' for t, p in a["points"])
    faqs = [
        (f"Do you install solar panels across {name}?",
         f"Yes. We survey and install across {name}, including {towns}. Send a free quote request with your postcode and we’ll confirm the details."),
        (f"Do I need planning permission for solar panels in {name}?",
         f"Most homes don’t, because roof-mounted panels usually count as permitted development. Listed buildings, some conservation areas and some flat roofs are exceptions, and those are decided by {a['council']}. We check this for you as part of the survey."),
        ("How long does installation take?",
         "Most home installations are completed in one or two days once scaffolding is up. We agree the dates with you in advance and handle the grid notification."),
        ("Can I add a battery to panels I already have?",
         "In most cases, yes. We look at your existing inverter and system during the survey and recommend a battery that works with it."),
    ]
    faq_html = "".join(f"<details{' open' if i == 0 else ''}><summary>{esc(q)}</summary><p>{esc(ans)}</p></details>" for i, (q, ans) in enumerate(faqs))
    graph = [
        {"@type": "Service", "@id": f"{url}#service", "name": f"Solar panel installation in {name}",
         "serviceType": "Solar panel and battery storage installation", "url": url,
         "provider": {"@id": f"{SITE}/#business"},
         "areaServed": [{"@type": a["kind"], "name": name}] + [{"@type": "Place", "name": t} for t in a["towns"]]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Areas we cover", "item": f"{SITE}/#areas"},
            {"@type": "ListItem", "position": 3, "name": f"Solar panels {name}", "item": url}]},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": ans}} for q, ans in faqs]},
        business_schema(),
    ]
    return f'''<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{esc(desc)}">
  <link rel="canonical" href="{url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#181818">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="C23 Solar">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="Solar Panels &amp; Battery Storage in {esc(name)} | C23 Solar">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:image" content="{SITE}/assets/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <script>document.documentElement.classList.add('js')</script>{schema_tag(graph)}
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>

  {shared["header"]}

  <main id="main">
    <section class="hero" id="top">
      <div class="hero__ring" aria-hidden="true"></div>
      <div class="wrap hero__grid">
        <div class="hero__copy">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span aria-hidden="true">›</span><a href="../#areas">Areas</a><span aria-hidden="true">›</span><span aria-current="page">{esc(name)}</span></nav>
          <h1><span class="h1-kicker">Solar installers in {esc(name)}</span>Solar panels &amp; battery storage in {esc(name)}.</h1>
          <p class="hero__lede">{esc(a["intro"])}</p>
          <ul class="hero__stats">
            <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M9.5 19.5v-5h5v5"/></svg><span><b>Free home survey</b>On your roof, not on a map</span></li>
            <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6zM8.5 12l2.5 2.5 4.5-5"/></svg><span><b>Fixed, itemised quote</b>No pressure, no obligation</span></li>
          </ul>
          <div class="hero__cta">
            <a class="btn btn--big" href="#contact" data-quote>Get My Free Quote</a>
            <a class="hero__call" href="tel:{PHONE_INTL}">or call <b>{PHONE}</b></a>
          </div>
        </div>
        <figure class="hero__media">
          <img src="../assets/photos/{photo}" fetchpriority="high" alt="{esc(alt)}" width="{w}" height="{h}">
          <figcaption><span class="dot" aria-hidden="true"></span>An installation by our team</figcaption>
        </figure>
      </div>
    </section>

    <section class="towns-band" aria-label="Places we cover">
      <div class="wrap towns-band__inner">
        <b>Covering {esc(name)}, including</b>
        <ul class="towns">{"".join(f"<li>{esc(t)}</li>" for t in a["towns"])}</ul>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <header class="head reveal">
          <p class="tag">Solar in {esc(name)}</p>
          <h2>What to know before you go solar in {esc(name)}.</h2>
        </header>
        <div class="points">{points}</div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="wrap split">
        <div class="split__copy reveal">
          <p class="tag">What we install</p>
          <h2>Solar panels, batteries and EV charging for {esc(name)} homes.</h2>
          <p>Every system is designed after a survey of your roof, wiring and electricity use, then installed on agreed dates with the paperwork and grid notification handled for you.</p>
          <ul class="ticks">
            <li>Solar panels for tiled, slate and steel roofs</li>
            <li>Battery storage, new or added to existing panels</li>
            <li>Home EV chargers alongside your solar</li>
            <li>Commercial and agricultural solar</li>
          </ul>
          <a class="btn" href="../#savings">Work out your savings</a>
        </div>
        <img class="reveal" src="../assets/photos/install-home-evening.jpg" alt="A semi-detached home with all-black solar panels on its roof" loading="lazy" width="1400" height="898">
      </div>
    </section>

    <section class="section">
      <div class="wrap faq">
        <header class="head reveal">
          <p class="tag">FAQs</p>
          <h2>Solar in {esc(name)}: common questions.</h2>
          <p>Something else on your mind? Call <a href="tel:{PHONE_INTL}">{PHONE.replace(" ", "&nbsp;")}</a> and ask.</p>
        </header>
        <div class="faq__list reveal">{faq_html}</div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="wrap">
        <header class="head reveal">
          <p class="tag">Other areas we cover</p>
          <h2>Also installing near {esc(name)}.</h2>
        </header>
        <div class="areas reveal">{others}<a class="area" href="../#areas"><b>All areas</b><span>See everywhere we cover</span></a></div>
      </div>
    </section>

    <section class="cta" id="contact">
      <div class="cta__ring" aria-hidden="true"></div>
      <div class="wrap cta__inner reveal">
        <p class="tag">Be part of the future</p>
        <h2>Get your <span>free</span> solar quote in {esc(name)}.</h2>
        <p>Call <a href="tel:{PHONE_INTL}">{PHONE}</a> or email <a href="mailto:{EMAIL}">{EMAIL}</a></p>
        <a class="btn btn--big" href="mailto:{EMAIL}" data-quote>Get My Free Quote</a>
      </div>
    </section>
  </main>

  {shared["footer"]}

  {shared["mobilebar"]}

  {shared["dialog"]}

  <script src="../main.js" data-root="../" defer></script>
</body>
</html>
'''


def not_found_page(shared):
    return f'''<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found | C23 Solar</title>
  <meta name="robots" content="noindex">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  {shared["header"]}
  <main id="main">
    <section class="cta">
      <div class="cta__ring" aria-hidden="true"></div>
      <div class="wrap cta__inner">
        <p class="tag">Page not found</p>
        <h1>That page has moved or doesn’t exist.</h1>
        <p>Head back to the <a href="/">home page</a> or call <a href="tel:{PHONE_INTL}">{PHONE}</a>.</p>
        <a class="btn btn--big" href="/">Go to the home page</a>
      </div>
    </section>
  </main>
  {shared["footer"]}
  {shared["dialog"]}
  <script src="/main.js" data-root="/" defer></script>
</body>
</html>
'''


PRIVACY_UPDATED = "20 November 2026"


def privacy_page(shared):
    return f'''<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Privacy Notice | C23 Solar</title>
  <meta name="description" content="How C23 Solar collects, uses and protects your personal information when you ask for a quote or become a customer.">
  <link rel="canonical" href="{SITE}/privacy/">
  <meta name="theme-color" content="#181818">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <script>document.documentElement.classList.add('js')</script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>

  {shared["header"]}

  <main id="main">
    <section class="section">
      <div class="wrap legal">
        <nav class="crumbs" aria-label="Breadcrumb" style="color:var(--ink-soft)"><a href="../" style="color:inherit">Home</a><span aria-hidden="true">›</span><span aria-current="page">Privacy notice</span></nav>
        <p class="tag">Privacy</p>
        <h1 style="font-size:clamp(2.2rem,5vw,3.4rem)">Privacy notice</h1>
        <p class="legal__updated">Last updated {PRIVACY_UPDATED}</p>
        <p>This notice explains what personal information C23 Solar collects when you contact us or ask for a quote, what we do with it, and your rights. We keep it short and plain.</p>

        <h2>Who we are</h2>
        <p>C23 Solar Limited (“C23 Solar”, “we”) is responsible for your personal information. You can contact us about anything in this notice by emailing <a href="mailto:{EMAIL}">{EMAIL}</a> or calling <a href="tel:{PHONE_INTL}">{PHONE}</a>.</p>

        <h2>What we collect</h2>
        <ul>
          <li><b>When you request a quote on our website:</b> your name, email address, phone number and postcode, whether you own the property, the type of property, and which page of our site you sent the request from.</li>
          <li><b>When you call, email or message us:</b> the details you give us, such as your address and your electricity usage or bills.</li>
          <li><b>If we survey or install for you:</b> information about your property, roof and electrical system, photos taken during the survey or installation, and the details needed to quote, invoice and register your system.</li>
        </ul>
        <p>We don’t ask for, and don’t want, sensitive information such as health details.</p>

        <h2>How we use it, and why we’re allowed to</h2>
        <ul>
          <li><b>To reply to your enquiry, survey your property and give you a quote.</b> You’ve asked us to do this, so we rely on taking steps at your request before entering into a contract.</li>
          <li><b>To carry out an installation and look after your system afterwards</b>, including warranties and aftercare. This is needed to perform our contract with you.</li>
          <li><b>To follow up on a quote you’ve had from us.</b> We rely on our legitimate interest in following up an enquiry you started. You can tell us to stop at any time.</li>
          <li><b>To meet legal obligations</b>, such as keeping financial records and registering installations where the rules require it.</li>
        </ul>
        <p>We don’t sell your information, and we won’t send you marketing unless you’ve agreed to it.</p>

        <h2>Who we share it with</h2>
        <p>We use a small number of service providers to run our business. They handle your information only to provide their service to us:</p>
        <div class="tablewrap"><table>
          <thead><tr><th scope="col">Provider</th><th scope="col">What they do for us</th></tr></thead>
          <tbody>
            <tr><td>Web3Forms</td><td>Delivers quote requests from our website to our inbox.</td></tr>
            <tr><td>Microsoft (Microsoft 365)</td><td>Our email.</td></tr>
            <tr><td>Anthropic</td><td>Hosts the private tool we use to keep track of enquiries and customers.</td></tr>
            <tr><td>GitHub</td><td>Hosts this website. Like any web host, it handles basic technical information such as your IP address when you visit.</td></tr>
            <tr><td>Google Fonts</td><td>Supplies the typeface used on this website, so your browser connects to Google when pages load.</td></tr>
          </tbody>
        </table></div>
        <p>If you go ahead with an installation, we may also share the necessary details with suppliers, installers and scaffolders working on your job, with your electricity network operator to notify them of the installation, and with certification or warranty bodies where that’s required.</p>
        <p>Some of these providers may process information outside the UK. Where they do, we rely on the safeguards UK law requires, such as the UK’s adequacy regulations or approved contract clauses.</p>

        <h2>How long we keep it</h2>
        <ul>
          <li><b>Enquiries that don’t go ahead:</b> up to 24 months from our last contact, then deleted.</li>
          <li><b>Customers:</b> for as long as needed to provide warranties and aftercare, and at least six years after the work for tax and accounting purposes.</li>
        </ul>

        <h2>Cookies and your device</h2>
        <p>We don’t use advertising or analytics cookies, and we don’t track you across other websites. So that the site loads quickly and can be added to your home screen as an app, your browser keeps a copy of our pages and images on your device. You can clear it at any time in your browser settings.</p>

        <h2>Your rights</h2>
        <p>You can ask us to:</p>
        <ul>
          <li>give you a copy of the information we hold about you;</li>
          <li>correct anything that’s wrong;</li>
          <li>delete your information, or stop or limit how we use it;</li>
          <li>stop following up with you; and</li>
          <li>send your information to you or another organisation in a portable format.</li>
        </ul>
        <p>To use any of these rights, email <a href="mailto:{EMAIL}">{EMAIL}</a>. We’ll reply within one month.</p>

        <h2>Complaints</h2>
        <p>If you’re unhappy with how we’ve handled your information, please tell us first so we can put it right. You can also complain to the Information Commissioner’s Office (ICO) at <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a> or on 0303 123 1113.</p>

        <h2>Changes to this notice</h2>
        <p>We’ll update this page if anything changes, and change the date at the top.</p>
      </div>
    </section>
  </main>

  {shared["footer"]}

  {shared["mobilebar"]}

  {shared["dialog"]}

  <script src="../main.js" data-root="../" defer></script>
</body>
</html>
'''


def sitemap():
    urls = [(f"{SITE}/", "1.0")] + [(f"{SITE}/solar-panels-{a['slug']}/", "0.8") for a in AREAS] + [(f"{SITE}/privacy/", "0.3")]
    body = "".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{p}</priority></url>\n" for u, p in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}</urlset>\n'


def main():
    index_path = ROOT / "index.html"
    page = index_path.read_text()
    page = replace_block(page, "AREAS", areas_section())
    page = replace_block(page, "FOOTAREAS", footer_areas(""))
    page = replace_block(page, "SCHEMA", schema_tag([
        business_schema(),
        {"@type": "WebSite", "@id": f"{SITE}/#website", "url": f"{SITE}/", "name": "C23 Solar", "inLanguage": "en-GB", "publisher": {"@id": f"{SITE}/#business"}},
        faq_schema(page),
    ]))
    index_path.write_text(page)

    raw = {
        "header": between(page, "<!-- Header -->", "</header>"),
        "footer": between(page, '<footer class="footer">', "</footer>"),
        "mobilebar": between(page, '<div class="mobilebar">', "</div>"),
        "dialog": between(page, "<!-- Quote form", "</dialog>"),
    }
    for prefix, build in (("../", lambda s: [(f"solar-panels-{a['slug']}/index.html", area_page(a, s)) for a in AREAS] + [("privacy/index.html", privacy_page(s))]),
                          ("/", lambda s: [("404.html", not_found_page(s))])):
        shared = {k: relink(v, prefix) for k, v in raw.items()}
        for rel, text in build(shared):
            out = ROOT / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(text)
            print("wrote", rel)
    (ROOT / "sitemap.xml").write_text(sitemap())
    print("wrote sitemap.xml")


if __name__ == "__main__":
    main()
