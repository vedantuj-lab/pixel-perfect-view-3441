export type StageId =
  | "discover"
  | "position"
  | "dna"
  | "name"
  | "challenge"
  | "voice"
  | "visualize"
  | "consistency"
  | "launch"
  | "export";

export type StageDef = {
  id: StageId;
  label: string;
  short: string;
  purpose: string;
  /** Brand DNA keys this stage reads from earlier stages */
  inherits: string[];
  /** Brand DNA keys this stage writes */
  produces: string[];
  /** JSON shape the AI must return */
  shape: string;
  instruction: string;
  ai: boolean;
};

export const STAGES: StageDef[] = [
  {
    id: "discover",
    label: "Discover",
    short: "01",
    purpose: "Interrogate the rough idea and extract the real problem, audience and constraints.",
    inherits: [],
    produces: [
      "problem",
      "targetAudience",
      "secondaryAudience",
      "painPoints",
      "context",
      "goals",
      "constraints",
      "openQuestions",
    ],
    shape: `{"problem":"","targetAudience":"","secondaryAudience":"","painPoints":["",""],"context":"","goals":["",""],"constraints":["",""],"openQuestions":["",""]}`,
    instruction:
      "Read the founder's rough idea and any optional fields. Infer the underlying problem precisely rather than restating the idea. Name a specific primary audience (not 'everyone'), a plausible secondary audience, 3-5 concrete pain points, the market context, 2-4 goals, 2-4 real constraints, and 2-3 questions still unanswered.",
    ai: true,
  },
  {
    id: "position",
    label: "Position",
    short: "02",
    purpose: "Fix where this brand sits against real alternatives.",
    inherits: ["problem", "targetAudience", "painPoints", "context", "constraints"],
    produces: ["valueProposition", "category", "differentiator", "competitiveAlternatives", "positioningStatement"],
    shape: `{"valueProposition":"","category":"","differentiator":"","competitiveAlternatives":[{"name":"","why":""}],"positioningStatement":""}`,
    instruction:
      "Using only the Discover findings, write a value proposition in plain language, name the category the founder is actually competing in, state one sharp differentiator, list 3 competitive alternatives (including 'doing nothing' when honest), and write a single positioning statement of the form 'For <audience> who <need>, <brand> is the <category> that <differentiator>.'",
    ai: true,
  },
  {
    id: "dna",
    label: "Brand DNA",
    short: "03",
    purpose: "Write the personality and emotional contract every later stage must obey.",
    inherits: ["targetAudience", "valueProposition", "category", "differentiator", "context"],
    produces: ["brandPersonality", "traitsToAvoid", "emotionalGoal", "brandPromise"],
    shape: `{"brandPersonality":["",""],"traitsToAvoid":["",""],"emotionalGoal":"","brandPromise":""}`,
    instruction:
      "Derive 4-5 personality traits that follow from the positioning (not generic adjectives like 'innovative'), 3 traits to actively avoid with a reason implied, one emotional goal describing how the audience should feel, and a one-line brand promise.",
    ai: true,
  },
  {
    id: "name",
    label: "Name",
    short: "04",
    purpose: "Generate names that survive the DNA constraints.",
    inherits: ["category", "differentiator", "brandPersonality", "traitsToAvoid", "emotionalGoal"],
    produces: ["namingTerritory", "nameCandidates", "selectedName", "tagline"],
    shape: `{"namingTerritory":"","nameCandidates":[{"name":"","rationale":"","risk":""}],"selectedName":"","tagline":""}`,
    instruction:
      "Name the naming territory you are working in. Produce exactly 5 candidates; each rationale must reference a specific personality trait or the differentiator, and each risk must be honest. Then pick the strongest as selectedName and write a tagline of under 8 words that matches the emotional goal.",
    ai: true,
  },
  {
    id: "challenge",
    label: "Challenge",
    short: "05",
    purpose: "Attack the work as a sceptical strategist before a customer does.",
    inherits: ["positioningStatement", "differentiator", "selectedName", "tagline", "brandPersonality", "valueProposition"],
    produces: ["critiques", "weakestLink", "revisedTagline", "revisedDifferentiator"],
    shape: `{"critiques":[{"target":"","issue":"","fix":""}],"weakestLink":"","revisedTagline":"","revisedDifferentiator":""}`,
    instruction:
      "Be genuinely critical. Produce 4 critiques, each targeting a named field produced earlier (e.g. 'tagline', 'differentiator', 'positioningStatement'), stating why it is generic, unbelievable or interchangeable, plus a concrete fix. Identify the single weakest link, then supply an improved tagline and an improved differentiator.",
    ai: true,
  },
  {
    id: "voice",
    label: "Voice",
    short: "06",
    purpose: "Turn personality into a usable writing register.",
    inherits: ["brandPersonality", "traitsToAvoid", "emotionalGoal", "targetAudience", "revisedTagline"],
    produces: ["brandVoice", "messagingPrinciples", "doSay", "dontSay", "sampleCopy"],
    shape: `{"brandVoice":"","messagingPrinciples":["",""],"doSay":["",""],"dontSay":["",""],"sampleCopy":{"headline":"","subhead":"","button":""}}`,
    instruction:
      "Describe the voice in one sentence as a register, not a vibe. Give 3-4 messaging principles, 4 phrases to say, 4 phrases to never say (drawn from traitsToAvoid), and sample copy that demonstrates the voice.",
    ai: true,
  },
  {
    id: "visualize",
    label: "Visualize",
    short: "07",
    purpose: "Translate the DNA into a visual system.",
    inherits: ["brandPersonality", "emotionalGoal", "category", "selectedName", "brandVoice"],
    produces: ["visualMood", "colorDirection", "typographyDirection", "imageryDirection", "logoIdea"],
    shape: `{"visualMood":"","colorDirection":{"rationale":"","palette":[{"name":"","hex":"#000000","use":""}]},"typographyDirection":{"display":"","body":"","rationale":""},"imageryDirection":"","logoIdea":""}`,
    instruction:
      "Describe the visual mood, then a palette of exactly 5 colours with real hex values chosen to express the personality (say what each is for), a display and body typeface pairing with a rationale, an imagery direction, and one concrete logo idea. Avoid defaulting to purple gradients unless the personality demands it.",
    ai: true,
  },
  {
    id: "consistency",
    label: "Consistency",
    short: "08",
    purpose: "Audit the whole Brand DNA for contradictions.",
    inherits: [
      "problem",
      "targetAudience",
      "positioningStatement",
      "brandPersonality",
      "selectedName",
      "revisedTagline",
      "brandVoice",
      "visualMood",
      "colorDirection",
    ],
    produces: ["consistencyScore", "checks", "contradictions", "fixQueue"],
    shape: `{"consistencyScore":0,"checks":[{"field":"","verdict":"aligned","note":""}],"contradictions":["",""],"fixQueue":["",""]}`,
    instruction:
      "Audit every inherited field against the emotional goal and audience. Score alignment 0-100 honestly (do not default to 90+). Each check's verdict must be one of aligned, weak or conflicting, with a specific note. List any contradictions and an ordered fix queue.",
    ai: true,
  },
  {
    id: "launch",
    label: "Launch Kit",
    short: "09",
    purpose: "Produce launch-ready messaging built from the finished DNA.",
    inherits: [
      "selectedName",
      "revisedTagline",
      "positioningStatement",
      "brandVoice",
      "doSay",
      "targetAudience",
      "valueProposition",
    ],
    produces: ["launchMessaging", "elevatorPitch", "socialBio", "launchPosts", "emailSnippet", "faq"],
    shape: `{"launchMessaging":"","elevatorPitch":"","socialBio":"","launchPosts":[{"channel":"","copy":""}],"emailSnippet":{"subject":"","body":""},"faq":[{"q":"","a":""}]}`,
    instruction:
      "Write launch assets strictly in the established voice: a launch message, a 30-second elevator pitch, a social bio under 160 characters, 3 launch posts for different channels, a launch email, and 3 FAQs that answer the objections raised during Challenge.",
    ai: true,
  },
  {
    id: "export",
    label: "Export",
    short: "10",
    purpose: "Assemble everything into a downloadable brand book.",
    inherits: ["*"],
    produces: [],
    shape: "",
    instruction: "",
    ai: false,
  },
];

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s])) as Record<StageId, StageDef>;

