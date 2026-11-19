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
               '<div class="h" role="columnheader"></div><div class="h" role="columnheader">Emotional appeal</div><div class="h" role="columnheader">Rational appeal</div>'
               '<div class="h" role="rowheader">Local NGO</div><div role="cell">Group A</div><div role="cell">Group B</div>'
               '<div class="h" role="rowheader">Global NGO</div><div role="cell">Group C</div><div role="cell">Group D</div></div></div>')
    o.append(f'<div class="page__cols"><h2>What I did</h2><div>{body}</div></div>')
    if p['gallery']:
        o.append('<div class="page__gallery">'+''.join(f'<figure class="{c}"><img data-img="{k}" alt="{ALT[k]}" loading="lazy"><figcaption>{cap}</figcaption></figure>' for k,c,cap in p['gallery'])+'</div>')
    n=p['next']
    o.append(f'<nav class="page__next" aria-label="More"><button type="button" class="page__back" data-close>{ARROW_L} Back to the portfolio</button><a href="#{n[0]}"><small>{n[1]}</small><b>{n[2]}</b></a></nav></div></div></article>')
    return '\n'.join(o)
USED=set()
def b64(n):
    USED.add(n)
    with open(os.path.join(SRC,'images',n+'.webp'),'rb') as f:
        return 'data:image/webp;base64,'+base64.b64encode(f.read()).decode()
body=open(os.path.join(SRC,'body.html'),encoding='utf-8').read().replace('{{PAGES}}','\n'.join(page_html(p) for p in PAGES))
body=body.replace('{{JOURNAL}}',journal.journal_pages()).replace('{{JTEASER}}',journal.teaser())
body=body.replace('{{CERTS}}',certs.certs_html())
body='<style>:root{--ren:url('+b64('renaissance_bg')+');--col:url('+b64('columns_bg')+')}</style>\n'+body
body=re.sub(r'\{\{IMG:(\w+)\}\}',lambda m:b64(m.group(1)),body)
css=open(os.path.join(SRC,'style.css'),encoding='utf-8').read(); js=open(os.path.join(SRC,'app.js'),encoding='utf-8').read(); land=open(os.path.join(SRC,'data','land-110m.json'),encoding='utf-8').read()
head='''<!doctype html>
<html lang="en-GB" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Shubhangi Gupta, international growth, sales and partnerships</title>
<meta name="description" content="Shubhangi Gupta builds partner networks, pipelines and new markets. Recruitment Manager, South Asia at Luminate Education Group, with seven years across India, the UK and international markets.">
<meta name="theme-color" content="#FBF8F2">
<meta property="og:type" content="profile">
<meta property="og:title" content="Shubhangi Gupta: creating what didn’t exist before">
<meta property="og:description" content="Sales, partnerships and client engagement across India, the UK and new markets.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect width=%2264%22 height=%2264%22 fill=%22%23FBF8F2%22/><text x=%2232%22 y=%2243%22 font-family=%22Georgia%22 font-style=%22italic%22 font-size=%2230%22 fill=%22%235C1230%22 text-anchor=%22middle%22>SG</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@400..800&display=swap" rel="stylesheet">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Shubhangi Gupta","jobTitle":"Recruitment Manager, South Asia","worksFor":{"@type":"Organization","name":"Luminate Education Group"},"alumniOf":[{"@type":"CollegeOrUniversity","name":"University of Leeds"},{"@type":"CollegeOrUniversity","name":"SRM Institute of Science and Technology"}],"email":"mailto:guptashubhangi.work@gmail.com","sameAs":["https://www.linkedin.com/in/shubhangigupta097"]}</script>
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
<script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
<script>var LAND='''+land+''';</script>
<script>
'''+js+'''
</script>
</body>
</html>
'''
out=head+body+tail
with open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8') as f: f.write(out)
print('index.html written,',len(out.encode())//1024,'KB;',len(USED),'images embedded')
if '--list-images' in sys.argv: print(sorted(USED))
