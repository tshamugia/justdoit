import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  // Wipe existing data (order matters for FK constraints)
  await prisma.rsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────────────────────
  const usersData = [
    { email: "alice@example.com", password: "password123", fullName: "Alice Johnson" },
    { email: "bob@example.com",   password: "password123", fullName: "Bob Smith" },
    { email: "carol@example.com", password: "password123", fullName: "Carol Williams" },
    { email: "dave@example.com",  password: "password123", fullName: "Dave Brown" },
    { email: "eve@example.com",   password: "password123", fullName: "Eve Davis" },
    { email: "frank@example.com", password: "password123", fullName: "Frank Miller" },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: await hash(u.password),
        profile: { create: { fullName: u.fullName } },
      },
    });
    createdUsers.push(user);
    console.log(`  Created user: ${u.email}`);
  }

  const [alice, bob, carol, dave, eve, frank] = createdUsers;

  // ─── Default Workspace ("General") ─────────────────────────────────────────
  const generalWorkspace = await prisma.workspace.create({
    data: {
      name: "General",
      inviteCode: "general0",
      isDefault: true,
      createdBy: alice.id,
    },
  });
  for (const user of createdUsers) {
    await prisma.membership.create({
      data: {
        workspaceId: generalWorkspace.id,
        userId: user.id,
        role: user.id === alice.id ? "owner" : "member",
      },
    });
  }
  console.log("  Created default workspace: General (all users added)");

  // ─── Workspaces ────────────────────────────────────────────────────────────
  const acmeCorp = await prisma.workspace.create({
    data: {
      name: "Acme Corp",
      inviteCode: "ACME-2026",
      createdBy: alice.id,
    },
  });

  const devTeam = await prisma.workspace.create({
    data: {
      name: "Dev Team",
      inviteCode: "DEV-TEAM-26",
      createdBy: bob.id,
    },
  });

  console.log("  Created workspaces: Acme Corp, Dev Team");

  // ─── Memberships ───────────────────────────────────────────────────────────
  // Acme Corp — all users
  const acmeMembers = [
    { userId: alice.id, role: "admin" },
    { userId: bob.id,   role: "member" },
    { userId: carol.id, role: "member" },
    { userId: dave.id,  role: "member" },
    { userId: eve.id,   role: "member" },
    { userId: frank.id, role: "member" },
  ];
  for (const m of acmeMembers) {
    await prisma.membership.create({ data: { workspaceId: acmeCorp.id, ...m } });
  }

  // Dev Team — bob, carol, dave, alice
  const devMembers = [
    { userId: bob.id,   role: "admin" },
    { userId: carol.id, role: "member" },
    { userId: dave.id,  role: "member" },
    { userId: alice.id, role: "member" },
  ];
  for (const m of devMembers) {
    await prisma.membership.create({ data: { workspaceId: devTeam.id, ...m } });
  }

  console.log("  Created memberships");

  // ─── Events ────────────────────────────────────────────────────────────────
  // Dates relative to seed date 2026-02-13
  const events = [
    // --- Acme Corp events ---
    {
      workspaceId: acmeCorp.id,
      createdBy: alice.id,
      title: "Team Lunch at The Rooftop",
      description: "Monthly team lunch — come hungry! We'll try the new rooftop restaurant downtown.",
      location: "The Rooftop, 42 Main St",
      eventDate: "2026-02-20",
      eventTime: "12:30",
      minAttendees: 4,
      maxAttendees: 12,
      status: "happening",
    },
    {
      workspaceId: acmeCorp.id,
      createdBy: bob.id,
      title: "Friday Happy Hour",
      description: "Wind down the week with the team. Drinks on the company card!",
      location: "Brew & Co Bar",
      eventDate: "2026-02-21",
      eventTime: "18:00",
      minAttendees: 3,
      maxAttendees: null,
      status: "pending",
    },
    {
      workspaceId: acmeCorp.id,
      createdBy: carol.id,
      title: "Escape Room Challenge",
      description: "Can we escape in 60 minutes? Team bonding at its finest.",
      location: "Mind Trap Escape Rooms",
      eventDate: "2026-02-28",
      eventTime: "14:00",
      minAttendees: 5,
      maxAttendees: 8,
      status: "at_risk",
    },
    {
      workspaceId: acmeCorp.id,
      createdBy: alice.id,
      title: "Q1 Planning Offsite",
      description: "Full-day offsite to plan our Q1 roadmap. Breakfast and lunch provided.",
      location: "The Hive Co-working Space",
      eventDate: "2026-03-05",
      eventTime: "09:00",
      minAttendees: 6,
      maxAttendees: null,
      status: "pending",
    },
    {
      workspaceId: acmeCorp.id,
      createdBy: dave.id,
      title: "Board Game Night",
      description: "Bring your favorite board game or just show up. All skill levels welcome.",
      location: "Office Break Room",
      eventDate: "2026-03-13",
      eventTime: "19:00",
      minAttendees: 4,
      maxAttendees: 10,
      status: "pending",
    },
    {
      workspaceId: acmeCorp.id,
      createdBy: alice.id,
      title: "Holiday Kickoff Dinner",
      description: "Celebrate the long weekend with the full team.",
      location: "Osteria Bella",
      eventDate: "2026-02-10", // past — expired
      eventTime: "19:30",
      minAttendees: 5,
      maxAttendees: null,
      status: "expired",
    },
    // --- Dev Team events ---
    {
      workspaceId: devTeam.id,
      createdBy: bob.id,
      title: "Sprint Retrospective Lunch",
      description: "Post-sprint retro over tacos. Let's celebrate our wins!",
      location: "Taco Tuesday Spot",
      eventDate: "2026-02-19",
      eventTime: "12:00",
      minAttendees: 3,
      maxAttendees: 6,
      status: "happening",
    },
    {
      workspaceId: devTeam.id,
      createdBy: carol.id,
      title: "Tech Talk: AI Tools in Our Workflow",
      description: "Casual talk + demo on how the team is using AI tools. Pizza included.",
      location: "Conference Room B",
      eventDate: "2026-02-25",
      eventTime: "16:00",
      minAttendees: 2,
      maxAttendees: null,
      status: "happening",
    },
    {
      workspaceId: devTeam.id,
      createdBy: bob.id,
      title: "Hackathon Prep Session",
      description: "Brainstorm and form teams before the upcoming company hackathon.",
      location: "Zoom",
      eventDate: "2026-03-10",
      eventTime: "18:00",
      minAttendees: 4,
      maxAttendees: null,
      status: "pending",
    },
    {
      workspaceId: devTeam.id,
      createdBy: alice.id,
      title: "Coffee & Code Morning",
      description: "Early-morning coworking session. Good coffee, good vibes.",
      location: "Bean & Byte Cafe",
      eventDate: "2026-02-07", // past — expired
      eventTime: "08:30",
      minAttendees: 2,
      maxAttendees: null,
      status: "expired",
    },
  ];

  const createdEvents = [];
  for (const e of events) {
    const ev = await prisma.event.create({ data: e });
    createdEvents.push(ev);
  }

  console.log(`  Created ${createdEvents.length} events`);

  // Convenience references
  const [
    teamLunch,    // happening — acme
    happyHour,    // pending   — acme
    escapeRoom,   // at_risk   — acme
    q1Planning,   // pending   — acme
    boardGame,    // pending   — acme
    holidayDinner,// expired   — acme
    sprintLunch,  // happening — dev
    techTalk,     // happening — dev
    hackathon,    // pending   — dev
    coffeeCode,   // expired   — dev
  ] = createdEvents;

  // ─── RSVPs ─────────────────────────────────────────────────────────────────
  const rsvps = [
    // Team Lunch — "happening" (4+ in)
    { eventId: teamLunch.id, userId: alice.id,  status: "in" },
    { eventId: teamLunch.id, userId: bob.id,    status: "in" },
    { eventId: teamLunch.id, userId: carol.id,  status: "in" },
    { eventId: teamLunch.id, userId: dave.id,   status: "in" },
    { eventId: teamLunch.id, userId: eve.id,    status: "in" },
    { eventId: teamLunch.id, userId: frank.id,  status: "out" },

    // Happy Hour — "pending" (only 1 in, below threshold of 3)
    { eventId: happyHour.id, userId: bob.id,    status: "in" },
    { eventId: happyHour.id, userId: frank.id,  status: "out" },

    // Escape Room — "at_risk" (2 in, needs 5)
    { eventId: escapeRoom.id, userId: carol.id, status: "in" },
    { eventId: escapeRoom.id, userId: dave.id,  status: "in" },
    { eventId: escapeRoom.id, userId: alice.id, status: "out" },

    // Q1 Planning — no RSVPs yet (pending)

    // Board Game Night — 2 in, needs 4 (pending)
    { eventId: boardGame.id, userId: dave.id,   status: "in" },
    { eventId: boardGame.id, userId: eve.id,    status: "in" },

    // Holiday Dinner (past/expired)
    { eventId: holidayDinner.id, userId: alice.id,  status: "in" },
    { eventId: holidayDinner.id, userId: bob.id,    status: "in" },
    { eventId: holidayDinner.id, userId: carol.id,  status: "in" },
    { eventId: holidayDinner.id, userId: dave.id,   status: "in" },
    { eventId: holidayDinner.id, userId: eve.id,    status: "in" },
    { eventId: holidayDinner.id, userId: frank.id,  status: "in" },

    // Sprint Lunch — "happening" (3+ in)
    { eventId: sprintLunch.id, userId: bob.id,   status: "in" },
    { eventId: sprintLunch.id, userId: carol.id, status: "in" },
    { eventId: sprintLunch.id, userId: dave.id,  status: "in" },
    { eventId: sprintLunch.id, userId: alice.id, status: "out" },

    // Tech Talk — "happening" (2+ in, min is 2)
    { eventId: techTalk.id, userId: carol.id, status: "in" },
    { eventId: techTalk.id, userId: bob.id,   status: "in" },
    { eventId: techTalk.id, userId: dave.id,  status: "in" },

    // Hackathon Prep — pending (no RSVPs)

    // Coffee & Code (past/expired)
    { eventId: coffeeCode.id, userId: alice.id, status: "in" },
    { eventId: coffeeCode.id, userId: bob.id,   status: "in" },
    { eventId: coffeeCode.id, userId: carol.id, status: "in" },
  ];

  for (const r of rsvps) {
    await prisma.rsvp.create({ data: r });
  }

  console.log(`  Created ${rsvps.length} RSVPs`);
  console.log("\nDone! Test accounts:");
  console.log("  alice@example.com / password123  (admin in Acme Corp)");
  console.log("  bob@example.com   / password123  (admin in Dev Team)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
