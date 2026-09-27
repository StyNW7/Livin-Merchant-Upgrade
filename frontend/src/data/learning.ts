import type { CalendarEvent, LearningModule, MerchantProgram } from "@/types";

export const learningModules: LearningModule[] = [
  {
    id: "learn-cashflow",
    title: "Cashflow Basics",
    minutes: 5,
    summary: "Know where your money comes from and where it goes every week.",
    missionId: "m-learning",
    lessons: [
      {
        title: "Money in vs money out",
        body: "Cashflow is the simple difference between what you receive and what you pay. A profitable shop can still run short of cash if big payments land in the same week. Record every sale and every expense so the picture stays honest.",
      },
      {
        title: "Separate business and personal money",
        body: "Use your Mandiri business account for the shop only. Mixing personal spending into business money makes it hard to see if the shop is actually growing.",
      },
      {
        title: "Plan for big payments",
        body: "Rent, payroll and supplier bills come on predictable dates. Put them in your Business Calendar and keep a small buffer, about two weeks of expenses, before those dates.",
      },
    ],
  },
  {
    id: "learn-inventory",
    title: "Inventory Management",
    minutes: 6,
    summary: "Avoid running out of best sellers without over-stocking.",
    lessons: [
      {
        title: "Set a reorder level",
        body: "A reorder level is the stock count that tells you to buy again. A good starting point is your average daily usage times the days your supplier needs to deliver, plus one extra day.",
      },
      {
        title: "Watch fast movers",
        body: "Coffee beans, milk and pastries move fastest in a cafe. Check them daily. Slower items can be counted weekly.",
      },
      {
        title: "Record damaged stock",
        body: "Spilled milk and unsold pastries are real costs. Recording them shows you where waste happens so you can order more accurately.",
      },
    ],
  },
  {
    id: "learn-pricing",
    title: "Pricing Strategy",
    minutes: 7,
    summary: "Price for profit, not only to match competitors.",
    lessons: [
      {
        title: "Know your cost per item",
        body: "Add up ingredients and packaging for one serving. Your selling price should leave a healthy margin after that cost, usually 60 to 70 percent for drinks.",
      },
      {
        title: "Use bundles instead of discounts",
        body: "Bundles such as coffee plus pastry increase the order value while protecting your margin better than a flat discount.",
      },
      {
        title: "Review prices twice a year",
        body: "Ingredient costs change. Small, regular price updates are easier for customers to accept than one large jump.",
      },
    ],
  },
  {
    id: "learn-marketing",
    title: "Digital Marketing Basics",
    minutes: 8,
    summary: "Bring customers back with simple, low-cost promotions.",
    lessons: [
      {
        title: "Start with your regulars",
        body: "Returning customers are cheaper to reach than new ones. A loyalty reward or a small voucher can bring them back more often.",
      },
      {
        title: "Post at the right time",
        body: "Share content just before your busy hours so it reaches people when they are deciding where to eat or drink.",
      },
      {
        title: "Measure every promotion",
        body: "Check revenue, transactions and redemptions for each campaign. Keep what works and stop what does not.",
      },
    ],
  },
  {
    id: "learn-financing",
    title: "Getting Financing Ready",
    minutes: 6,
    summary: "What helps a bank understand your business.",
    lessons: [
      {
        title: "Consistent digital records",
        body: "Recorded transactions show how your business performs over time. The more complete your records, the clearer your business picture.",
      },
      {
        title: "Complete business documents",
        body: "Business identity (NIB), tax number (NPWP) and owner identity are usually required. Keep them up to date in your Business Profile.",
      },
      {
        title: "Borrow for a clear purpose",
        body: "Financing works best for a specific goal, such as equipment that increases capacity. Final approval always follows the bank's own assessment.",
      },
    ],
  },
];

export const merchantPrograms: MerchantProgram[] = [
  { id: "prog-growth-challenge", section: "Growth Challenges", title: "Merchant Growth Challenge", description: "Complete three Growth Missions this quarter to earn a merchant badge.", status: "Active", date: "Until 31 Dec 2026" },
  { id: "prog-qris-week", section: "Merchant Programs", title: "QRIS Transaction Week", description: "Encourage customers to pay with QRIS during a featured week.", status: "Upcoming", date: "12 - 18 Oct 2026" },
  { id: "prog-poin", section: "Livin'poin", title: "Livin'poin for Merchants", description: "View eligible loyalty benefits linked to your business account activity.", status: "Active" },
  { id: "prog-class", section: "Education", title: "UMKM Business Class", description: "A practical class on cashflow and pricing for small business owners.", status: "Upcoming", date: "10 Oct 2026, 13:00" },
  { id: "prog-networking", section: "Business Events", title: "Merchant Networking Day", description: "Meet other F&B merchants and suppliers in Tangerang.", status: "Registration Open", date: "24 Oct 2026" },
  { id: "prog-community", section: "Community", title: "Tangerang F&B Circle", description: "A community space to share tips with nearby merchants.", status: "Active" },
];

export const PROGRAM_NOTE = "Concept programs shown for demonstration. Actual programs, schedules and benefits may differ.";

export const initialEvents: CalendarEvent[] = [
  { id: "ev-supplier-pay", date: "2026-09-26", title: "Supplier Payment", category: "Finance", time: "15:00", note: "UD Kemasan Jaya remaining Rp 575.000", link: "/suppliers/sup-kemasan" },
  { id: "ev-shift", date: "2026-09-26", title: "Afternoon shift - Dimas", category: "Staff", time: "13:00", link: "/employees" },
  { id: "ev-promo-end", date: "2026-09-27", title: "Promotion Ends", category: "Campaign", note: "Payday Treat", link: "/promotions" },
  { id: "ev-po", date: "2026-09-28", title: "PO-0926-001 Delivery", category: "Operations", time: "08:00", note: "PT Rasa Nusantara", link: "/suppliers" },
  { id: "ev-report", date: "2026-09-30", title: "Monthly Report", category: "Growth", note: "Review September performance", link: "/reports" },
  { id: "ev-payroll", date: "2026-10-03", title: "Staff Payroll", category: "Finance", note: "Estimated Rp 14.000.000 for 2 outlets", link: "/expenses" },
  { id: "ev-inventory", date: "2026-10-05", title: "Inventory Review", category: "Operations", link: "/inventory" },
  { id: "ev-lunch-end", date: "2026-10-05", title: "Lunch Combo Ends", category: "Campaign", link: "/promotions" },
  { id: "ev-class", date: "2026-10-10", title: "UMKM Business Class", category: "Growth", time: "13:00", link: "/programs" },
];