export const FIELD_LABELS: Record<string, string> = {
  problem: "Problem",
  targetAudience: "Target audience",
  secondaryAudience: "Secondary audience",
  painPoints: "Pain points",
  context: "Context",
  goals: "Goals",
  constraints: "Constraints",
  openQuestions: "Open questions",
  valueProposition: "Value proposition",
  category: "Category",
  differentiator: "Differentiator",
  competitiveAlternatives: "Competitive alternatives",
  positioningStatement: "Positioning statement",
  brandPersonality: "Brand personality",
  traitsToAvoid: "Traits to avoid",
  emotionalGoal: "Emotional goal",
  brandPromise: "Brand promise",
  namingTerritory: "Naming territory",
  nameCandidates: "Name candidates",
  selectedName: "Selected name",
  tagline: "Tagline",
  critiques: "Critiques",
  weakestLink: "Weakest link",
  revisedTagline: "Revised tagline",
  revisedDifferentiator: "Revised differentiator",
  brandVoice: "Brand voice",
  messagingPrinciples: "Messaging principles",
  doSay: "Do say",
  dontSay: "Never say",
  sampleCopy: "Sample copy",
  visualMood: "Visual mood",
  colorDirection: "Colour direction",
  typographyDirection: "Typography direction",
  imageryDirection: "Imagery direction",
  logoIdea: "Logo idea",
  consistencyScore: "Consistency score",
  checks: "Checks",
  contradictions: "Contradictions",
  fixQueue: "Fix queue",
  launchMessaging: "Launch messaging",
  elevatorPitch: "Elevator pitch",
  socialBio: "Social bio",
  launchPosts: "Launch posts",
  emailSnippet: "Launch email",
  faq: "FAQ",
};

export type BrandDna = Record<string, unknown>;

export function completionPercent(completed: string[]): number {
  return Math.round((completed.filter((c) => c !== "export").length / 9) * 100);
}

export function nextStage(completed: string[]): StageId {
  const pending = STAGES.find((s) => !completed.includes(s.id));
  return (pending?.id ?? "export") as StageId;
}
