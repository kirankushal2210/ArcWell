// Sources (D69): the papers behind Arcwell's rules. Each entry was checked on PubMed (or the
// publisher for EFSA opinions) before it was added; `finding` is what the app may claim from it.
// Add a source here only after checking it; never cite from memory.

export type Topic = "training" | "nutrition" | "recovery" | "habits";

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
  // ───────────────────────────── Habits / light / sleep ─────────────────────────────

  gooley2011: {
    id: "gooley2011",
    topic: "habits",
    authors: "Gooley JJ, Chamberlain K, Smith KA, et al.",
    year: 2011,
    title:
      "Exposure to room light before bedtime suppresses melatonin onset and shortens melatonin duration in humans",
    journal: "J Clin Endocrinol Metab",
    ref: "96(3):E463–E472",
    pmid: "21193540",
    doi: "10.1210/jc.2010-2098",
    finding:
      "Compared with dim light, ordinary room light (under 200 lux) in the 8 hours before bed delayed the start of melatonin in 99% of people and cut its duration by about 90 minutes.",
    note: "Look-back analysis of lab studies in 116 healthy 18–30-year-olds; measures melatonin, not sleep itself.",
  },
  chang2015: {
    id: "chang2015",
    topic: "recovery",
    authors: "Chang AM, Aeschbach D, Duffy JF, Czeisler CA",
    year: 2015,
    title:
      "Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness",
    journal: "Proc Natl Acad Sci U S A",
    ref: "112(4):1232–1237",
    pmid: "25535358",
    doi: "10.1073/pnas.1418490112",
    finding:
      "Reading on a light-emitting e-reader before bed, instead of a printed book, meant taking longer to fall asleep, less melatonin, a later body clock and lower alertness the next morning.",
    note: "Small inpatient lab study; the abstract gives no sample size or effect sizes.",
  },
  leproult2001: {
    id: "leproult2001",
    topic: "habits",
    authors: "Leproult R, Colecchia EF, L'Hermite-Balériaux M, Van Cauter E",
    year: 2001,
    title:
      "Transition from dim to bright light in the morning induces an immediate elevation of cortisol levels",
    journal: "J Clin Endocrinol Metab",
    ref: "86(1):151–157",
    pmid: "11231993",
    doi: "10.1210/jcem.86.1.7102",
    finding:
      "Switching from dim to bright light early in the morning (5–8 am) raised cortisol by more than 50% straight away and cut melatonin; the same light in the afternoon had no effect.",
    note: "8 healthy men kept awake for 36 hours, so not a normal morning after sleep.",
  },
  petrowski2019: {
    id: "petrowski2019",
    topic: "habits",
    authors: "Petrowski K, Schmalbach B, Niedling M, Stalder T",
    year: 2019,
    title:
      "The effects of post-awakening light exposure on the cortisol awakening response in healthy male individuals",
    journal: "Psychoneuroendocrinology",
    ref: "108:28–34",
    pmid: "31220690",
    doi: "10.1016/j.psyneuen.2019.05.016",
    finding:
      "An hour of bright light right after waking gave a bigger morning cortisol rise than dim light, and blue or green light gave a bigger rise than red.",
    note: "Healthy men only, in a sleep lab; the abstract reports statistics, not cortisol amounts or sample size.",
  },
  windred2024: {
    id: "windred2024",
    topic: "recovery",
    authors: "Windred DP, Burns AC, Lane JM, et al.",
    year: 2024,
    title:
      "Sleep regularity is a stronger predictor of mortality risk than sleep duration: a prospective cohort study",
    journal: "Sleep",
    ref: "47(1):zsad253",
    pmid: "37738616",
    doi: "10.1093/sleep/zsad253",
    finding:
      "In 60,977 UK Biobank adults, people with more regular sleep times had a 20–48% lower risk of death than the least regular fifth, and regularity predicted death better than sleep length.",
    note: "Observational (cannot show cause); mostly older adults (mean age 63) with about a week of wrist-sensor data.",
  },
  drake2013: {
    id: "drake2013",
    topic: "recovery",
    authors: "Drake C, Roehrs T, Shambroom J, Roth T",
    year: 2013,
    title:
      "Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed",
    journal: "J Clin Sleep Med",
    ref: "9(11):1195–1200",
    pmid: "24235903",
    doi: "10.5664/jcsm.3170",
    finding:
      "400 mg of caffeine taken at bedtime, 3 hours or even 6 hours before bed disturbed sleep compared with a placebo, supporting no large caffeine doses in the 6 hours before bed.",
    note: "One high fixed dose (400 mg); small home study, the abstract gives no sample size.",
  },
  gardiner2023: {
    id: "gardiner2023",
    topic: "recovery",
    authors: "Gardiner C, Weakley J, Burke LM, et al.",
    year: 2023,
    title:
      "The effect of caffeine on subsequent sleep: a systematic review and meta-analysis",
    journal: "Sleep Med Rev",
    ref: "69:101764",
    pmid: "36870101",
    doi: "10.1016/j.smrv.2023.101764",
    finding:
      "Across 24 studies caffeine cut sleep by 45 minutes and deep sleep by about 11 minutes; to avoid losing sleep, a coffee (107 mg) should be at least 8.8 hours before bed and a standard pre-workout (217.5 mg) at least 13.2 hours before.",
    note: "The hour cut-offs come from a model built on pooled studies, not from a trial testing those times.",
  },
  ebrahim2013: {
    id: "ebrahim2013",
    topic: "recovery",
    authors: "Ebrahim IO, Shapiro CM, Williams AJ, Fenwick PB",
    year: 2013,
    title: "Alcohol and sleep I: effects on normal sleep",
    journal: "Alcohol Clin Exp Res",
    ref: "37(4):539–549",
    pmid: "23347102",
    doi: "10.1111/acer.12006",
    finding:
      "At every dose, alcohol helps you fall asleep faster but breaks up sleep in the second half of the night; at moderate and high doses it also cuts dream (REM) sleep.",
    note: "Narrative review of studies in healthy volunteers, not a meta-analysis.",
  },
  datta2021: {
    id: "datta2021",
    topic: "recovery",
    authors: "Datta K, Tripathi M, Verma M, et al.",
    year: 2021,
    title:
      "Yoga nidra practice shows improvement in sleep in patients with chronic insomnia: a randomized controlled trial",
    journal: "Natl Med J India",
    ref: "34(3):143–150",
    pmid: "34825538",
    doi: "10.25259/NMJI_63_19",
    finding:
      "In 41 people with long-term insomnia, yoga nidra and CBT-I both improved sleep time, night waking and sleep quality; yoga nidra also increased deep sleep and lowered saliva cortisol.",
    note: "Small single-centre trial; sleep-lab retests only in volunteers; it does not show yoga nidra beats CBT-I.",
  },
  balban2023: {
    id: "balban2023",
    topic: "habits",
    authors: "Balban MY, Neri E, Kogon MM, et al.",
    year: 2023,
    title:
      "Brief structured respiration practices enhance mood and reduce physiological arousal",
    journal: "Cell Rep Med",
    ref: "4(1):100895",
    pmid: "36630953",
    doi: "10.1016/j.xcrm.2022.100895",
    finding:
      "Five minutes a day of breathing practice for a month, especially cyclic sighing (long slow exhales), improved mood and slowed resting breathing more than five minutes of mindfulness meditation.",
    note: "Remote trial from Andrew Huberman's lab (the book author is the senior author; he advises WHOOP). Needs independent replication.",
  },
  basso2019: {
    id: "basso2019",
    topic: "habits",
    authors: "Basso JC, McHale A, Ende V, et al.",
    year: 2019,
    title:
      "Brief, daily meditation enhances attention, memory, mood, and emotional regulation in non-experienced meditators",
    journal: "Behav Brain Res",
    ref: "356:208–220",
    pmid: "30153464",
    doi: "10.1016/j.bbr.2018.08.023",
    finding:
      "In beginners aged 18–45, 13 minutes of guided meditation a day for 8 weeks (but not 4) improved mood, attention and memory and lowered anxiety under stress, compared with listening to podcasts.",
    note: "Small trial; benefits showed up only after 8 weeks.",
  },
  gollwitzer2006: {
    id: "gollwitzer2006",
    topic: "habits",
    authors: "Gollwitzer PM, Sheeran P",
    year: 2006,
    title:
      "Implementation intentions and goal achievement: a meta-analysis of effects and processes",
    journal: "Adv Exp Soc Psychol",
    ref: "38:69–119",
    doi: "10.1016/S0065-2601(06)38002-1",
    finding:
      "Across 94 tests, 'if-then' plans (when situation Y happens, I will do X) had a medium-to-large effect on reaching goals (d = 0.65).",
    note: "Not indexed in PubMed; checked at publisher (Crossref record) and abstract read via Semantic Scholar / author's open copy (kops.uni-konstanz.de).",
  },
  albulescu2022: {
    id: "albulescu2022",
    topic: "habits",
    authors: "Albulescu P, Macsinga I, Rusu A, et al.",
    year: 2022,
    title:
      '"Give me a break!" A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance',
    journal: "PLoS One",
    ref: "17(8):e0272460",
    pmid: "36044424",
    doi: "10.1371/journal.pone.0272460",
    finding:
      "Short breaks between tasks gave a small boost in energy and less tiredness; they did not clearly improve work output overall, and longer breaks helped output more.",
    note: "Small effects (d about 0.35); output gains were seen only on less mentally demanding tasks.",
  },
  adam2017: {
    id: "adam2017",
    topic: "habits",
    authors: "Adam EK, Quinn ME, Tavernier R, et al.",
    year: 2017,
    title:
      "Diurnal cortisol slopes and mental and physical health outcomes: a systematic review and meta-analysis",
    journal: "Psychoneuroendocrinology",
    ref: "83:25–41",
    pmid: "28578301",
    doi: "10.1016/j.psyneuen.2017.05.018",
    finding:
      "Across 80 studies, a flatter drop in cortisol from morning to evening went with poorer mental and physical health, most of all for immune and inflammation measures.",
    note: "Links, not cause and effect; the average link is small (r = 0.15).",
  },
  fries2009: {
    id: "fries2009",
    topic: "habits",
    authors: "Fries E, Dettenborn L, Kirschbaum C",
    year: 2009,
    title: "The cortisol awakening response (CAR): facts and future directions",
    journal: "Int J Psychophysiol",
    ref: "72(1):67–73",
    pmid: "18854200",
    doi: "10.1016/j.ijpsycho.2008.03.014",
    finding:
      "Cortisol rises sharply after waking; the size of the rise depends on things like sex, health, habits and stress, and may reflect getting ready for the day ahead.",
    note: "Narrative review. The abstract gives no time for the peak after waking, so do not quote a peak time from this source.",
  },
  lovallo2005: {
    id: "lovallo2005",
    topic: "habits",
    authors: "Lovallo WR, Whitsett TL, al'Absi M, et al.",
    year: 2005,
    title:
      "Caffeine stimulation of cortisol secretion across the waking hours in relation to caffeine intake levels",
    journal: "Psychosom Med",
    ref: "67(5):734–739",
    pmid: "16204431",
    doi: "10.1097/01.psy.0000181270.20036.06",
    finding:
      "In 96 adults, caffeine raised cortisol strongly after 5 days without it; after 5 days of 300–600 mg a day, the morning dose no longer raised cortisol but a midday dose still did, so tolerance is only partial.",
  },
  hill2008: {
    id: "hill2008",
    topic: "training",
    authors: "Hill EE, Zack E, Battaglini C, et al.",
    year: 2008,
    title:
      "Exercise and circulating cortisol levels: the intensity threshold effect",
    journal: "J Endocrinol Invest",
    ref: "31(7):587–591",
    pmid: "18787373",
    doi: "10.1007/BF03345606",
    finding:
      "30 minutes of exercise at 60% and 80% of VO2max raised cortisol (by about 40% and 83%), while 40% did not; after correcting for blood volume, easy exercise actually lowered it.",
    note: "12 active men; a single short-term study.",
  },

  // ───────────────────────────── Movement ─────────────────────────────

  paluch2022: {
    id: "paluch2022",
    topic: "habits",
    authors: "Paluch AE, Bajpai S, Bassett DR, et al.",
    year: 2022,
    title:
      "Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts",
    journal: "Lancet Public Health",
    ref: "7(3):e219–e228",
    pmid: "35247352",
    doi: "10.1016/S2468-2667(21)00302-9",
    finding:
      "In 47,471 adults, more daily steps meant lower risk of death, levelling off at about 6,000–8,000 steps for people 60 and over and 8,000–10,000 for younger adults.",
    note: "Observational; once total steps were counted, walking speed added little.",
  },
  buffey2022: {
    id: "buffey2022",
    topic: "habits",
    authors: "Buffey AJ, Herring MP, Langley CK, et al.",
    year: 2022,
    title:
      "The acute effects of interrupting prolonged sitting time in adults with standing and light-intensity walking on biomarkers of cardiometabolic health in adults: a systematic review and meta-analysis",
    journal: "Sports Med",
    ref: "52(8):1765–1787",
    pmid: "35147898",
    doi: "10.1007/s40279-022-01649-4",
    finding:
      "Breaking up long sitting with frequent short bouts of light walking lowered blood sugar and insulin after meals, and did so better than standing breaks; neither changed blood pressure.",
    note: "7 one-day lab studies, mostly in people with overweight or obesity; breaks were spread through the day, not only right after meals.",
  },
  bull2020: {
    id: "bull2020",
    topic: "training",
    authors: "Bull FC, Al-Ansari SS, Biddle S, et al.",
    year: 2020,
    title:
      "World Health Organization 2020 guidelines on physical activity and sedentary behaviour",
    journal: "Br J Sports Med",
    ref: "54(24):1451–1462",
    pmid: "33239350",
    doi: "10.1136/bjsports-2020-102955",
    finding:
      "Adults should do 150–300 minutes of moderate or 75–150 minutes of vigorous aerobic activity a week, plus regular muscle strengthening, and sit less; some activity is better than none.",
    note: "Guideline; the evidence was not enough to set a safe limit for sitting time.",
  },
  tanaka2001: {
    id: "tanaka2001",
    topic: "training",
    authors: "Tanaka H, Monahan KD, Seals DR",
    year: 2001,
    title: "Age-predicted maximal heart rate revisited",
    journal: "J Am Coll Cardiol",
    ref: "37(1):153–156",
    pmid: "11153730",
    doi: "10.1016/s0735-1097(00)01054-8",
    finding:
      "Maximum heart rate is better estimated as 208 − 0.7 × age than 220 − age, which underestimates it in older adults; the formula is the same for men and women.",
    note: "A population average; an individual's true maximum can differ.",
  },
  alizadeh2023: {
    id: "alizadeh2023",
    topic: "training",
    authors: "Alizadeh S, Daneshjoo A, Zahiri A, et al.",
    year: 2023,
    title:
      "Resistance training induces improvements in range of motion: a systematic review and meta-analysis",
    journal: "Sports Med",
    ref: "53(3):707–722",
    pmid: "36622555",
    doi: "10.1007/s40279-022-01804-x",
    finding:
      "Across 55 studies, resistance training with external load improved joint range of motion about as much as stretching, so separate stretching is not required for flexibility.",
    note: "Bodyweight-only training did not clearly improve range of motion; untrained people improved most.",
  },
  roberts2015: {
    id: "roberts2015",
    topic: "recovery",
    authors: "Roberts LA, Raastad T, Markworth JF, et al.",
    year: 2015,
    title:
      "Post-exercise cold water immersion attenuates acute anabolic signalling and long-term adaptations in muscle to strength training",
    journal: "J Physiol",
    ref: "593(18):4285–4301",
    pmid: "26174323",
    doi: "10.1113/JP270570",
    finding:
      "Ten minutes in cold water after every strength session for 12 weeks led to smaller gains in strength and muscle than an active cool-down.",
    note: "21 active men in the training study; one lab.",
  },

  // ───────────────────────────── VO2 max ─────────────────────────────

  kodama2009: {
    id: "kodama2009",
    topic: "training",
    authors: "Kodama S, Saito K, Tanaka S, et al.",
    year: 2009,
    title:
      "Cardiorespiratory fitness as a quantitative predictor of all-cause mortality and cardiovascular events in healthy men and women: a meta-analysis",
    journal: "JAMA",
    ref: "301(19):2024–2035",
    pmid: "19454641",
    doi: "10.1001/jama.2009.681",
    finding:
      "Each 1 MET more fitness (about 1 km/h faster running) was linked to 13% lower risk of death and 15% lower risk of heart disease; people under 7.9 METs had clearly higher risk.",
    note: "Meta-analysis of 33 observational studies.",
  },
  lang2024: {
    id: "lang2024",
    topic: "training",
    authors: "Lang JJ, Prince SA, Merucci K, et al.",
    year: 2024,
    title:
      "Cardiorespiratory fitness is a strong and consistent predictor of morbidity and mortality among adults: an overview of meta-analyses representing over 20.9 million observations from 199 unique cohort studies",
    journal: "Br J Sports Med",
    ref: "58(10):556–566",
    pmid: "38599681",
    doi: "10.1136/bjsports-2023-107849",
    finding:
      "People with high fitness had about half the risk of death of those with low fitness, and each 1 MET more fitness was linked to 11–17% lower risk of death.",
    note: "Overview of 26 reviews of observational studies; certainty rated very low to moderate.",
  },
  mandsager2018: {
    id: "mandsager2018",
    topic: "training",
    authors: "Mandsager K, Harb S, Cremer P, et al.",
    year: 2018,
    title:
      "Association of cardiorespiratory fitness with long-term mortality among adults undergoing exercise treadmill testing",
    journal: "JAMA Netw Open",
    ref: "1(6):e183605",
    pmid: "30646252",
    doi: "10.1001/jamanetworkopen.2018.3605",
    finding:
      "In 122,007 patients, higher treadmill fitness meant lower risk of death with no upper limit seen; low fitness carried a risk as large as or larger than smoking, diabetes or heart disease.",
    note: "Look-back study of patients sent for testing at one US hospital; fitness was estimated from the treadmill, not measured gas exchange.",
  },
  helgerud2007: {
    id: "helgerud2007",
    topic: "training",
    authors: "Helgerud J, Høydal K, Wang E, et al.",
    year: 2007,
    title:
      "Aerobic high-intensity intervals improve VO2max more than moderate training",
    journal: "Med Sci Sports Exerc",
    ref: "39(4):665–671",
    pmid: "17414804",
    doi: "10.1249/mss.0b013e3180304570",
    finding:
      "4 × 4-minute intervals at 90–95% of max heart rate (3 minutes easy between), 3 times a week for 8 weeks, raised VO2max by 7.2%, more than steady running with the same total work.",
    note: "40 moderately trained young men only.",
  },
  milanovic2015: {
    id: "milanovic2015",
    topic: "training",
    authors: "Milanović Z, Sporiš G, Weston M",
    year: 2015,
    title:
      "Effectiveness of high-intensity interval training (HIT) and continuous endurance training for VO2max improvements: a systematic review and meta-analysis of controlled trials",
    journal: "Sports Med",
    ref: "45(10):1469–1481",
    pmid: "26243014",
    doi: "10.1007/s40279-015-0365-0",
    finding:
      "In healthy adults aged 18–45, both steady endurance training and HIIT raised VO2max a lot (about 5 ml/kg/min versus no exercise); HIIT gave a little more (about 1.2 ml/kg/min).",
    note: "28 studies with 723 people, mostly young.",
  },
  bacon2013: {
    id: "bacon2013",
    topic: "training",
    authors: "Bacon AP, Carter RE, Ogle EA, Joyner MJ",
    year: 2013,
    title:
      "VO2max trainability and high intensity interval training in humans: a meta-analysis",
    journal: "PLoS One",
    ref: "8(9):e73182",
    pmid: "24066036",
    doi: "10.1371/journal.pone.0073182",
    finding:
      "6–13 weeks of interval training (3+ days a week) raised VO2max by about 0.5 L/min on average; programmes with longer intervals raised it by about 0.8–0.9 L/min, with everyone responding.",
    note: "334 healthy people under 45 from 37 small, varied studies.",
  },
  wen2019: {
    id: "wen2019",
    topic: "training",
    authors: "Wen D, Utesch T, Wu J, et al.",
    year: 2019,
    title:
      "Effects of different protocols of high intensity interval training for VO2max improvements in adults: a meta-analysis of randomised controlled trials",
    journal: "J Sci Med Sport",
    ref: "22(8):941–947",
    pmid: "30733142",
    doi: "10.1016/j.jsams.2019.01.013",
    finding:
      "Even short HIIT (intervals of 30 s or less, 5 minutes total, 4 weeks) improved VO2max, but intervals of 2+ minutes, 15+ minutes of hard work per session and 4–12+ weeks worked best and were the only kind to beat moderate steady training.",
    note: "Published in J Sci Med Sport, not J Sports Sci as listed in the request. 53 trials.",
  },
  gist2014: {
    id: "gist2014",
    topic: "training",
    authors: "Gist NH, Fedewa MV, Dishman RK, Cureton KJ",
    year: 2014,
    title:
      "Sprint interval training effects on aerobic capacity: a systematic review and meta-analysis",
    journal: "Sports Med",
    ref: "44(2):269–279",
    pmid: "24129784",
    doi: "10.1007/s40279-013-0115-0",
    finding:
      "Repeated 30-second all-out sprints improved VO2max by about 3.6 ml/kg/min (about 8%), the same as moderate steady training but with less total exercise.",
    note: "16 small trials (318 people) in young, healthy adults.",
  },
  ronnestad2015: {
    id: "ronnestad2015",
    topic: "training",
    authors: "Rønnestad BR, Hansen J, Vegge G, et al.",
    year: 2015,
    title:
      "Short intervals induce superior training adaptations compared with long intervals in cyclists – an effort-matched approach",
    journal: "Scand J Med Sci Sports",
    ref: "25(2):143–151",
    pmid: "24382021",
    doi: "10.1111/sms.12165",
    finding:
      "In trained cyclists, 10 weeks of effort-matched short intervals (twice a week) raised VO2max more than long intervals (8.7% vs 2.6%).",
    note: "Only 16 cyclists; the abstract does not describe the interval lengths.",
  },
  montero2017: {
    id: "montero2017",
    topic: "training",
    authors: "Montero D, Lundby C",
    year: 2017,
    title:
      "Refuting the myth of non-response to exercise training: 'non-responders' do respond to higher dose of training",
    journal: "J Physiol",
    ref: "595(11):3377–3387",
    pmid: "28133739",
    doi: "10.1113/JP273480",
    finding:
      "In 78 healthy adults, 'non-responders' to 6 weeks of endurance training fell from 69% at one hour a week to none at four or five hours, and two extra hours a week turned every non-responder into a responder.",
  },
  stensvold2020: {
    id: "stensvold2020",
    topic: "training",
    authors: "Stensvold D, Viken H, Steinshamn SL, et al.",
    year: 2020,
    title:
      "Effect of exercise training for five years on all cause mortality in older adults—the Generation 100 study: randomised controlled trial",
    journal: "BMJ",
    ref: "371:m3485",
    pmid: "33028588",
    doi: "10.1136/bmj.m3485",
    finding:
      "In 1,567 adults aged 70–77, five years of supervised training did not lower death rates overall compared with following activity guidelines; twice-weekly intervals at about 90% of peak heart rate showed a trend toward fewer deaths.",
    note: "The HIIT trend was not statistically significant; control participants also did a lot of hard exercise.",
  },
  cooper1968: {
    id: "cooper1968",
    topic: "training",
    authors: "Cooper KH",
    year: 1968,
    title:
      "A means of assessing maximal oxygen intake. Correlation between field and treadmill testing",
    journal: "JAMA",
    ref: "203(3):201–204",
    pmid: "5694044",
    finding:
      "The original 12-minute run test: distance covered in 12 minutes is related to maximal oxygen intake measured on a treadmill.",
    note: "PubMed has no abstract and no DOI, and the full text was not checked. The equation VO2max = (metres − 504.9) / 44.73 was confirmed only from later papers that reproduce it (e.g. PMC13433355, Front Sports Act Living). A 2025 study titled 'Cooper's 12 Minute Run Systematically Underestimates VO2 max in Collegiate Team Sport Athletes' (PMC13405666) warns it can read low in trained athletes.",
  },
  kline1987: {
    id: "kline1987",
    topic: "training",
    authors: "Kline GM, Porcari JP, Hintermeister R, et al.",
    year: 1987,
    title:
      "Estimation of VO2max from a one-mile track walk, gender, age, and body weight",
    journal: "Med Sci Sports Exerc",
    ref: "19(3):253–259",
    pmid: "3600239",
    finding:
      "A fast one-mile walk with end heart rate, age, weight and sex estimated VO2max well in 343 adults aged 30–69 (r = 0.92 on retest); abstract equation in L/min: 6.9652 + 0.0091·weight(lb) − 0.0257·age + 0.5955·sex(1 male, 0 female) − 0.2240·time − 0.0115·last-quarter heart rate.",
    note: "No DOI on PubMed. The abstract gives only the L/min equation. The widely used ml/kg/min version, 132.853 − 0.0769·weight(lb) − 0.3877·age + 6.315·sex − 3.2649·time(min) − 0.1565·heart rate, was confirmed only from papers that reproduce it (PMC13158159, PMC13050850), not the original.",
  },
  nes2011: {
    id: "nes2011",
    topic: "training",
    authors: "Nes BM, Janszky I, Vatten LJ, et al.",
    year: 2011,
    title:
      "Estimating V·O2peak from a nonexercise prediction model: the HUNT Study, Norway",
    journal: "Med Sci Sports Exerc",
    ref: "43(11):2024–2030",
    pmid: "21502897",
    doi: "10.1249/MSS.0b013e31821d3f6f",
    finding:
      "A no-exercise estimate using age, waist size, leisure activity and resting heart rate predicted measured VO2peak in healthy Norwegian adults to within about 5–6 ml/kg/min (typical error 5.7 for men, 5.1 for women).",
    note: "Rough estimate only; the model's coefficients are not in the abstract and were not checked.",
  },
  jackson1990: {
    id: "jackson1990",
    topic: "training",
    authors: "Jackson AS, Blair SN, Mahar MT, et al.",
    year: 1990,
    title: "Prediction of functional aerobic capacity without exercise testing",
    journal: "Med Sci Sports Exerc",
    ref: "22(6):863–870",
    pmid: "2287267",
    doi: "10.1249/00005768-199012000-00021",
    finding:
      "A no-exercise model using sex, age, BMI and a self-rated activity score predicted VO2peak with a typical error of about 5.6 ml/kg/min (R = 0.78), better than the Astrand bike test.",
    note: "90% of the 2,009 subjects were men. Coefficients are not in the abstract; VO2max = 56.363 + 1.921·PA-R − 0.381·age − 0.754·BMI + 10.987·sex (1 male, 0 female) was confirmed from reproductions (JAHA 2020 Ball State table, PMC7428991; PMC12646035), not the original. Some later papers use a 0–15 PA-R scale; this equation uses the original 0–7 scale.",
  },
  kaminsky2022: {
    id: "kaminsky2022",
    topic: "training",
    authors: "Kaminsky LA, Arena R, Myers J, et al.",
    year: 2022,
    title:
      "Updated reference standards for cardiorespiratory fitness measured with cardiopulmonary exercise testing: data from the Fitness Registry and the Importance of Exercise National Database (FRIEND)",
    journal: "Mayo Clin Proc",
    ref: "97(2):285–293",
    pmid: "34809986",
    doi: "10.1016/j.mayocp.2021.08.020",
    finding:
      "US reference percentiles for measured VO2peak by sex and decade (20–89) from 22,379 treadmill and bike tests; on the treadmill, fitness fell about 4 ml/kg/min per decade, and the new treadmill values are 1.5–4.6 lower than the 2015 ones.",
    note: "Full text not accessible (publisher returned 403; not in PMC), so its percentile table was not extracted. Table below is from the 2015 FRIEND paper.",
  },
  kaminsky2015: {
    id: "kaminsky2015",
    topic: "training",
    authors: "Kaminsky LA, Arena R, Myers J",
    year: 2015,
    title:
      "Reference standards for cardiorespiratory fitness measured with cardiopulmonary exercise testing: data from the Fitness Registry and the Importance of Exercise National Database",
    journal: "Mayo Clin Proc",
    ref: "90(11):1515–1523",
    pmid: "26455884",
    doi: "10.1016/j.mayocp.2015.07.026",
    finding:
      "From 7,783 treadmill tests in healthy US adults, median VO2max fell from 48.0 (men) and 37.6 (women) ml/kg/min at age 20–29 to 24.4 and 18.3 at 70–79, about 10% per decade.",
    note: "Superseded by kaminsky2022 (whose treadmill values are 1.5–4.6 lower); used here because its full text is open (PMC4919021).",
  },
  warburton2011parq: {
    id: "warburton2011parq",
    topic: "training",
    authors: "Warburton DER, Jamnik VK, Bredin SSD, Gledhill N",
    year: 2011,
    title:
      "The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+) and Electronic Physical Activity Readiness Medical Examination (ePARmed-X+)",
    journal: "Health Fit J Can",
    ref: "4(2):3–17",
    doi: "10.14288/hfjc.v4i2.103",
    finding:
      "Presents the PAR-Q+ and ePARmed-X+ screening forms for checking whether someone can safely start being more active.",
    note: "Not indexed in PubMed; checked at publisher: https://hfjc.library.ubc.ca/index.php/HFJC/article/view/103 (pages are 3–17, not 3–23). The form is reissued yearly; use the current version. Evidence base is warburton2011consensus.",
  },
  warburton2011consensus: {
    id: "warburton2011consensus",
    topic: "training",
    authors: "Warburton DE, Gledhill N, Jamnik VK, et al.",
    year: 2011,
    title:
      "Evidence-based risk assessment and recommendations for physical activity clearance: Consensus Document 2011",
    journal: "Appl Physiol Nutr Metab",
    ref: "36 Suppl 1:S266–S298",
    pmid: "21800945",
    doi: "10.1139/h11-062",
    finding:
      "The risks of staying inactive are much higher than the short-term risks of a bout of exercise; screening should use follow-up questions to clear people rather than send everyone to a doctor.",
    note: "Consensus document built on systematic reviews.",
  },
  molinagarcia2022: {
    id: "molinagarcia2022",
    topic: "training",
    authors: "Molina-Garcia P, Notbohm HL, Schumann M, et al.",
    year: 2022,
    title:
      "Validity of estimating the maximal oxygen consumption by consumer wearables: a systematic review with meta-analysis and expert statement of the INTERLIVE Network",
    journal: "Sports Med",
    ref: "52(7):1577–1597",
    pmid: "35072942",
    doi: "10.1007/s40279-021-01639-y",
    finding:
      "Watches that estimate VO2max from exercise data were about right on average (bias −0.09 ml/kg/min) but could be off by about ±10 ml/kg/min for one person; resting-data estimates read high (bias +2.2, range −13 to +17).",
    note: "14 validation studies. Fine for groups, too rough to treat one person's watch number as exact.",
  },

  // ───────────────────────────── Concurrent / HYROX ─────────────────────────────

  wilson2012: {
    id: "wilson2012",
    topic: "training",
    authors: "Wilson JM, Marin PJ, Rhea MR, et al.",
    year: 2012,
    title:
      "Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises",
    journal: "J Strength Cond Res",
    ref: "26(8):2293–2307",
    pmid: "22002517",
    doi: "10.1519/JSC.0b013e31823a3e2d",
    finding:
      "Adding endurance work to strength training gave somewhat smaller gains in muscle, strength and power; running (but not cycling) cut muscle and strength gains, and longer or more frequent endurance sessions interfered more.",
    note: "21 studies; the newer schumann2022 found no running-vs-cycling difference.",
  },
  schumann2022: {
    id: "schumann2022",
    topic: "training",
    authors: "Schumann M, Feuerbacher JF, Sünkeler M, et al.",
    year: 2022,
    title:
      "Compatibility of concurrent aerobic and strength training for skeletal muscle size and function: an updated systematic review and meta-analysis",
    journal: "Sports Med",
    ref: "52(3):601–612",
    pmid: "34757594",
    doi: "10.1007/s40279-021-01587-7",
    finding:
      "Across 43 studies, adding aerobic training did not reduce muscle growth or maximum strength, but did reduce gains in explosive strength, mainly when both were done in the same session rather than 3+ hours apart.",
    note: "Running vs cycling, weekly frequency, training status and age made no difference.",
  },
  sabag2018: {
    id: "sabag2018",
    topic: "training",
    authors: "Sabag A, Najafi A, Michael S, et al.",
    year: 2018,
    title:
      "The compatibility of concurrent high intensity interval training and resistance training for muscular strength and hypertrophy: a systematic review and meta-analysis",
    journal: "J Sports Sci",
    ref: "36(21):2472–2483",
    pmid: "29658408",
    doi: "10.1080/02640414.2018.1464636",
    finding:
      "HIIT plus weights gave the same muscle growth and upper-body strength as weights alone, but slightly smaller lower-body strength gains; running-based HIIT and more rest between the two may limit this.",
    note: "The cycling-vs-running difference was only a trend.",
  },
  eddens2018: {
    id: "eddens2018",
    topic: "training",
    authors: "Eddens L, van Someren K, Howatson G",
    year: 2018,
    title:
      "The role of intra-session exercise sequence in the interference effect: a systematic review with meta-analysis",
    journal: "Sports Med",
    ref: "48(1):177–188",
    pmid: "28917030",
    doi: "10.1007/s40279-017-0784-1",
    finding:
      "Doing weights before endurance in the same session gave about 7% more gain in lower-body dynamic strength than the reverse order; order made no difference to muscle growth, VO2max or body fat.",
    note: "Only 10 studies.",
  },
  stoggl2014: {
    id: "stoggl2014",
    topic: "training",
    authors: "Stöggl T, Sperlich B",
    year: 2014,
    title:
      "Polarized training has greater impact on key endurance variables than threshold, high intensity, or high volume training",
    journal: "Front Physiol",
    ref: "5:33",
    pmid: "24550842",
    doi: "10.3389/fphys.2014.00033",
    finding:
      "In 48 well-trained endurance athletes over 9 weeks, polarized training (mostly easy plus some very hard) raised VO2peak most (+11.7%); threshold-heavy and high-volume training added little.",
    note: "Single 9-week trial in already well-trained athletes.",
  },
  bosquet2007: {
    id: "bosquet2007",
    topic: "training",
    authors: "Bosquet L, Montpetit J, Arvisais D, Mujika I",
    year: 2007,
    title: "Effects of tapering on performance: a meta-analysis",
    journal: "Med Sci Sports Exerc",
    ref: "39(8):1358–1365",
    pmid: "17762369",
    doi: "10.1249/mss.0b013e31806010e0",
    finding:
      "The best taper lasted 2 weeks and cut training volume by 41–60% (tapering off progressively) while keeping intensity and session frequency the same.",
    note: "27 studies in competitive athletes.",
  },
  frandsen2025: {
    id: "frandsen2025",
    topic: "training",
    authors: "Schuster Brandt Frandsen J, Hulme A, Parner ET, et al.",
    year: 2025,
    title:
      "How much running is too much? Identifying high-risk running sessions in a 5200-person cohort study",
    journal: "Br J Sports Med",
    ref: "59(17):1203–1210",
    pmid: "40623829",
    doi: "10.1136/bjsports-2024-109380",
    finding:
      "In 5,205 runners, a single run more than 10% longer than the longest run in the past 30 days raised the overuse injury rate (about 1.5–2.3 times); week-to-week mileage ratios did not predict injury.",
    note: "Observational (Garmin-RUNSAFE), self-reported injuries, 78% men. PubMed lists the first author's surname as 'Schuster Brandt Frandsen'.",
  },
  thomas2016: {
    id: "thomas2016",
    topic: "nutrition",
    authors: "Thomas DT, Erdman KA, Burke LM",
    year: 2016,
    title:
      "American College of Sports Medicine Joint Position Statement. Nutrition and athletic performance",
    journal: "Med Sci Sports Exerc",
    ref: "48(3):543–568",
    pmid: "26891166",
    doi: "10.1249/MSS.0000000000000852",
    finding:
      "Joint ACSM, Academy of Nutrition and Dietetics and Dietitians of Canada position: well-chosen type, amount and timing of food, fluids and supplements improve training performance and recovery.",
    note: "Also published as J Acad Nutr Diet 116(3):501–528, PMID 26920240, doi 10.1016/j.jand.2015.12.006. The carbohydrate g/kg ranges are NOT in the abstract and the full text was blocked; ranges (3–5 light, 5–7 moderate ~1 h/day, 6–10 high 1–3 h/day, 8–12 very high 4–5+ h/day, g/kg/day) were seen only in reproductions (PMC6566372 Table 3; PMC12119602).",
  },
  sawka2007: {
    id: "sawka2007",
    topic: "nutrition",
    authors: "American College of Sports Medicine; Sawka MN, Burke LM, et al.",
    year: 2007,
    title:
      "American College of Sports Medicine position stand. Exercise and fluid replacement",
    journal: "Med Sci Sports Exerc",
    ref: "39(2):377–390",
    pmid: "17277604",
    doi: "10.1249/mss.0b013e31802ca597",
    finding:
      "Drink during exercise to avoid losing more than 2% of body weight as water; since sweat rates vary a lot, weigh yourself before and after to estimate yours.",
    note: "Position stand (expert consensus).",
  },
  brandt2025hyrox: {
    id: "brandt2025hyrox",
    topic: "training",
    authors: "Brandt T, Ebel C, Lebahn C, Schmidt A",
    year: 2025,
    title:
      "Acute physiological responses and performance determinants in Hyrox© – a new running-focused high intensity functional fitness trend",
    journal: "Front Physiol",
    ref: "16:1519240",
    pmid: "40230601",
    doi: "10.3389/fphys.2025.1519240",
    finding:
      "In a simulated HYROX, running took more time than the stations (51 vs 33 minutes) and most of the race was at a very hard heart rate; faster finishers had higher VO2max, more endurance training and lower body fat.",
    note: "Only 11 recreational athletes, simulated race, correlations only.",
  },
  rappelt2026hyrox: {
    id: "rappelt2026hyrox",
    topic: "training",
    authors: "Rappelt L, Wiedenmann T, Held S, et al.",
    year: 2026,
    title:
      "Longitudinal performance development in PRO and ELITE HYROX competitions across the first seven competitive seasons",
    journal: "Front Physiol",
    ref: "17:1847569",
    pmid: "42524284",
    doi: "10.3389/fphys.2026.1847569",
    finding:
      "Across 39,696 PRO and ELITE results, running made up about half of race time and drove most of the improvement over seven seasons; strength stations cost slower athletes the most time.",
    note: "Analysis of public race results, not a training study.",
  },
  gutierrezhellin2026hyrox: {
    id: "gutierrezhellin2026hyrox",
    topic: "training",
    authors: "Gutiérrez-Hellín J, Alonso-Domínguez S, Gil-Cabrera J, et al.",
    year: 2026,
    title:
      "Relative running intensity and pacing during an official HYROX PRO MEN competition: the HYScience study",
    journal: "Int J Sports Physiol Perform",
    ref: "Online ahead of print:1–8",
    pmid: "42697540",
    doi: "10.1123/ijspp.2026-0098",
    finding:
      "In 24 PRO men, race running averaged about 84% of second-threshold speed and slowed from run 1 to run 8; holding a higher relative pace went with faster running times.",
    note: "Online ahead of print (Sept 2026); men only, one race.",
  },

  // ───────────────────────────── Nutrition ─────────────────────────────

  hall2019: {
    id: "hall2019",
    topic: "nutrition",
    authors: "Hall KD, Ayuketah A, Brychta R, et al.",
    year: 2019,
    title:
      "Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomized controlled trial of ad libitum food intake",
    journal: "Cell Metab",
    ref: "30(1):67–77.e3",
    pmid: "31105044",
    doi: "10.1016/j.cmet.2019.05.008",
    finding:
      "In 20 adults living on a research ward, an ultra-processed diet led to eating about 500 kcal a day more and gaining 0.9 kg in 2 weeks, versus losing 0.9 kg on an unprocessed diet matched for offered calories, sugar, fat, fibre and salt.",
    note: "Small, 2 weeks per diet. A correction was published (PMID 31269427).",
  },
  lane2024: {
    id: "lane2024",
    topic: "nutrition",
    authors: "Lane MM, Gamage E, Du S, et al.",
    year: 2024,
    title:
      "Ultra-processed food exposure and adverse health outcomes: umbrella review of epidemiological meta-analyses",
    journal: "BMJ",
    ref: "384:e077310",
    pmid: "38418082",
    doi: "10.1136/bmj-2023-077310",
    finding:
      "Across 45 pooled analyses (almost 10 million people), eating more ultra-processed food was linked to higher risk for 32 health problems, most convincingly heart-disease death, type 2 diabetes, anxiety and common mental disorders.",
    note: "Observational; most evidence rated low or very low quality.",
  },
  schoenfeld2018meal: {
    id: "schoenfeld2018meal",
    topic: "nutrition",
    authors: "Schoenfeld BJ, Aragon AA",
    year: 2018,
    title:
      "How much protein can the body use in a single meal for muscle-building? Implications for daily protein distribution",
    journal: "J Int Soc Sports Nutr",
    ref: "15:10",
    pmid: "29497353",
    doi: "10.1186/s12970-018-0215-1",
    finding:
      "For muscle building, aim for about 0.4 g/kg of protein per meal over at least four meals (1.6 g/kg/day), up to about 0.55 g/kg per meal; protein above 20 g in a meal is not simply wasted.",
    note: "Narrative review, not a meta-analysis.",
  },
  wastyk2021: {
    id: "wastyk2021",
    topic: "nutrition",
    authors: "Wastyk HC, Fragiadakis GK, Perelman D, et al.",
    year: 2021,
    title: "Gut-microbiota-targeted diets modulate human immune status",
    journal: "Cell",
    ref: "184(16):4137–4153.e14",
    pmid: "34256014",
    doi: "10.1016/j.cell.2021.06.019",
    finding:
      "In a 17-week trial, a diet high in fermented foods steadily raised the variety of gut microbes and lowered inflammation markers; a high-fibre diet did not raise variety.",
    note: "18 people per group (36 total); the main planned outcome (cytokine response score) did not change.",
  },
  who2023satfat: {
    id: "who2023satfat",
    topic: "nutrition",
    authors: "World Health Organization",
    year: 2023,
    title:
      "Saturated fatty acid and trans-fatty acid intake for adults and children: WHO guideline",
    journal: "WHO guideline (Geneva: World Health Organization)",
    ref: "ISBN 978-92-4-007363-0",
    finding:
      "Keep saturated fat to no more than 10% of daily energy and trans fat to no more than 1%, replacing them with plant unsaturated fats or fibre-rich carbohydrates such as whole grains, vegetables, fruit and pulses.",
    note: "Not in PubMed; checked at publisher: https://www.who.int/publications/i/item/9789240073630 (17 July 2023) and the WHO news release of the same date. No DOI found.",
  },
  aha2018fish: {
    id: "aha2018fish",
    topic: "nutrition",
    authors: "Rimm EB, Appel LJ, Chiuve SE, et al.",
    year: 2018,
    title:
      "Seafood long-chain n-3 polyunsaturated fatty acids and cardiovascular disease: a science advisory from the American Heart Association",
    journal: "Circulation",
    ref: "138(1):e35–e47",
    pmid: "29773586",
    doi: "10.1161/CIR.0000000000000574",
    finding:
      "Eat 1–2 seafood meals a week to lower risk of heart failure, coronary heart disease, stroke caused by a clot and sudden cardiac death, especially when seafood replaces less healthy foods.",
    note: "Expert advisory based mostly on observational evidence.",
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
  habits: "Daily habits and cardio fitness",
};
