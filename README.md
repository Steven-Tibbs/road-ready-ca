# Road Ready California

Mobile-first practice app for the California DMV knowledge (permit) test, plus a drive-test-day prep screen.

- **Two test versions:** 18 or older (36 questions, 30 to pass) and under 18 (46 questions, 38 to pass). Rules that only apply to minors (provisional license, 25+ supervisor, 50 practice hours) are left out of the 18+ test, and adult permit rules are left out of the under-18 test.
- **207 questions across 12 topics**, based on the California Driver's Handbook and laws in effect in 2026 (AB 390 Slow Down/Move Over, AB 382 school zones, AB 413 daylighting, AB 1909 passing bicyclists).
- **Random every time:** each test is weighted by topic and pulls the questions you've seen least recently first, so back-to-back tests don't repeat. Answer order is shuffled on every question.
- **Full Practice Test** (no hints, like the DMV), **Quick Spin**, **Practice by Topic**, **Fix My Mistakes**, a **Study Guide**, and **Drive Test Day**: a bring-with-you checklist, a car safety checklist, a tap-the-dashboard drill for the examiner's pre-drive safety check, and driving-test tips and automatic fails from the DMV's Driving Test Criteria.
- Progress is saved in the browser (localStorage). No accounts, no tracking.

## Files

- `index.html` — markup and styles
- `js/questions.js` — topics, study tips, and the question bank
- `js/visuals.js` — SVG signs and scenes
- `js/app.js` — test building, quiz, results, and drive-day logic

No build step. Deploy as a static site (Vercel: framework "Other", no build command, root as output).
