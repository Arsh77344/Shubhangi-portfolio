#!/usr/bin/env python3
"""Builds index.html (one self-contained file) from the files in /src.

    python3 build.py            # writes index.html next to this script

Only the standard library is needed. Edit things in /src, run this, commit.
"""
import base64, os, re, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
sys.path.insert(0, SRC)
import journal, certs
from pages import PAGES

ARROW_L = '<svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true"><path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor"/></svg>'
CRUMB = {'Floor 4, Luminate Education Group':'Experience · Luminate','Floor 3, University of Leeds':'Education · University of Leeds','Floor 2, Infosys':'Experience · Infosys','The street, community work':'Beyond the day job','The street, independent work':'Beyond the day job'}
NEXTL = {'Floor below':'Next','Out on the street':'Next','Next on the street':'Next','Back to the start of the street':'Next'}
FIX = {'This is the role the whole floor was building towards':'This is the role the last two years were building towards'}
for p in PAGES:
    for a, z in FIX.items():
        p['story'] = p['story'].replace(a, z)
    p['crumb'] = CRUMB.get(p['crumb'], p['crumb'])
    p['kicker'] = p['kicker'].replace('Floor 3, ', '')
    n = p['next']; p['next'] = (n[0], NEXTL.get(n[1], n[1]), n[2])
    p['gallery'] = [(k, c.replace(' g-tall', ''), cap) for k, c, cap in p['gallery']]

ALT={'badge':'Delegate badge for ST Alphe UK 2025 beside University Centre Leeds and Leeds Conservatoire flyers','hellostudy':'Shubhangi with a recruitment partner at an education fair','delegation':'Education partners at a University Centre Leeds event','stall':'Shubhangi talking with prospective students at a Leeds Conservatoire stand','rhateam':'Robin Hood Army volunteers in green shirts posing as a group','vaccine':'Shubhangi in a mask and gloves at a vaccination camp registration desk','rhacert':'Robin Hood Army volunteers holding certificates at an outdoor event','feeding':'Shubhangi feeding a child at a food drive'}
def page_html(p):
    o=[f'<article class="page" data-page="{p["slug"]}" data-lenis-prevent aria-labelledby="pg-{p["slug"]}">',
       f'<div class="page__bar"><button type="button" class="page__back" data-close>{ARROW_L} Back to the portfolio</button><span class="page__crumb">{p["crumb"]}</span></div>',
       f'<header class="page__hero"><div class="wrap"><div><p class="eyebrow">{p["kicker"]}</p><h1 id="pg-{p["slug"]}">{p["title"]}</h1></div>',
       '<ul class="page__meta">'+''.join(f'<li><span>{a}</span><span>{b}</span></li>' for a,b in p['meta'])+'</ul></div></header>',
       '<div class="page__body"><div class="wrap">',
       f'<div class="page__cols"><h2>The story</h2><div><p class="lede">{p["lede"]}</p><p class="soft">{p["story"]}</p></div></div>']
    if p['stats']: o.append('<ul class="page__stats">'+''.join(f'<li><strong>{a}</strong><span>{b}</span></li>' for a,b in p['stats'])+'</ul>')
    if p.get('quote'): o.append(f'<p class="page__quote">“{p["quote"]}”</p>')
    body='<ul class="page__list">'+''.join(f'<li>{d}</li>' for d in p['did'])+'</ul>'
    if p.get('diagram'):
        body+=('<div style="margin-top:34px"><p class="eyebrow">The design</p><div class="diagram" role="table" aria-label="Experiment design">'
               '<div class="diagram__r" role="row"><div class="h" role="columnheader"></div><div class="h" role="columnheader">Emotional appeal</div><div class="h" role="columnheader">Rational appeal</div></div>'
               '<div class="diagram__r" role="row"><div class="h" role="rowheader">Local NGO</div><div role="cell">Group A</div><div role="cell">Group B</div></div>'
               '<div class="diagram__r" role="row"><div class="h" role="rowheader">Global NGO</div><div role="cell">Group C</div><div role="cell">Group D</div></div></div></div>')
    if p.get('clients'): o.append(f'<p class="page__clients"><span>Clients</span>{p["clients"]}</p>')
    o.append(f'<div class="page__cols"><h2>What I did</h2><div>{body}</div></div>')
    if p['gallery']:
        o.append('<div class="page__gallery">'+''.join(f'<figure class="{c}"><img data-img="{k}" alt="{ALT[k]}" loading="lazy"><figcaption>{cap}</figcaption></figure>' for k,c,cap in p['gallery'])+'</div>')
    n=p['next']
    o.append(f'<nav class="page__next" aria-label="More"><button type="button" class="page__back" data-close>{ARROW_L} Back to the portfolio</button><a href="#{n[0]}"><small>{n[1]}</small><b>{n[2]}</b></a></nav></div></div></article>')
    return '\n'.join(o)
