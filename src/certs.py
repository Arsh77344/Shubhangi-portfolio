# -*- coding: utf-8 -*-
"""The certifications archive.

Each certificate is one row in an index, grouped by theme. The nine with a PDF
in /certificates show "On file" and open the original; the rest are listed
without a link. To add one, copy a row into the right group below.

    (title, issuer, issuer_url, date, [what I learnt], pdf filename or None, preview image key or None)
"""

GROUPS = [
 ("Leadership and people", [
   ("Leading People", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "Oct 2021",
    ["Build trust in a team", "Motivate and delegate", "Give useful feedback"],
    "Leading_People.pdf", "certview_leading_people"),
   ("Negotiating", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "Aug 2021",
    ["Prepare goals and limits", "Understand the other side", "Reach deals both sides keep"],
    "Negotiating.pdf", "certview_negotiating"),
   ("Change Management", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "May 2022",
    ["Why people resist change", "Plan and explain a change", "Help teams adopt it"],
    "Change_Management.pdf", "certview_change_management"),
   ("Global Leadership", "Common Purpose", "https://commonpurpose.org/", "Dec 2022",
    ["Lead across cultures", "Work with different views", "Build wider networks"],
    None, None),
 ]),
 ("Strategy and delivery", [
   ("Strategic Thinking", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "Aug 2021",
    ["See the bigger picture", "Spot trends and openings", "Turn insight into direction"],
    "Strategic_Thinking.pdf", "certview_strategic_thinking"),
   ("Strategy Planning and Execution", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "Sep 2021",
    ["Set clear priorities", "Turn strategy into plans", "Keep execution on track"],
    "StrategyPlanningandExecution.pdf", "certview_strategyplanningandexecution"),
   ("Foundations of Project Management", "Coursera", "https://www.coursera.org/", "Jan 2022",
    ["Scope and plan a project", "Manage time, cost and risk", "Work with stakeholders"],
    None, None),
   ("Time Management", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "Aug 2021",
    ["Prioritise what matters", "Plan the day and the week", "Deal with interruptions"],
    "TimeManagement.pdf", "certview_timemanagement"),
   ("Agentic AI for Business Strategy", "Vanderbilt University", "https://www.vanderbilt.edu/", "Feb 2026",
    ["How AI agents change strategy", "Where they fit in sales and operations"],
    None, None),
   ("Business Foundation", "Infosys", "https://www.infosys.com/", "Aug 2021",
    ["How a business runs", "Core business terms", "Working in a corporate team"],
    None, None),
 ]),
 ("Marketing and communications", [
   ("Integrated Marketing Communications", "IE Business School", "https://www.ie.edu/", "Feb 2023",
    ["Mix advertising, PR and digital", "One message across channels", "Plan joined-up campaigns"],
    "IECertificate.pdf", "certview_iecertificate"),
   ("Marketing Analytics", "LinkedIn Learning", "https://www.linkedin.com/learning/", "Dec 2022",
    ["Track the right metrics", "Read campaign data", "Turn numbers into decisions"],
    None, None),
   ("Marketing Communications", "LinkedIn Learning", "https://www.linkedin.com/learning/", "Dec 2022",
    ["Shape a clear message", "Choose the right channels", "Measure what works"],
    None, None),
   ("Creating a Communications Strategy", "LinkedIn Learning", "https://www.linkedin.com/learning/", "",
    ["Set communication goals", "Know your audiences", "Build a plan to deliver"],
    None, None),
   ("Managing Brand Reputation", "LinkedIn Learning", "https://www.linkedin.com/learning/", "",
    ["Monitor what people say", "Respond to issues early", "Protect trust in the brand"],
    None, None),
   ("Writing Skills", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "Jul 2021",
    ["Plan before you write", "Match tone to the reader", "Edit for clarity and brevity"],
    "Writing_Skills.pdf", "certview_writing_skills"),
   ("Presentation Skills", "Harvard ManageMentor", "https://www.harvardbusiness.org/", "Aug 2021",
    ["Structure a clear message", "Know your audience", "Deliver with confidence"],
    "Presentation_Skills.pdf", "certview_presentation_skills"),
 ]),
]

EXT = ('<svg class="ext" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">'
       '<path d="M3 1h7v7M10 1 1 10" fill="none" stroke="currentColor"/></svg>'
       '<span class="sr">, opens in a new tab</span>')


def _esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def total():
    return sum(len(rows) for _, rows in GROUPS)


def on_file():
    return sum(1 for _, rows in GROUPS for r in rows if r[5])


def certs_html():
    o = ['<div class="arc" id="arc">', '<div class="arc__index">']
    n = 0
    for gi, (gname, rows) in enumerate(GROUPS):
        o.append('<section class="arcg" aria-labelledby="arcg%d">' % gi)
        o.append('<h3 class="arcg__h" id="arcg%d">%s<span aria-hidden="true">%d</span></h3>'
                 % (gi, _esc(gname), len(rows)))
        o.append('<ul class="arcl">')
        for (title, issuer, iurl, date, pts, pdf, view) in rows:
            n += 1
            cid = "c%02d" % n
            meta = _esc(issuer) + ((" · " + date) if date else "")
            o.append('<li class="arcr">')
            o.append('<button type="button" class="arci" id="%s-b" data-cert="%s" '
                     'aria-expanded="false" aria-controls="%s-d" data-cursor="%s">'
                     % (cid, cid, cid, "Open" if pdf else "Read"))
            o.append('<span class="arci__n" aria-hidden="true">%02d</span>' % n)
            o.append('<span class="arci__t">%s</span>' % _esc(title))
            o.append('<span class="arci__m">%s</span>' % meta)
            o.append('<span class="arci__f">%s</span>'
                     % ('<i class="seal" aria-hidden="true"></i>On file'
                        if pdf else '<span class="sr">No certificate on file</span>'))
            o.append('</button>')
            # the detail: the single source for both the side panel and the phone accordion
            d = ['<div class="arcd" id="%s-d" data-view-img="%s">' % (cid, view or "")]
            d.append('<p class="arcd__m">%s</p>' % meta)
            d.append('<h4 class="arcd__t">%s</h4>' % _esc(title))
            d.append('<p class="arcd__k">What it covered</p>')
            d.append('<ul class="arcd__l">' + "".join('<li>%s</li>' % _esc(p) for p in pts) + '</ul>')
            if iurl:
                d.append('<p class="arcd__by">Awarded by <a class="olink" href="%s" target="_blank" '
                         'rel="noopener">%s%s</a></p>' % (iurl, _esc(issuer), EXT))
            if pdf:
                d.append('<a class="arcd__open" href="certificates/%s" target="_blank" rel="noopener" '
                         'data-view="{{IMG:%s}}" data-title="%s">Open the certificate%s</a>'
                         % (pdf, view, _esc(title), EXT))
            else:
                d.append('<p class="arcd__none">The certificate for this one isn’t on file.</p>')
            d.append('</div>')
            o.append("".join(d))
            o.append('</li>')
        o.append('</ul></section>')
    o.append('</div>')  # /arc__index
    o.append('<aside class="arc__view" id="arcView" aria-live="polite">'
             '<div class="arcv__paper"><div class="arcv__sheet" id="arcSheet"></div>'
             '<div class="arcv__body" id="arcBody"></div></div></aside>')
    o.append('</div>')
    return "\n".join(o)
