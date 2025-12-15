// Task templates for wedding planning timeline
// This is the master list that generates all client tasks

export type TaskTemplate = {
  key: string;
  title: string;
  section: string;
  owner: "client" | "planner";
  importance: 1 | 2 | 3 | 4 | 5;
  milestone?: boolean;
  confetti?: boolean;
  pushOnActivate?: boolean;
};

// Helper to generate stable keys
const k = (section: string, title: string) =>
  `${section}:${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

// Category assignment based on keywords
export function assignCategory(title: string): string {
  const lower = title.toLowerCase();

  if (
    lower.includes("contract") ||
    lower.includes("agreement") ||
    lower.includes("legal") ||
    lower.includes("cancellation") ||
    lower.includes("service agreement") ||
    lower.includes("payment schedule")
  ) {
    return "Contracts & Agreements";
  }

  if (
    lower.includes("venue") ||
    lower.includes("ceremony") ||
    lower.includes("ballroom") ||
    lower.includes("church") ||
    lower.includes("layout") ||
    lower.includes("floor plan") ||
    lower.includes("timeline") ||
    lower.includes("accessibility") ||
    lower.includes("rain") ||
    lower.includes("backup")
  ) {
    return "Venue & Logistics";
  }

  if (
    lower.includes("photographer") ||
    lower.includes("florist") ||
    lower.includes("caterer") ||
    lower.includes("baker") ||
    lower.includes("vendor") ||
    lower.includes("dj") ||
    lower.includes("officiant") ||
    lower.includes("book") ||
    lower.includes("confirm") ||
    lower.includes("choose") ||
    lower.includes("shortlist")
  ) {
    return "Vendors & Bookings";
  }

  if (
    lower.includes("color") ||
    lower.includes("centerpiece") ||
    lower.includes("floral") ||
    lower.includes("decor") ||
    lower.includes("design") ||
    lower.includes("candle") ||
    lower.includes("linen") ||
    lower.includes("lighting") ||
    lower.includes("altar") ||
    lower.includes("signage")
  ) {
    return "Design & Decor";
  }

  if (
    lower.includes("bar") ||
    lower.includes("menu") ||
    lower.includes("food") ||
    lower.includes("dining") ||
    lower.includes("drink") ||
    lower.includes("signature") ||
    lower.includes("appetizer") ||
    lower.includes("dessert") ||
    lower.includes("snack") ||
    lower.includes("music") ||
    lower.includes("song") ||
    lower.includes("seating")
  ) {
    return "Guest Experience";
  }

  if (
    lower.includes("dress") ||
    lower.includes("attire") ||
    lower.includes("bridesma") ||
    lower.includes("groomsmen") ||
    lower.includes("groom") ||
    lower.includes("hair") ||
    lower.includes("makeup")
  ) {
    return "Attire & Appearance";
  }

  if (
    lower.includes("stationery") ||
    lower.includes("invitation") ||
    lower.includes("save") ||
    lower.includes("address") ||
    lower.includes("rsvp") ||
    lower.includes("guest list")
  ) {
    return "Stationery & Invites";
  }

  if (
    lower.includes("ceremony") ||
    lower.includes("vow") ||
    lower.includes("reading") ||
    lower.includes("officiant") ||
    lower.includes("processional") ||
    lower.includes("ring") ||
    lower.includes("marriage license")
  ) {
    return "Ceremony Details";
  }

  if (
    lower.includes("budget") ||
    lower.includes("payment") ||
    lower.includes("deposit") ||
    lower.includes("invoice") ||
    lower.includes("gratuity") ||
    lower.includes("cost") ||
    lower.includes("allocate")
  ) {
    return "Budget & Payments";
  }

  if (
    lower.includes("approve") ||
    lower.includes("headcount") ||
    lower.includes("final") ||
    lower.includes("decision") ||
    lower.includes("confirm") ||
    lower.includes("approve")
  ) {
    return "Timeline & Decisions";
  }

  return "Other";
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // =========================
  // 11 MONTHS OUT
  // =========================
  {
    key: k("11 months out", "Review service agreement for planner and sign"),
    title: "Review service agreement for planner and sign",
    section: "11 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("11 months out", "Approve payment schedule terms for planner"),
    title: "Approve payment schedule terms for planner",
    section: "11 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("11 months out", "Approve cancellation policy awareness for planner services"),
    title: "Approve cancellation policy awareness for planner services",
    section: "11 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("11 months out", "Provide guest count estimate: Minimum / Target / Maximum"),
    title: "Provide guest count estimate: Minimum / Target / Maximum",
    section: "11 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("11 months out", "Choose dining style: Buffet / Plated / Food stations / Heavy appetizers"),
    title: "Choose dining style: Buffet / Plated / Food stations / Heavy appetizers",
    section: "11 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("11 months out", "Choose open bar style: Full, Beer and Wine, or Signature drinks plus Beer and Wine"),
    title: "Choose open bar style: Full, Beer and Wine, or Signature drinks plus Beer and Wine",
    section: "11 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("11 months out", "Confirm ceremony to ballroom walking path and rain backup plan"),
    title: "Confirm ceremony to ballroom walking path and rain backup plan",
    section: "11 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("11 months out", "Provide correct spelling of names for stationery"),
    title: "Provide correct spelling of names for stationery",
    section: "11 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("11 months out", "Approve stationery suite design at full print scale"),
    title: "Approve stationery suite design at full print scale",
    section: "11 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("11 months out", "Clarify guest accessibility needs: mobility, seating accommodations, sensory needs"),
    title: "Clarify guest accessibility needs: mobility, seating accommodations, sensory needs",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Provide any allergies or dietary restrictions list"),
    title: "Provide any allergies or dietary restrictions list",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Rank menu vibe preference: Comfort, Upscale Comfort, BBQ, Italian, Seasonal"),
    title: "Rank menu vibe preference: Comfort, Upscale Comfort, BBQ, Italian, Seasonal",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Select spirit preferences and flavor direction for 1 to 2 signature drinks"),
    title: "Select spirit preferences and flavor direction for 1 to 2 signature drinks",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Decide bar food timing: Arrival bites, late night snacks, or both"),
    title: "Decide bar food timing: Arrival bites, late night snacks, or both",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Approve sweetheart table or head table plan"),
    title: "Approve sweetheart table or head table plan",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Select altar focal point (arch, florals, candles, none)"),
    title: "Select altar focal point (arch, florals, candles, none)",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Review centerpiece options presented in Google Drive"),
    title: "Review centerpiece options presented in Google Drive",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Select primary centerpiece design and alternate if needed"),
    title: "Select primary centerpiece design and alternate if needed",
    section: "11 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("11 months out", "Shortlist late night snack options (e.g., sliders, pretzels, pizza, tots, churros)"),
    title: "Shortlist late night snack options (e.g., sliders, pretzels, pizza, tots, churros)",
    section: "11 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("11 months out", "Estimate table count to determine quantities for decor items"),
    title: "Estimate table count to determine quantities for decor items",
    section: "11 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("11 months out", "Approve linens: venue standard linens or rental color/texture upgrades"),
    title: "Approve linens: venue standard linens or rental color/texture upgrades",
    section: "11 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("11 months out", "Confirm if pillar candles or open flames are allowed at venue"),
    title: "Confirm if pillar candles or open flames are allowed at venue",
    section: "11 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("11 months out", "Mark outlet locations and DJ table location on layout"),
    title: "Mark outlet locations and DJ table location on layout",
    section: "11 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("11 months out", "Approve Song Request page on wedding website once built"),
    title: "Approve Song Request page on wedding website once built",
    section: "11 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("11 months out", "Add arrival and parking note to website (church and ballroom share lot)"),
    title: "Add arrival and parking note to website (church and ballroom share lot)",
    section: "11 months out",
    owner: "client",
    importance: 2,
  },

  // =========================
  // 10 MONTHS OUT
  // =========================
  {
    key: k("10 months out", "Mail your Save the Dates!"),
    title: "Mail your Save the Dates!",
    section: "10 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("10 months out", "Choose photography or photography plus videography"),
    title: "Choose photography or photography plus videography",
    section: "10 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("10 months out", "Review photographer shortlist and select 2 to 3 top options"),
    title: "Review photographer shortlist and select 2 to 3 top options",
    section: "10 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("10 months out", "Confirm officiant choice with church"),
    title: "Confirm officiant choice with church",
    section: "10 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("10 months out", "Confirm photographer coverage expectations including hours of service"),
    title: "Confirm photographer coverage expectations including hours of service",
    section: "10 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("10 months out", "Review bakery shortlist proposals provided by planner"),
    title: "Review bakery shortlist proposals provided by planner",
    section: "10 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("10 months out", "Begin guest address collection using provided spreadsheet"),
    title: "Begin guest address collection using provided spreadsheet",
    section: "10 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("10 months out", "Discuss videography decision and budget with planner"),
    title: "Discuss videography decision and budget with planner",
    section: "10 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("10 months out", "Decide ceremony length target: 20, 30, or 40 minutes"),
    title: "Decide ceremony length target: 20, 30, or 40 minutes",
    section: "10 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("10 months out", "Decide whether to include readings or a unity moment and specify participants"),
    title: "Decide whether to include readings or a unity moment and specify participants",
    section: "10 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("10 months out", "Identify specific must-have moments or family groupings for planner"),
    title: "Identify specific must-have moments or family groupings for planner",
    section: "10 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("10 months out", "Discuss priorities for photography: Candid, Portrait, Editorial, Documentary"),
    title: "Discuss priorities for photography: Candid, Portrait, Editorial, Documentary",
    section: "10 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("10 months out", "Select photography style preference: True-to-color, Warm, Moody, Editorial"),
    title: "Select photography style preference: True-to-color, Warm, Moody, Editorial",
    section: "10 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("10 months out", "Confirm preferred delivery method for photos: Digital gallery, Prints, Flash drive"),
    title: "Confirm preferred delivery method for photos: Digital gallery, Prints, Flash drive",
    section: "10 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("10 months out", "Upload 3 cake inspiration photos to design board"),
    title: "Upload 3 cake inspiration photos to design board",
    section: "10 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("10 months out", "Select top 2 or 3 cake flavors to test"),
    title: "Select top 2 or 3 cake flavors to test",
    section: "10 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("10 months out", "Select dessert service style: Cake service, Self-serve dessert table, or Combination"),
    title: "Select dessert service style: Cake service, Self-serve dessert table, or Combination",
    section: "10 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("10 months out", "Select display expectations for desserts: Stand, Florals, Signage, or Minimalist"),
    title: "Select display expectations for desserts: Stand, Florals, Signage, or Minimalist",
    section: "10 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("10 months out", "Select addressing style: Printed labels, Handwritten, or Calligraphy upgrade"),
    title: "Select addressing style: Printed labels, Handwritten, or Calligraphy upgrade",
    section: "10 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("10 months out", "Confirm if memorial table or sentimental décor elements will be included"),
    title: "Confirm if memorial table or sentimental décor elements will be included",
    section: "10 months out",
    owner: "client",
    importance: 2,
  },

  // =========================
  // 8–9 MONTHS OUT
  // =========================
  {
    key: k("8-9 months out", "Approve final color palette- this is when it gets LOCKED IN."),
    title: "Approve final color palette- this is when it gets LOCKED IN.",
    section: "8-9 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("8-9 months out", "Review florist shortlist including local and Etsy options"),
    title: "Review florist shortlist including local and Etsy options",
    section: "8-9 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("8-9 months out", "Define floral quantities: bouquets, boutonnieres, corsages, altar, centerpieces"),
    title: "Define floral quantities: bouquets, boutonnieres, corsages, altar, centerpieces",
    section: "8-9 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("8-9 months out", "Decide which items to rent vs purchase: chargers, runners, decor items"),
    title: "Decide which items to rent vs purchase: chargers, runners, decor items",
    section: "8-9 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("8-9 months out", "Provide budget comfort range for rentals and decor"),
    title: "Provide budget comfort range for rentals and decor",
    section: "8-9 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("8-9 months out", "Confirm delivery and setup expectations for floral and décor vendors"),
    title: "Confirm delivery and setup expectations for floral and décor vendors",
    section: "8-9 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("8-9 months out", "Confirm if venue staff or planner sets décor on reception tables"),
    title: "Confirm if venue staff or planner sets décor on reception tables",
    section: "8-9 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("8-9 months out", "Verify timing and logistics for dress arrival and fittings"),
    title: "Verify timing and logistics for dress arrival and fittings",
    section: "8-9 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("8-9 months out", "Confirm candle plan including candle type and table quantities"),
    title: "Confirm candle plan including candle type and table quantities",
    section: "8-9 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("8-9 months out", "Determine guest favors concept and quantity"),
    title: "Determine guest favors concept and quantity",
    section: "8-9 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("8-9 months out", "Confirm cake or dessert section visibility on website if keeping"),
    title: "Confirm cake or dessert section visibility on website if keeping",
    section: "8-9 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("8-9 months out", "Discuss any \"no\" flowers due to allergies or personal dislike"),
    title: 'Discuss any "no" flowers due to allergies or personal dislike',
    section: "8-9 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("8-9 months out", "Approve whether to include florals on altar or aisle"),
    title: "Approve whether to include florals on altar or aisle",
    section: "8-9 months out",
    owner: "client",
    importance: 2,
  },

  // =========================
  // 6–7 MONTHS OUT
  // =========================
  {
    key: k("6-7 months out", "Approve final florist proposal including counts and pricing"),
    title: "Approve final florist proposal including counts and pricing",
    section: "6-7 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("6-7 months out", "MAIL INVITES/RSVPs IN MAY!😍"),
    title: "MAIL INVITES/RSVPs IN MAY!😍",
    section: "6-7 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("6-7 months out", "Review and approve table layout with decor placement notations"),
    title: "Review and approve table layout with decor placement notations",
    section: "6-7 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("6-7 months out", "Finalize vendor deposit tracking and due dates in planner system"),
    title: "Finalize vendor deposit tracking and due dates in planner system",
    section: "6-7 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("6-7 months out", "Finalize bridesmaid and groomsmen attire including delivery timing"),
    title: "Finalize bridesmaid and groomsmen attire including delivery timing",
    section: "6-7 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("6-7 months out", "Provide timeline preferences for speeches and special moments"),
    title: "Provide timeline preferences for speeches and special moments",
    section: "6-7 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("6-7 months out", "Confirm if any rental items require delivery timing coordination"),
    title: "Confirm if any rental items require delivery timing coordination",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Confirm quantities for candles, holders, and table runners"),
    title: "Confirm quantities for candles, holders, and table runners",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Confirm placement of signage throughout reception and ceremony"),
    title: "Confirm placement of signage throughout reception and ceremony",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Confirm music style preferences for reception and transitions"),
    title: "Confirm music style preferences for reception and transitions",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Review initial processional and recessional order with planner"),
    title: "Review initial processional and recessional order with planner",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Finalize guest favors or confirm decision to skip"),
    title: "Finalize guest favors or confirm decision to skip",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Confirm lighting needs for ballroom and altar: uplighting, candles, spotlights"),
    title: "Confirm lighting needs for ballroom and altar: uplighting, candles, spotlights",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Determine escort card or seating board format"),
    title: "Determine escort card or seating board format",
    section: "6-7 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("6-7 months out", "Confirm specific floral ingredients to avoid (allergies or dislikes)"),
    title: "Confirm specific floral ingredients to avoid (allergies or dislikes)",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Review signage concept list with planner and add any desired signs"),
    title: "Review signage concept list with planner and add any desired signs",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Lock any additional decor pieces sourced by planner"),
    title: "Lock any additional decor pieces sourced by planner",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Approve bar menu board wording and design"),
    title: "Approve bar menu board wording and design",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Approve welcome sign wording and design"),
    title: "Approve welcome sign wording and design",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Approve any custom signage wording for dessert table or memory table"),
    title: "Approve any custom signage wording for dessert table or memory table",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Review table numbering or naming theme and style decision"),
    title: "Review table numbering or naming theme and style decision",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Identify who will hold rings and vows before ceremony"),
    title: "Identify who will hold rings and vows before ceremony",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Confirm if there will be a gift table and who handles transport after"),
    title: "Confirm if there will be a gift table and who handles transport after",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("6-7 months out", "Confirm transportation for any elderly or VIP guests if necessary"),
    title: "Confirm transportation for any elderly or VIP guests if necessary",
    section: "6-7 months out",
    owner: "client",
    importance: 2,
  },

  // =========================
  // 4–5 MONTHS OUT
  // =========================
  {
    key: k("4-5 months out", "Invitation mailing completed and RSVP deadline confirmed"),
    title: "Invitation mailing completed and RSVP deadline confirmed",
    section: "4-5 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("4-5 months out", "Approve final rental invoice if applicable"),
    title: "Approve final rental invoice if applicable",
    section: "4-5 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("4-5 months out", "Provide any song restrictions or do-not-play list"),
    title: "Provide any song restrictions or do-not-play list",
    section: "4-5 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("4-5 months out", "Confirm desired late night snack selection and serving time"),
    title: "Confirm desired late night snack selection and serving time",
    section: "4-5 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("4-5 months out", "Approve DJ announcements or no-announcements style"),
    title: "Approve DJ announcements or no-announcements style",
    section: "4-5 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("4-5 months out", "Confirm reception formalities: first dance, parent dances, speeches, cake cut"),
    title: "Confirm reception formalities: first dance, parent dances, speeches, cake cut",
    section: "4-5 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("4-5 months out", "Confirm if bouquet and garter toss will or will not be included"),
    title: "Confirm if bouquet and garter toss will or will not be included",
    section: "4-5 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("4-5 months out", "Review photographer must-have list and add specifics as needed"),
    title: "Review photographer must-have list and add specifics as needed",
    section: "4-5 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("4-5 months out", "Review dessert table flow and plating expectations"),
    title: "Review dessert table flow and plating expectations",
    section: "4-5 months out",
    owner: "client",
    importance: 2,
  },
  {
    key: k("4-5 months out", "Approve floral mock-ups if provided"),
    title: "Approve floral mock-ups if provided",
    section: "4-5 months out",
    owner: "client",
    importance: 2,
  },

  // =========================
  // 2–3 MONTHS OUT
  // =========================
  {
    key: k("2-3 months out", "Approve full day-of timeline and receive PDF from planner"),
    title: "Approve full day-of timeline and receive PDF from planner",
    section: "2-3 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("2-3 months out", "Confirm final headcount and submit to caterer"),
    title: "Confirm final headcount and submit to caterer",
    section: "2-3 months out",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("2-3 months out", "Confirm final seating chart structure: table numbers or names"),
    title: "Confirm final seating chart structure: table numbers or names",
    section: "2-3 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("2-3 months out", "Review timeline second draft focusing on ceremony and reception flow"),
    title: "Review timeline second draft focusing on ceremony and reception flow",
    section: "2-3 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("2-3 months out", "Confirm delivery and pickup times for all rentals"),
    title: "Confirm delivery and pickup times for all rentals",
    section: "2-3 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("2-3 months out", "Provide family photo grouping list to planner"),
    title: "Provide family photo grouping list to planner",
    section: "2-3 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("2-3 months out", "Provide planner with final list of who is getting ready where and when"),
    title: "Provide planner with final list of who is getting ready where and when",
    section: "2-3 months out",
    owner: "client",
    importance: 4,
  },
  {
    key: k("2-3 months out", "Confirm hair and makeup trial date and desired look direction"),
    title: "Confirm hair and makeup trial date and desired look direction",
    section: "2-3 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("2-3 months out", "Approve dance floor opening plan and music transition plan"),
    title: "Approve dance floor opening plan and music transition plan",
    section: "2-3 months out",
    owner: "client",
    importance: 3,
  },
  {
    key: k("2-3 months out", "Confirm cake table setup: linens, tools, plates, signage"),
    title: "Confirm cake table setup: linens, tools, plates, signage",
    section: "2-3 months out",
    owner: "client",
    importance: 2,
  },

  // =========================
  // FINAL TWO MONTHS
  // =========================
  {
    key: k("Final two months", "Provide final headcounts 6 weeks before your big day to vendors"),
    title: "Provide final headcounts 6 weeks before your big day to vendors",
    section: "Final two months",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("Final two months", "Finalize all RSVP entries and communicate outstanding responses"),
    title: "Finalize all RSVP entries and communicate outstanding responses",
    section: "Final two months",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("Final two months", "Confirm all vendor arrival times and access details with planner"),
    title: "Confirm all vendor arrival times and access details with planner",
    section: "Final two months",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("Final two months", "Schedule marriage license appointment (no more than 30 days out - or you will have to do it again)"),
    title: "Schedule marriage license appointment (no more than 30 days out - or you will have to do it again)",
    section: "Final two months",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("Final two months", "Confirm final headcount week of wedding"),
    title: "Confirm final headcount week of wedding",
    section: "Final two months",
    owner: "client",
    importance: 5,
    milestone: true,
    confetti: true,
    pushOnActivate: true,
  },
  {
    key: k("Final two months", "Finalize seating assignments and VIP tables"),
    title: "Finalize seating assignments and VIP tables",
    section: "Final two months",
    owner: "client",
    importance: 4,
  },
  {
    key: k("Final two months", "Review and approve final photography timeline"),
    title: "Review and approve final photography timeline",
    section: "Final two months",
    owner: "client",
    importance: 4,
  },
  {
    key: k("Final two months", "Confirm family photo groupings and timing with planner and photographer"),
    title: "Confirm family photo groupings and timing with planner and photographer",
    section: "Final two months",
    owner: "client",
    importance: 4,
  },
  {
    key: k("Final two months", "Complete vendor gratuity planning with guidance from planner"),
    title: "Complete vendor gratuity planning with guidance from planner",
    section: "Final two months",
    owner: "client",
    importance: 4,
  },
  {
    key: k("Final two months", "Provide emergency contact person for planner day-of communication"),
    title: "Provide emergency contact person for planner day-of communication",
    section: "Final two months",
    owner: "client",
    importance: 4,
  },
  {
    key: k("Final two months", "Review final run-of-show details with planner"),
    title: "Review final run-of-show details with planner",
    section: "Final two months",
    owner: "client",
    importance: 4,
  },
  {
    key: k("Final two months", "Approve all signage final proofs including bar and seating"),
    title: "Approve all signage final proofs including bar and seating",
    section: "Final two months",
    owner: "client",
    importance: 3,
  },
  {
    key: k("Final two months", "Submit any last minute menu adjustments to planner"),
    title: "Submit any last minute menu adjustments to planner",
    section: "Final two months",
    owner: "client",
    importance: 3,
  },
  {
    key: k("Final two months", "Confirm rehearsal attendance and participants"),
    title: "Confirm rehearsal attendance and participants",
    section: "Final two months",
    owner: "client",
    importance: 3,
  },
  {
    key: k("Final two months", "Review final wedding day packing list provided by planner"),
    title: "Review final wedding day packing list provided by planner",
    section: "Final two months",
    owner: "client",
    importance: 3,
  },
  {
    key: k("Final two months", "Deliver vows and any items needed for ceremony to planner"),
    title: "Deliver vows and any items needed for ceremony to planner",
    section: "Final two months",
    owner: "client",
    importance: 3,
  },
  {
    key: k("Final two months", "Deliver rings to planner or best man"),
    title: "Deliver rings to planner or best man",
    section: "Final two months",
    owner: "client",
    importance: 3,
  },
  {
    key: k("Final two months", "Deliver printed vows and ceremony items as required"),
    title: "Deliver printed vows and ceremony items as required",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
  {
    key: k("Final two months", "Drop off personal decor items to planner on scheduled date"),
    title: "Drop off personal decor items to planner on scheduled date",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
  {
    key: k("Final two months", "Attend rehearsal and rehearsal dinner"),
    title: "Attend rehearsal and rehearsal dinner",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
  {
    key: k("Final two months", "Prepare vendor gratuity envelopes and list who distributes them"),
    title: "Prepare vendor gratuity envelopes and list who distributes them",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
  {
    key: k("Final two months", "Confirm reserved seating signs for ceremony if needed"),
    title: "Confirm reserved seating signs for ceremony if needed",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
  {
    key: k("Final two months", "Confirm church rules for décor placement and removal timing"),
    title: "Confirm church rules for décor placement and removal timing",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
  {
    key: k("Final two months", "Confirm end-of-night plan for personal items and gifts"),
    title: "Confirm end-of-night plan for personal items and gifts",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
  {
    key: k("Final two months", "Confirm who gathers personal items and décor after reception"),
    title: "Confirm who gathers personal items and décor after reception",
    section: "Final two months",
    owner: "client",
    importance: 2,
  },
];