USED=set()
import hashlib, shutil

def webp_size(path):
    """Width and height of a WebP, with nothing but the standard library.

    Every <img> needs these on the tag. Without them a lazily loaded picture
    occupies no space until it arrives, the page grows under the reader, and
    the browser's scroll anchoring quietly moves the scroll position to
    compensate -- which is felt as the page refusing to stop where you
    stopped it."""
    with open(path, 'rb') as f:
        b = f.read(40)
    if b[:4] != b'RIFF' or b[8:12] != b'WEBP':
        return None
    tag = b[12:16]
    if tag == b'VP8X':
        w = int.from_bytes(b[24:27], 'little') + 1
        h = int.from_bytes(b[27:30], 'little') + 1
        return w, h
    if tag == b'VP8 ':
        if b[23:26] != b'\x9d\x01\x2a':
            return None
        w = int.from_bytes(b[26:28], 'little') & 0x3fff
        h = int.from_bytes(b[28:30], 'little') & 0x3fff
        return w, h
    if tag == b'VP8L':
        if b[20] != 0x2f:
            return None
        n = int.from_bytes(b[21:25], 'little')
        return (n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1
    return None

SIZES = {}
def img_size(name):
    if name not in SIZES:
        SIZES[name] = webp_size(os.path.join(SRC, 'images', name + '.webp'))
    return SIZES[name]

def add_dimensions(html):
    """Puts width and height on every <img> that does not carry them."""
    def fix(m):
        tag = m.group(0)
        if 'width=' in tag:
            return tag
        key = None
        for pat in (r'data-key="(\w+)"', r'data-img="(\w+)"', r'src="assets/(\w+)\.webp'):
            k = re.search(pat, tag)
            if k:
                key = k.group(1); break
        if not key:
            return tag
        wh = img_size(key)
        if not wh:
            return tag
        return tag[:-1].rstrip() + f' width="{wh[0]}" height="{wh[1]}">'
    return re.sub(r'<img\b[^>]*>', fix, html)

ASSETS = os.path.join(ROOT, 'assets')
def b64(n):
    """Returns the served path of an image, not its bytes.

    These used to be inlined as base64, which made index.html 4.9 MB: the
    browser had to download and parse every photograph before it could paint
    a single word. As files they load in parallel, lazily, and stay cached
    between visits. The hash retires an old copy when an image is replaced."""
    USED.add(n)
    with open(os.path.join(SRC,'images',n+'.webp'),'rb') as f:
        h = hashlib.sha1(f.read()).hexdigest()[:8]
    return 'assets/'+n+'.webp?v='+h
body=open(os.path.join(SRC,'body.html'),encoding='utf-8').read().replace('{{PAGES}}','\n'.join(page_html(p) for p in PAGES))
body=body.replace('{{JOURNAL}}',journal.journal_pages()).replace('{{JTEASER}}',journal.teaser())
body=body.replace('{{CERTS}}',certs.certs_html())
body='<style>:root{--ren:url('+b64('renaissance_bg')+');--col:url('+b64('columns_bg')+')}</style>\n'+body
body=re.sub(r'\{\{IMG:(\w+)\}\}',lambda m:b64(m.group(1)),body)
css=open(os.path.join(SRC,'style.css'),encoding='utf-8').read(); js=open(os.path.join(SRC,'app.js'),encoding='utf-8').read()
head='''<!doctype html>
<html lang="en-GB" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Shubhangi Gupta &mdash; International Growth, Sales &amp; Partnerships</title>
<meta name="description" content="Recruitment Manager for South Asia at Luminate Education Group. Eight years building partner networks, pipelines and new markets across India and the UK.">
<link rel="canonical" href="https://shubhangigupta.com/">
<meta name="author" content="Shubhangi Gupta">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="theme-color" content="#FBF8F2">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Shubhangi Gupta">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="https://shubhangigupta.com/">
<meta property="og:title" content="Shubhangi Gupta &mdash; International Growth, Sales &amp; Partnerships">
<meta property="og:description" content="Partner networks, pipelines and new markets. Eight years across India and the UK, now leading recruitment for South Asia.">
<meta property="og:image" content="https://shubhangigupta.com/og-card.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Shubhangi Gupta, international growth, sales and partnerships">
<meta property="profile:first_name" content="Shubhangi">
<meta property="profile:last_name" content="Gupta">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Shubhangi Gupta &mdash; International Growth, Sales &amp; Partnerships">
<meta name="twitter:description" content="Partner networks, pipelines and new markets. Eight years across India and the UK, now leading recruitment for South Asia.">
<meta name="twitter:image" content="https://shubhangigupta.com/og-card.png">
<meta name="twitter:image:alt" content="Shubhangi Gupta, international growth, sales and partnerships">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect width=%2264%22 height=%2264%22 fill=%22%23FBF8F2%22/><text x=%2232%22 y=%2243%22 font-family=%22Georgia%22 font-style=%22italic%22 font-size=%2230%22 fill=%22%235C1230%22 text-anchor=%22middle%22>SG</text></svg>">
<link rel="apple-touch-icon" href="https://shubhangigupta.com/og-card.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@400..800&display=swap" rel="stylesheet">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite","@id":"https://shubhangigupta.com/#website","url":"https://shubhangigupta.com/","name":"Shubhangi Gupta","inLanguage":"en-GB","publisher":{"@id":"https://shubhangigupta.com/#person"}},{"@type":"ProfilePage","@id":"https://shubhangigupta.com/#page","url":"https://shubhangigupta.com/","name":"Shubhangi Gupta, international growth, sales and partnerships","isPartOf":{"@id":"https://shubhangigupta.com/#website"},"about":{"@id":"https://shubhangigupta.com/#person"},"primaryImageOfPage":{"@id":"https://shubhangigupta.com/#card"},"inLanguage":"en-GB"},{"@type":"ImageObject","@id":"https://shubhangigupta.com/#card","url":"https://shubhangigupta.com/og-card.png","width":1200,"height":630},{"@type":"Person","@id":"https://shubhangigupta.com/#person","name":"Shubhangi Gupta","url":"https://shubhangigupta.com/","image":{"@id":"https://shubhangigupta.com/#card"},"jobTitle":"Recruitment Manager, South Asia","description":"Recruitment Manager for South Asia at Luminate Education Group. Eight years building partner networks, pipelines and new markets across India and the UK.","email":"mailto:guptashubhangi.work@gmail.com","worksFor":{"@type":"Organization","name":"Luminate Education Group","url":"https://luminate.ac.uk"},"homeLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressLocality":"Lucknow","addressRegion":"Uttar Pradesh","addressCountry":"IN"}},"alumniOf":[{"@type":"CollegeOrUniversity","name":"University of Leeds","url":"https://www.leeds.ac.uk"},{"@type":"CollegeOrUniversity","name":"SRM Institute of Science and Technology","url":"https://www.srmup.in"}],"knowsAbout":["International student recruitment","Market entry strategy","Strategic partnerships","Stakeholder management","Change management","B2B sales","Project delivery","Higher education marketing"],"knowsLanguage":["en","hi"],"sameAs":["https://www.linkedin.com/in/shubhangigupta097"]}]}</script>
<style>
'''+css+'''
@media (max-width:980px){.hdr__nav a:not(.hdr__cta){display:none}}
</style>
</head>
<body>
'''
tail='''
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script>
'''+js+'''
</script>
</body>
</html>
'''
body=add_dimensions(body)
out=head+body+tail
with open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8') as f: f.write(out)

# the images the page actually asks for, plus the world outline the globe
# fetches once the journey section comes close
os.makedirs(ASSETS, exist_ok=True)
want = {n+'.webp' for n in USED} | {'land-110m.json'}
for n in sorted(USED):
    shutil.copyfile(os.path.join(SRC,'images',n+'.webp'), os.path.join(ASSETS,n+'.webp'))
shutil.copyfile(os.path.join(SRC,'data','land-110m.json'), os.path.join(ASSETS,'land-110m.json'))
for f in os.listdir(ASSETS):                      # drop anything no longer used
    if f not in want: os.remove(os.path.join(ASSETS,f))
# the share card, robots and the sitemap live at the root, where crawlers
# and the social scrapers expect to find them
shutil.copyfile(os.path.join(SRC,'images','og_card.png'), os.path.join(ROOT,'og-card.png'))
with open(os.path.join(ROOT,'robots.txt'),'w',encoding='utf-8') as f:
    f.write('User-agent: *\nAllow: /\n\nSitemap: https://shubhangigupta.com/sitemap.xml\n')
import datetime
stamp = datetime.date.today().isoformat()
with open(os.path.join(ROOT,'sitemap.xml'),'w',encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            '  <url>\n    <loc>https://shubhangigupta.com/</loc>\n'
            f'    <lastmod>{stamp}</lastmod>\n'
            '    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n'
            '</urlset>\n')

kb = sum(os.path.getsize(os.path.join(ASSETS,f)) for f in os.listdir(ASSETS))//1024
print('index.html written,',len(out.encode())//1024,'KB;',len(USED),'images in assets/ (',kb,'KB)')
if '--list-images' in sys.argv: print(sorted(USED))
