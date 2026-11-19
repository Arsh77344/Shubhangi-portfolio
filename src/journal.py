import math, re
ARROW='<svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor"/></svg>'
ARROW_L='<svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true"><path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor"/></svg>'

POSTS=[
{'slug':'journal-partnerships','short':'Relationships before routes to market',
 'title':'Relationships come before routes to market',
 'dek':'Why the strongest international partnerships are built on trust long before they are built on strategy.',
 'img':('ren_left','An engraved illustration of classical arches opening onto trees','art'),
 'body':'''<p>Most market entry plans start in the same place: a list of countries, a size for each opportunity, a channel strategy and a timeline. All of that matters. But in partnership work, the plan only comes alive when someone on the other side decides to trust you with their reputation.</p>
<p>A recruitment agent, a school counsellor or a university partner is not a channel. They are a person whose name is attached to every recommendation they make. When they put a student forward, or put a partner in front of their own network, they are lending you something that took them years to build.</p>
<h2>Strategy tells you where. Relationships decide whether.</h2>
<p>Strategy can tell you which markets look promising. It cannot tell you whether the people in those markets will pick up the phone in six months’ time. That depends on what happened in the first few conversations: whether you listened, whether you followed up when you said you would, and whether you were honest about what you could and could not deliver.</p>
<p>I think of a partnership as a series of small promises kept. A prompt answer to a difficult question. A brochure that arrives before the event, not after it. A straight answer when a student’s application is unlikely to succeed. None of these appear in a market entry plan, but together they decide whether the plan works.</p>
<blockquote>A partner is not a channel. They are a person lending you their reputation.</blockquote>
<h2>What this looks like in practice</h2>
<p><b>Start with their goals, not yours.</b> Every partner has their own targets, pressures and customers. The partnerships that last are the ones where both sides can describe what the other needs.</p>
<p><b>Make the first win small and real.</b> A modest result delivered well builds more trust than an ambitious promise that slips.</p>
<p><b>Keep the relationship warm between deals.</b> Updates, introductions and help that is not tied to a target are what turn a contact into a partner.</p>
<p><b>Measure the relationship, not only the pipeline.</b> Response times, repeat referrals and the quality of conversations tell you early whether a partnership is healthy.</p>
<h2>The order matters</h2>
<p>None of this means strategy is optional. A relationship with no plan behind it rarely grows. But the order matters. Build the trust first and the strategy has something to stand on. Lead with the strategy alone and you are asking people to commit before they know who they are committing to.</p>
<p>Markets are made of people. The map is useful. The people are the point.</p>'''},
{'slug':'journal-markets','short':'What moving across markets teaches you',
 'title':'What moving across markets teaches you about people',
 'dek':'Notes on culture, communication and business from a career that has crossed cities and countries.',
 'img':('cave','Looking out from a sea cave towards open water and a clear horizon','photo'),
 'body':'''<p>I have lived and worked in Lucknow, Delhi NCR, Pune and Leeds, and my work now connects students and partners across South Asia with institutions in the UK. Each move changed how I think about the people on the other side of a conversation.</p>
<p>This is not a guide to any one country. It is a set of habits that, I think, travel well.</p>
<h2>The same word can mean different things</h2>
<p>“Yes” can mean agreement, or it can mean “I heard you”. “We’ll see” can be a polite no. A deadline can be a firm commitment in one setting and a hopeful estimate in another. None of these is wrong. But if you assume your own meaning is the universal one, you will misread people who are being perfectly clear in their own terms.</p>
<p>The fix is simple and easy to forget: ask, and confirm in writing what was agreed.</p>
<h2>Context travels more slowly than information</h2>
<p>A brochure, a fee table or a course list can be sent anywhere in seconds. The context around it cannot. Why does this option suit this student? What does a family worry about when a child studies abroad? What does a partner need to hear before recommending you? That context only arrives through conversation, and it is usually the thing that decides the outcome.</p>
<blockquote>Information can be sent in seconds. Context has to be earned in conversation.</blockquote>
<h2>Respect is local, trust is personal</h2>
<p>Every market has its own way of showing respect: how a meeting opens, who speaks first, how directly a disagreement is raised. Learning those forms is a courtesy worth making. But trust is still personal. People remember whether you did what you said you would.</p>
<h2>Moving teaches you to be a beginner</h2>
<p>Each new city asks you to be new again: to learn the routes, the habits and the unwritten rules. That discomfort is useful. It makes you a better listener, slower to assume and quicker to ask. The same posture works when you enter a new market or meet a new partner.</p>
<p>The most useful thing I take from one place to the next is not knowledge about any single market. It is the habit of arriving curious.</p>'''},
{'slug':'journal-opportunities','short':'Making room for what did not exist',
 'title':'The art of creating opportunities where none existed',
 'dek':'On building something new inside an organisation: a network, a process, or a market that was not there before.',
 'img':('ren_arch','An engraved illustration of a single classical arch framing open sky','art'),
 'body':'''<p>Some roles come with a well-worn path: a territory, a target, a playbook. Others begin with a gap. There is no partner network yet, no process, or no presence in the market. The job is to make the thing that is missing.</p>
<p>I find the second kind of work the most interesting. It is also the kind that needs the most discipline.</p>
<h2>Start by describing the gap precisely</h2>
<p>“We need to grow in this region” is an ambition, not a gap. A useful description is narrower: which people should know about us and do not, which step in the process loses them, which relationship would unlock the rest. The more precisely the gap is described, the easier it is to see the first move.</p>
<h2>Borrow structure from what already works</h2>
<p>New things are rarely invented from nothing. A partner programme can borrow from how good account management works. A new market can borrow from a neighbouring one. A messy process can borrow from systems thinking: map it, find where it breaks, fix that first. My engineering background still shapes this habit. I like to understand how something works before I try to grow it.</p>
<blockquote>New things are rarely invented from nothing. They are assembled from what already works.</blockquote>
<h2>Make it visible early</h2>
<p>When you build something that did not exist, people cannot see it yet. A simple dashboard, a shared tracker or a short monthly note gives the work a shape others can follow, question and support. Visibility also keeps you honest about what is moving and what is not.</p>
<h2>Design it to outlast you</h2>
<p>The real test of something new is whether it keeps working when you step away. That means writing things down, training others, and building relationships between people rather than through one person. A network that depends on a single contact is fragile. A network with many connections is an asset.</p>
<h2>Opportunities are built, not found</h2>
<p>It is tempting to think of opportunity as something you spot. In my experience it is more often something you assemble, one conversation, one process and one small result at a time, until there is something there that was not there before.</p>'''},
]
def words(h): return len(re.sub('<[^>]+>',' ',h).split())
for p in POSTS: p['mins']=max(2,math.ceil(words(p['body'])/220))

