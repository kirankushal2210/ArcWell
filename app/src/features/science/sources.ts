// Sources (D69): the papers behind Arcwell's rules. Each entry was checked on PubMed (or the
// publisher for EFSA opinions) before it was added; `finding` is what the app may claim from it.
// Add a source here only after checking it; never cite from memory.

export type Topic = "training" | "nutrition" | "recovery";

export type Source = {
  id: string;
  topic: Topic;
  /** "Schoenfeld BJ, et al." */
  authors: string;
  year: number;
  title: string;
  journal: string;
  /** "35(11):1073–1082" */
  ref: string;
  pmid?: string;
  doi?: string;
  /** One plain sentence: what Arcwell takes from it. */
  finding: string;
  /** Lower-quality evidence (surveys, consensus) is labelled as such. */
  note?: string;
};

export const SOURCES: Record<string, Source> = {
  schoenfeld2017volume: {
    id: "schoenfeld2017volume",
    topic: "training",
    authors: "Schoenfeld BJ, Ogborn D, Krieger JW",
    year: 2017,
    title:
      "Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis",
    journal: "J Sports Sci",
    ref: "35(11):1073–1082",
    pmid: "27433992",
    doi: "10.1080/02640414.2016.1210197",
    finding:
      "Each extra weekly set per muscle was linked to a little more muscle growth; 10 or more sets averaged more growth than fewer than 5.",
    note: "The three-way comparison was a trend, not a firm result, and no upper limit was found.",
  },
  pelland2026: {
    id: "pelland2026",
    topic: "training",
    authors: "Pelland JC, et al.",
    year: 2026,
    title:
      "The resistance training dose response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gains",
    journal: "Sports Med",
    ref: "56(2):481–505",
    pmid: "41343037",
    doi: "10.1007/s40279-025-02344-w",
    finding:
      "More weekly sets gave more muscle and strength with diminishing returns; counting helper muscles as half a set fit the data best; frequency helped strength more than growth.",
  },
  schoenfeld2019frequency: {
    id: "schoenfeld2019frequency",
    topic: "training",
    authors: "Schoenfeld BJ, Grgic J, Krieger J",
    year: 2019,
    title:
      "How many times per week should a muscle be trained to maximize muscle hypertrophy? A systematic review and meta-analysis",
    journal: "J Sports Sci",
    ref: "37(11):1286–1295",
    pmid: "30558493",
    doi: "10.1080/02640414.2018.1555906",
    finding:
      "With the same weekly sets, training a muscle more often made no clear difference to growth.",
  },
  schoenfeld2017load: {
    id: "schoenfeld2017load",
    topic: "training",
    authors: "Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW",
    year: 2017,
    title:
      "Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis",
    journal: "J Strength Cond Res",
    ref: "31(12):3508–3523",
    pmid: "28834797",
    doi: "10.1519/JSC.0000000000002200",
    finding:
      "Light and heavy loads built similar muscle when sets were taken to failure; heavy loads built more maximal strength.",
  },
  refalo2023: {
    id: "refalo2023",
    topic: "training",
    authors: "Refalo MC, et al.",
    year: 2023,
    title:
      "Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic review with meta-analysis",
    journal: "Sports Med",
    ref: "53(3):649–665",
    pmid: "36334240",
    doi: "10.1007/s40279-022-01784-y",
    finding:
      "Going all the way to failure gave at most a trivial extra growth benefit over stopping a few reps short.",
  },
  robinson2024: {
    id: "robinson2024",
    topic: "training",
    authors: "Robinson ZP, et al.",
    year: 2024,
    title:
      "Exploring the dose-response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy: a series of meta-regressions",
    journal: "Sports Med",
    ref: "54(9):2209–2231",
    pmid: "38970765",
    doi: "10.1007/s40279-024-02069-2",
    finding:
      "Growth rose as sets ended closer to failure, while strength gains were similar across a wide range of reps in reserve.",
    note: "Exploratory analysis; reps in reserve were estimated, not measured.",
  },
  schoenfeld2016rest: {
    id: "schoenfeld2016rest",
    topic: "training",
    authors: "Schoenfeld BJ, et al.",
    year: 2016,
    title:
      "Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men",
    journal: "J Strength Cond Res",
    ref: "30(7):1805–1812",
    pmid: "26605807",
    doi: "10.1519/JSC.0000000000001272",
    finding:
      "One trial in trained men found 3-minute rests gave more strength and thigh growth than 1-minute rests.",
    note: "A single small trial.",
  },
  helms2016rir: {
    id: "helms2016rir",
    topic: "training",
    authors: "Helms ER, et al.",
    year: 2016,
    title:
      "Application of the repetitions in reserve-based rating of perceived exertion scale for resistance training",
    journal: "Strength Cond J",
    ref: "38(4):42–49",
    pmid: "27531969",
    doi: "10.1519/SSC.0000000000000218",
    finding:
      "Describes rating effort by reps in reserve: how many more good reps you could have done.",
    note: "Describes the method; not an outcome study.",
  },
  rogerson2024deload: {
    id: "rogerson2024deload",
    topic: "training",
    authors: "Rogerson D, et al.",
    year: 2024,
    title:
      "Deloading practices in strength and physique sports: a cross-sectional survey",
    journal: "Sports Med Open",
    ref: "10(1):26",
    pmid: "38499934",
    doi: "10.1186/s40798-024-00691-y",
    finding:
      "Strength and physique athletes reported a deload of about a week every 5 to 6 weeks.",
    note: "Survey of what athletes do, not proof that it works.",
  },
  bell2023deload: {
    id: "bell2023deload",
    topic: "training",
    authors: "Bell L, et al.",
    year: 2023,
    title:
      "Integrating deloading into strength and physique sports training programmes: an international Delphi consensus approach",
    journal: "Sports Med Open",
    ref: "9(1):87",
    pmid: "37730925",
    doi: "10.1186/s40798-023-00633-0",
    finding:
      "Coaches agreed a deload is a planned period of lighter training to shed fatigue and prepare for what's next.",
    note: "Expert consensus, not trial evidence.",
  },
  morton2018: {
    id: "morton2018",
    topic: "nutrition",
    authors: "Morton RW, et al.",
    year: 2018,
    title:
      "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults",
    journal: "Br J Sports Med",
    ref: "52(6):376–384",
    pmid: "28698222",
    doi: "10.1136/bjsports-2017-097608",
    finding:
      "Extra protein added muscle and strength; gains levelled off around 1.6 g per kg a day, with up to about 2.2 g suggested for those wanting the most.",
    note: "The levelling-off point is an estimate with a wide range.",
  },
  jager2017: {
    id: "jager2017",
    topic: "nutrition",
    authors: "Jäger R, et al.",
    year: 2017,
    title:
      "International Society of Sports Nutrition Position Stand: protein and exercise",
    journal: "J Int Soc Sports Nutr",
    ref: "14:20",
    pmid: "28642676",
    doi: "10.1186/s12970-017-0177-8",
    finding:
      "1.4 to 2.0 g protein per kg a day suits most people who exercise; more may help keep muscle while dieting.",
  },
  helms2014: {
    id: "helms2014",
    topic: "nutrition",
    authors: "Helms ER, Aragon AA, Fitschen PJ",
    year: 2014,
    title:
      "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation",
    journal: "J Int Soc Sports Nutr",
    ref: "11:20",
    pmid: "24864135",
    doi: "10.1186/1550-2783-11-20",
    finding:
      "Recommends losing about 0.5–1% of bodyweight a week to keep muscle while dieting.",
    note: "Expert recommendations from a review.",
  },
  garthe2011: {
    id: "garthe2011",
    topic: "nutrition",
    authors: "Garthe I, et al.",
    year: 2011,
    title:
      "Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes",
    journal: "Int J Sport Nutr Exerc Metab",
    ref: "21(2):97–104",
    pmid: "21558571",
    doi: "10.1123/ijsnem.21.2.97",
    finding:
      "Athletes losing 0.7% of bodyweight a week gained lean mass; those losing 1.4% a week didn't.",
    note: "One small trial.",
  },
  iraki2019: {
    id: "iraki2019",
    topic: "nutrition",
    authors: "Iraki J, Fitschen P, Espinar S, Helms E",
    year: 2019,
    title:
      "Nutrition recommendations for bodybuilders in the off-season: a narrative review",
    journal: "Sports (Basel)",
    ref: "7(7):154",
    pmid: "31247944",
    doi: "10.3390/sports7070154",
    finding:
      "Suggests gaining about 0.25–0.5% of bodyweight a week on a small surplus, slower for advanced lifters.",
    note: "Expert recommendations from a review.",
  },
  mifflin1990: {
    id: "mifflin1990",
    topic: "nutrition",
    authors: "Mifflin MD, et al.",
    year: 1990,
    title:
      "A new predictive equation for resting energy expenditure in healthy individuals",
    journal: "Am J Clin Nutr",
    ref: "51(2):241–247",
    pmid: "2305711",
    doi: "10.1093/ajcn/51.2.241",
    finding:
      "The equation Arcwell uses to estimate the energy you burn at rest from weight, height, age and sex.",
  },
  efsa2010water: {
    id: "efsa2010water",
    topic: "nutrition",
    authors: "EFSA Panel on Dietetic Products, Nutrition and Allergies",
    year: 2010,
    title: "Scientific opinion on dietary reference values for water",
    journal: "EFSA Journal",
    ref: "8(3):1459",
    doi: "10.2903/j.efsa.2010.1459",
    finding:
      "About 2.0 L a day for women and 2.5 L for men in total, counting water from food as well as drinks.",
  },
  efsa2010fibre: {
    id: "efsa2010fibre",
    topic: "nutrition",
    authors: "EFSA Panel on Dietetic Products, Nutrition and Allergies",
    year: 2010,
    title:
      "Scientific opinion on dietary reference values for carbohydrates and dietary fibre",
    journal: "EFSA Journal",
    ref: "8(3):1462",
    doi: "10.2903/j.efsa.2010.1462",
    finding: "25 g of fibre a day is adequate for healthy digestion in adults.",
  },
  reynolds2019: {
    id: "reynolds2019",
    topic: "nutrition",
    authors: "Reynolds A, et al.",
    year: 2019,
    title:
      "Carbohydrate quality and human health: a series of systematic reviews and meta-analyses",
    journal: "Lancet",
    ref: "393(10170):434–445",
    pmid: "30638909",
    doi: "10.1016/S0140-6736(18)31809-9",
    finding:
      "Eating 25–29 g of fibre a day was linked to lower risk of heart disease, type 2 diabetes and some cancers.",
    note: "Mostly observational data.",
  },
  hirshkowitz2015: {
    id: "hirshkowitz2015",
    topic: "recovery",
    authors: "Hirshkowitz M, et al.",
    year: 2015,
    title:
      "National Sleep Foundation's sleep time duration recommendations: methodology and results summary",
    journal: "Sleep Health",
    ref: "1(1):40–43",
    pmid: "29073412",
    doi: "10.1016/j.sleh.2014.12.010",
    finding: "Adults are recommended 7 to 9 hours of sleep a night.",
  },
  watson2015: {
    id: "watson2015",
    topic: "recovery",
    authors: "Watson NF, et al.",
    year: 2015,
    title:
      "Recommended amount of sleep for a healthy adult: a joint consensus statement of the AASM and SRS",
    journal: "Sleep",
    ref: "38(6):843–844",
    pmid: "26039963",
    doi: "10.5665/sleep.4716",
    finding: "Adults should regularly sleep 7 or more hours a night.",
  },
  craven2022: {
    id: "craven2022",
    topic: "recovery",
    authors: "Craven J, et al.",
    year: 2022,
    title:
      "Effects of acute sleep loss on physical performance: a systematic and meta-analytical review",
    journal: "Sports Med",
    ref: "52(11):2669–2690",
    pmid: "35708888",
    doi: "10.1007/s40279-022-01706-y",
    finding:
      "Losing sleep cut next-day performance by about 8% on average, most consistently after a late bedtime; results varied a lot.",
  },
  fullagar2015: {
    id: "fullagar2015",
    topic: "recovery",
    authors: "Fullagar HH, et al.",
    year: 2015,
    title:
      "Sleep and athletic performance: the effects of sleep loss on exercise performance, and physiological and cognitive responses to exercise",
    journal: "Sports Med",
    ref: "45(2):161–186",
    pmid: "25315456",
    doi: "10.1007/s40279-014-0260-0",
    finding:
      "Reviews how sleep loss affects training and recovery; the evidence on performance was mixed at the time.",
    note: "Background review, no pooled numbers.",
  },
};

export const shortCite = (s: Source) =>
  s.authors.startsWith("EFSA")
    ? `EFSA, ${s.journal} ${s.year}`
    : `${s.authors.split(",")[0].replace(/ et al\.$/, "")} et al., ${s.journal} ${s.year}`;

export const TOPIC_LABEL: Record<Topic, string> = {
  training: "Training",
  nutrition: "Nutrition",
  recovery: "Recovery and sleep",
};
