# JustDoIt — Workplace Social Coordination App

## 1. Problem → Solution Structuring

### The Core Problem

Spontaneously organizing after-work drinks or hangouts with colleagues is surprisingly difficult. The friction isn't social — it's logistical. People *want* to hang out, but nobody wants to be the one to organize it, chase responses, or feel exposed if not enough people show up.

### Why Current Solutions Fail

| Solution | Why It Fails |
|---|---|
| **Slack / Teams messages** | Messages get buried in channels. No structured RSVP. No visibility into who's actually coming. Feels like shouting into a void. |
| **WhatsApp / group chats** | Creates notification fatigue. Mixing social plans with other conversations. No clear commitment mechanism — "maybe" replies pile up endlessly. |
| **Calendar invites** | Too formal for casual drinks. Feels like scheduling a meeting, not a hangout. Doesn't capture the spontaneous energy. |
| **Word of mouth** | Excludes people. Inconsistent reach. Relies on a single "organizer personality" who eventually burns out. |
| **Meetup / Eventbrite** | Designed for public events with strangers, not trusted colleague circles. Overkill UX for "beers after work Friday." |

The underlying failure pattern: **no tool is purpose-built for low-commitment, same-day or same-week spontaneous plans within a trusted group.**

### The Solution

**JustDoIt** is a lightweight app where colleagues can float a hangout idea, set a minimum headcount to make it happen, and let others opt in — with zero pressure. The event either hits its threshold and happens, or it doesn't and nobody feels awkward. The app removes the social risk of organizing and the logistical friction of coordinating.

**Key insight:** The minimum-attendee threshold is the killer feature. It turns "who wants to grab drinks?" from a vulnerable social question into a safe, low-pressure collective decision.

---

## 2. MVP — Minimum Viable Product

### Guiding Principle

Ship the smallest thing that delivers the core value: **"Can I see if enough people are down for drinks tonight?"** Everything else is a future iteration.

### MVP Feature Set

#### 2.1 User System

- **Registration:** Email + password, or OAuth (Google Workspace / Microsoft 365 for workplace integration).
- **Profile:** Name, avatar (optional), workplace/team tag (optional).
- **Workspace concept:** Users belong to a workspace (invited via link or domain-verified). This creates the trusted circle.
- **No social graph complexity** — if you're in the workspace, you see everything. Keep it flat.

#### 2.2 Event Creation

A single, fast creation flow. The user fills in:

| Field | Required | Details |
|---|---|---|
| **Title** | Yes | Free text, e.g., "Friday beers" |
| **Date** | Yes | Date picker, defaults to today |
| **Time** | Yes | Time picker, defaults to 17:30 |
| **Location** | Yes | Free text input, e.g., "The Anchor Pub, 2nd floor" |
| **Min attendees** | Yes | Number input (minimum 2). The threshold for the event to be "on." |
| **Max attendees** | No | Optional cap. Useful for restaurant bookings or small venues. |
| **Description** | No | Optional short text for extra context. |
| **Expiry** | Auto | Event auto-expires at event start time if threshold not met. |

**UX priority:** Creation should take under 15 seconds. One screen, no multi-step wizard.

#### 2.3 RSVP System

Two response options only:

- **"I'm in"** — Firm commitment. Counted toward the threshold.
- **"Maybe"** — Interested but not committed. Shown separately, not counted toward threshold.

Why not "Not going"? Because silence *is* "not going." Removing it reduces social pressure and keeps the UI clean.

Users can change their response at any time before the event.

#### 2.4 Event Status Logic

Events have three states:

```
┌─────────────┐      min reached      ┌─────────────┐
│   PENDING   │ ────────────────────>  │  HAPPENING   │
│  (waiting)  │                        │  (confirmed) │
└──────┬──────┘                        └──────┬──────┘
       │                                      │
       │  expired (time passed,               │  people drop below min
       │  min not reached)                    │
       v                                      v
┌─────────────┐                        ┌─────────────┐
│  EXPIRED    │                        │  AT RISK     │
│  (no go)    │                        │ (needs more) │
└─────────────┘                        └─────────────┘
```

- **Pending:** Created, waiting for RSVPs. Default state.
- **Happening:** Minimum attendee threshold reached. The event is on.
- **Expired:** Event time passed without reaching the threshold. Quietly archived.
- **At Risk:** Was "Happening" but someone dropped out, now below threshold again.

#### 2.5 Visual Progress Indicator

The heart of the UX. Every event card shows:

```
┌─────────────────────────────────────────┐
│  Friday Beers                      🍺   │
│  Today, 17:30 · The Anchor Pub          │
│                                          │
│  ████████████░░░░░░  4/6 in             │
│  ──────────────────                      │
│  + 2 maybe                               │
│                                          │
│  [ I'm in ]   [ Maybe ]                 │
└─────────────────────────────────────────┘
```