def img_tag(key,alt,cls=''):
    # cave appears twice: embed once with data-key (in the teaser list), reuse elsewhere via data-img
    return f'<img data-img="{key}" alt="{alt}" class="{cls}" loading="lazy">'

def teaser():
    o=[]
    for i,p in enumerate(POSTS):
        k,alt,kind=p['img']
        src=f'src="{{{{IMG:{k}}}}}" data-key="{k}"'
        o.append(f'<li class="jt" data-rise><a href="#{p["slug"]}"><span class="jt__img jt__img--{kind}"><img {src} alt="" loading="lazy"></span><span class="jt__meta">Draft, {p["mins"]} min read</span><h3>{p["title"]}</h3><p>{p["dek"]}</p><span class="jt__go">Open the file {ARROW}</span></a></li>')
    return '\n      '.join(o)

def journal_pages():
    cards=[]
    for i,p in enumerate(POSTS):
        k,alt,kind=p['img']
        cards.append(f'''<li class="jcard" style="--i:{i}">
  <a class="jcard__in" href="#{p["slug"]}">
    <span class="jcard__tab">File {i+1} of {len(POSTS)}</span>
    <span class="jcard__img jcard__img--{kind}"><img data-img="{k}" alt="" loading="lazy"></span>
    <span class="jcard__text"><span class="jcard__meta">Draft, {p["mins"]} min read</span><h2>{p["title"]}</h2><p>{p["dek"]}</p><span class="jcard__go">Open the file {ARROW}</span></span>
  </a>
</li>''')
    o=[f'''<article class="page page--journal" data-page="journal" data-kind="journal" data-lenis-prevent aria-labelledby="pg-journal">
<div class="page__bar"><button type="button" class="page__back" data-close>{ARROW_L} Back to the portfolio</button><span class="page__crumb">Journal</span></div>
<header class="jhero"><div class="jhero__art" aria-hidden="true"></div><div class="wrap"><p class="eyebrow">Journal</p><h1 id="pg-journal">Notes from the archive</h1><p class="jhero__lede">Short pieces on partnerships, new markets and the people who make them work. These are early drafts, filed here while I write.</p></div></header>
<div class="wrap"><ol class="jstack">{''.join(cards)}</ol>
<p class="jstack__end">That’s the archive so far. More files soon.</p></div>
</article>''']
    for i,p in enumerate(POSTS):
        k,alt,kind=p['img']; nx=POSTS[(i+1)%len(POSTS)]
        o.append(f'''<article class="page page--article" data-page="{p["slug"]}" data-kind="article" data-lenis-prevent aria-labelledby="pg-{p["slug"]}">
<div class="page__bar"><a class="page__back" href="#journal">{ARROW_L} Back to the archive</a><span class="page__crumb">Journal, file {i+1} of {len(POSTS)}</span></div>
<div class="sheet">
<header class="art__head"><p class="art__meta">Draft, {p["mins"]} min read</p><h1 id="pg-{p["slug"]}">{p["title"]}</h1><p class="art__dek">{p["dek"]}</p></header>
<figure class="art__fig art__fig--{kind}"><img data-img="{k}" alt="{alt}" loading="lazy"></figure>
<div class="art__body">{p["body"]}</div>
<p class="art__note">This is a draft piece. Shubhangi will revise it before it is published.</p>
<nav class="art__next" aria-label="More from the journal"><a class="page__back" href="#journal">{ARROW_L} Back to the archive</a><a class="art__nextlink" href="#{nx["slug"]}"><small>Next file</small><b>{nx["title"]}</b></a></nav>
</div>
</article>''')
    return '\n'.join(o)