- Progress bar fills as RSVPs come in relative to the minimum threshold.
- Clear numeric display: `4/6` means 4 confirmed out of 6 needed.
- "Maybe" count shown separately, below the bar.
- When threshold is met, the bar turns green and shows a "Happening!" badge.
- If a max is set and reached, the "I'm in" button becomes disabled with "Full" label.

#### 2.6 Core Screens (MVP)

1. **Feed / Home** — List of active events in your workspace, sorted by soonest first.
2. **Create Event** — Single-screen form (see 2.2).
3. **Event Detail** — Full event info, attendee list (names + avatars), RSVP buttons.
4. **Login / Register** — Auth screens.
5. **Workspace Join** — Enter invite code or auto-join via email domain.

That's it. Five screens. No settings page, no profile editing, no notifications center in v1. Keep it minimal.

#### 2.7 Notifications (MVP — Minimal)

- **Push notification** when an event you RSVP'd to hits its threshold ("Friday Beers is happening!").
- **Push notification** when a new event is created in your workspace.
- No email notifications in MVP. No digest. No reminder. Ship fast.

---

## 3. Technology Options

### Option A: The "Ship This Weekend" Stack (Recommended for MVP)

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React Native (Expo) | Single codebase for iOS + Android. Expo simplifies builds, OTA updates, push notifications. |
| **Backend** | Supabase (BaaS) | Postgres database, auth, real-time subscriptions, edge functions — all out of the box. Eliminates 80% of backend work. |
| **Database** | PostgreSQL (via Supabase) | Relational, robust, free tier generous. |
| **Auth** | Supabase Auth | Built-in email/password + OAuth (Google, Microsoft). |
| **Push Notifications** | Expo Push Notifications | Free, integrates natively with Expo. |
| **Hosting** | Supabase (managed) | Free tier: 500MB DB, 1GB storage, 50k monthly active users. More than enough for MVP. |

**Estimated monthly cost at MVP scale: $0**
Supabase free tier covers everything until you have real traction.

### Option B: The "Full Control" Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js (PWA) | Web-first, installable as PWA on mobile. No app store approval needed. Faster to ship. |
| **Backend** | Node.js + Express (or Fastify) | Lightweight, huge ecosystem, easy to hire for. |
| **Database** | PostgreSQL (via Railway or Neon) | Free tiers available. Neon offers serverless Postgres with generous free tier. |
| **Auth** | NextAuth.js (Auth.js) | Free, supports Google/Microsoft OAuth out of the box. |
| **Real-time** | Socket.io or Server-Sent Events | For live RSVP count updates. |
| **Hosting** | Vercel (frontend) + Railway (backend) | Both have free tiers. Vercel free tier is very generous. |

**Estimated monthly cost at MVP scale: $0–5**
Good for teams who want more architectural control and prefer web-first.

### Option C: The "Maximum Speed, Minimum Code" Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Flutter | Fast cross-platform development, excellent UI toolkit, single codebase. |
| **Backend** | Firebase (BaaS) | Real-time database, auth, cloud functions, push notifications — all managed. |
| **Database** | Firestore (via Firebase) | NoSQL, real-time sync built in. Spark plan is free. |
| **Auth** | Firebase Auth | Email/password + Google/Microsoft OAuth. Free for unlimited users. |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Free, reliable, industry standard. |
| **Hosting** | Firebase Hosting | Free tier included. |

**Estimated monthly cost at MVP scale: $0**
Firebase Spark plan is free. Great if the team knows Flutter/Dart.

### Stack Recommendation

**Go with Option A (Expo + Supabase)** unless you have a strong reason not to. Here's why:

- Supabase's real-time subscriptions mean RSVP counts update live with zero extra code.
- Expo gets you to both app stores from one codebase with minimal native pain.
- Supabase's row-level security means you can enforce workspace isolation at the database level.
- The free tier runway is long enough to validate the idea before spending a cent.

---

## 4. Data Model (MVP)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  workspaces  │       │    events    │       │    rsvps     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │──┐    │ id (PK)      │
│ name         │  │    │ workspace_id │  │    │ event_id     │
│ invite_code  │  │    │ creator_id   │  │    │ user_id      │
│ created_at   │  └───>│ title        │  └───>│ status       │
└──────────────┘       │ date         │       │  (in/maybe)  │
                       │ time         │       │ created_at   │
┌──────────────┐       │ location     │       │ updated_at   │
│    users     │       │ description  │       └──────────────┘
├──────────────┤       │ min_attendees│
│ id (PK)      │──┐    │ max_attendees│
│ email        │  │    │ status       │
│ name         │  │    │  (pending/   │
│ avatar_url   │  │    │   happening/ │
│ created_at   │  │    │   expired/   │
└──────┬───────┘  │    │   at_risk)   │
       │          │    │ created_at   │
       │          │    └──────────────┘
       │          │
┌──────v───────┐  │
│  memberships │  │
├──────────────┤  │
│ id (PK)      │  │
│ user_id  ────┼──┘
│ workspace_id │
│ joined_at    │
└──────────────┘
```

### Key Design Decisions

- **RSVP status is an enum (`in`, `maybe`)** — no `out` status. Absence of an RSVP record means "not going."
- **Event status is computed** — derived from RSVP count vs. min_attendees and current time. Can be stored as a column and updated via database trigger for performance, or computed on read.
- **Memberships table** allows users to belong to multiple workspaces (e.g., company-wide + team-specific).
- **No soft deletes in MVP.** If an event is cancelled, delete it. Keep it simple.

---

## 5. UX / Design Principles

### 5.1 Speed Over Polish

The primary UX metric is **time from "I want to do something" to "event posted."** Target: under 15 seconds. Every additional tap or field is a reason someone won't bother.

### 5.2 Social Safety

- The minimum-threshold mechanic is a **social safety net**. Nobody is "rejected" — the event just doesn't hit its number. Frame the language around the event, not the person.
- Don't show who *hasn't* responded. Only show who's "in" and who's "maybe."
- No public shaming, no "John hasn't responded yet" nudges.

### 5.3 Glanceability

Users should understand the state of all active events within 2 seconds of opening the app. The feed should communicate:
- What's happening
- When and where
- How close it is to the threshold
- Whether I've responded

One glance. No tapping into details required for the basics.

### 5.4 Ephemeral by Design

Events are not permanent records. After they expire or complete, they fade from the feed. No event history in MVP. This reinforces the spontaneous, low-pressure nature. It's not a calendar — it's a pulse.

---

## 6. Go-to-Market (Lean)

### Target First Users

Don't launch to "the world." Launch to **one office floor or one team of 15–30 people.** Ideal early adopters:
- Tech teams (comfortable with new apps)
- Teams that already occasionally go for drinks but inconsistently
- Teams of 10–40 people (big enough for critical mass, small enough to feel intimate)

### Acquisition Strategy (MVP Phase)

1. **Invite-link virality:** One person creates a workspace, shares the link in their team Slack/Teams. Zero marketing spend.
2. **Founder-led onboarding:** Personally onboard the first 5 workspaces. Sit with them, watch them use it, learn.
3. **Slack/Teams integration (post-MVP):** A `/drinks` slash command that creates an event and posts it to a channel. This is the growth unlock — meet users where they already are.

### Success Metrics (MVP)

| Metric | Target | Why It Matters |
|---|---|---|
| Events created per workspace per week | ≥ 2 | Proves recurring usage, not a one-time novelty. |
| RSVP rate (RSVPs / workspace members) | ≥ 40% | Proves engagement — people are checking and responding. |
| Threshold-met rate | ≥ 60% | Proves the concept works — events actually happen. |
| Week-2 retention (workspace level) | ≥ 50% | Proves stickiness beyond initial excitement. |

---

## 7. Future Roadmap (Post-MVP)

Prioritized by expected impact on retention and growth:

| Priority | Feature | Rationale |
|---|---|---|
| **P1** | Slack / Teams bot integration | Meet users where they are. Biggest growth lever. |
| **P1** | Recurring events ("Every Friday beers") | Reduces creation friction for habitual plans. |
| **P2** | Smart notifications & reminders | "3 people are in for tonight — join?" at 3pm. |
| **P2** | Location suggestions (map integration) | Reduce friction in choosing a venue. |
| **P3** | Polls ("Where should we go?") | Let the group decide venue/activity. |
| **P3** | Cost splitting integration | Link to Splitwise or built-in tab tracking. |
| **P4** | Cross-workspace events | Company-wide socials, inter-team mixers. |
| **P4** | Analytics for team leads | "Your team socializes 2x/month" — sell to HR/culture teams. |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Cold start problem** — not enough people in a workspace for events to hit thresholds | High | Set low default minimums (2-3). Onboard whole teams, not individuals. Seed with a first event during onboarding. |
| **Notification fatigue** — too many pings kill engagement | Medium | Minimal notifications in MVP. Only notify on threshold-met and new events. Let users mute later. |
| **"Just use Slack" objection** | High | The product must be *so much faster* and *so much clearer* than a Slack message that the value is obvious in 5 seconds. The progress bar is the differentiator. |
| **App store friction** — people won't download an app for this | Medium | Consider PWA (Option B) to eliminate download barrier. Or start web-only and add native later. |
| **Weekend/off-hours irrelevance** — app only useful Mon–Fri after 4pm | Medium | Expand to lunch plans, coffee runs, weekend hikes. The mechanic works for any group coordination. |

---

## Summary

**JustDoIt** solves a real, felt problem with a dead-simple mechanic: post a plan, set a minimum, watch the bar fill up. The MVP is five screens, one database, and zero dollars in infrastructure costs. Build it in 2-4 weeks with Expo + Supabase, ship it to one team, and learn fast.

The minimum-threshold mechanic is the moat. It's the thing that makes this *not* just another group chat. Protect it, refine it, and build everything else around it.
