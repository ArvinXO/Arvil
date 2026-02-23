// Police Powers — Use of Force, Common Powers, Category Powers
// ELI5 explanations with real-world scenarios

// ─── Use of Force ──────────────────────────────────────────

export interface UseOfForceLevel {
    level: number;
    name: string;
    description: string;
    eli5: string;
    examples: string[];
    whenToUse: string;
    scenario: string;
    legalBasis: string;
    color: string;
}

export const USE_OF_FORCE_LEVELS: UseOfForceLevel[] = [
    {
        level: 1,
        name: 'Officer Presence',
        description: 'Simply being there in uniform. No physical contact.',
        eli5: 'Just by showing up in uniform, you can stop trouble before it starts. People see you and change their behaviour.',
        examples: ['Standing on a street corner during night-time economy', 'Walking through a crowd at a football match', 'Being visible at a shoplifting hotspot'],
        whenToUse: 'Always your starting point. Most situations are resolved just by being there.',
        scenario: 'You arrive at a pub where two groups are squaring up. Just walking in and standing between them causes both groups to step back and calm down.',
        legalBasis: 'No legal authority needed — this is just being a police officer.',
        color: '#4ade80',
    },
    {
        level: 2,
        name: 'Verbal Communication',
        description: 'Using your voice to control a situation. Commands, de-escalation, persuasion.',
        eli5: 'Talking people down. Using your voice firmly but fairly to tell someone what to do and why. "I need you to step back" or "Calm down, let\'s talk about this."',
        examples: ['Giving clear, firm commands: "STOP! POLICE!"', 'De-escalation: "I can see you\'re upset, let\'s sort this out"', 'Warning of consequences: "If you don\'t stop, I will have to arrest you"'],
        whenToUse: 'When presence alone isn\'t enough. Always try to talk before touching.',
        scenario: 'A man is shouting aggressively at a shop worker. You approach and say: "Sir, I can see you\'re frustrated. I\'m PC Smith. Let\'s step outside and talk about what\'s happened." He stops shouting and follows you out.',
        legalBasis: 'No specific legal authority needed. Part of general policing.',
        color: '#22d3ee',
    },
    {
        level: 3,
        name: 'Compliant Handcuffing',
        description: 'Placing handcuffs on someone who is cooperating. They\'re not resisting.',
        eli5: 'The person isn\'t fighting you, but you still need to cuff them for safety — yours or theirs. You ask them to put their hands behind their back and they do.',
        examples: ['Arrested person cooperates: "Turn around, hands behind your back"', 'High-risk stop where suspect complies with instructions', 'Transporting a detained person to custody'],
        whenToUse: 'When you\'ve arrested someone and they\'re compliant, but handcuffs are still necessary for safety during transport or to prevent escape.',
        scenario: 'You arrest a shoplifter. She says "Fine, I know the drill." You say "I\'m going to place you in handcuffs for both our safety" and she puts her hands behind her back without resisting.',
        legalBasis: 'PACE s.117 — reasonable force to exercise a power under PACE.',
        color: '#3b82f6',
    },
    {
        level: 4,
        name: 'Escort & Guiding Holds',
        description: 'Light physical contact to guide or move someone. Not aggressive, just directing.',
        eli5: 'Gently taking someone by the arm to move them along. Like a parent guiding a child away from something — firm but not rough.',
        examples: ['Taking someone by the upper arm to guide them away', 'Placing a hand on a shoulder to direct movement', 'Escorting a drunk person away from a fight'],
        whenToUse: 'When verbal communication hasn\'t worked and you need to physically move someone, but they\'re not violent.',
        scenario: 'A drunk man keeps wandering back into a road. You\'ve asked him twice to stay on the pavement. You take him firmly by the arm and walk him to a bench: "Come on mate, sit here where it\'s safe."',
        legalBasis: 'Common law — preventing a breach of the peace. Criminal Law Act 1967 s.3.',
        color: '#a855f7',
    },
    {
        level: 5,
        name: 'Non-Compliant Handcuffing',
        description: 'Forcing handcuffs onto someone who is resisting. They\'re pulling away or tensing up.',
        eli5: 'They don\'t want to be cuffed — they\'re pulling their arms away, tensing their muscles, or trying to wriggle free. You have to use technique and strength to get the cuffs on.',
        examples: ['Suspect pulls arms away during arrest', 'Subject tenses up and refuses to put hands behind back', 'Controlled takedown followed by handcuffing on the ground'],
        whenToUse: 'When you\'ve made a lawful arrest and the person is actively resisting being handcuffed.',
        scenario: 'You arrest a drug dealer. He tenses his arms against his body and tries to pull away. You use an arm lock to bring his right arm behind his back, apply one cuff, then secure the left wrist.',
        legalBasis: 'PACE s.117 and Criminal Law Act 1967 s.3. Force must be reasonable and proportionate.',
        color: '#f59e0b',
    },
    {
        level: 6,
        name: 'Empty Hand Techniques',
        description: 'Strikes, pressure points, takedowns — using your body as a tool when there\'s no weapon.',
        eli5: 'You need to control someone who is violent but you don\'t need a weapon to do it. Palm strikes, arm locks, pressure points behind the ear, leg sweeps to get them on the ground.',
        examples: ['Palm strike to create distance from an attacker', 'Pressure point behind the jaw to gain compliance', 'Leg sweep / takedown to get a violent person on the ground', 'Arm bar to control a resisting suspect'],
        whenToUse: 'When someone is actively violent towards you or others, but the threat doesn\'t justify an intermediate weapon.',
        scenario: 'A man swings a punch at you during an arrest. You block, use a palm strike to push him back, then take him to the ground with a leg sweep and control him on the floor until backup arrives.',
        legalBasis: 'Common law self-defence. Criminal Law Act 1967 s.3. Must be necessary, proportionate, and reasonable.',
        color: '#ef4444',
    },
    {
        level: 7,
        name: 'Intermediate Weapons',
        description: 'PAVA spray, CS spray, baton, Taser (if trained). One step below lethal force.',
        eli5: 'When empty hands aren\'t enough, you have tools. PAVA spray stings the eyes and stops people fighting. The baton is for blocking and striking. Taser temporarily locks up muscles. These are serious — only when the threat is serious.',
        examples: ['PAVA spray on an aggressive, violent person who won\'t stop', 'Baton strike to the common peroneal nerve (outer thigh) to stop a charging attacker', 'Taser deployment to prevent serious injury', 'Drawing baton as a visual deterrent (without striking)'],
        whenToUse: 'When you or someone else faces serious violence that you cannot control with hands alone. The threat must justify the weapon.',
        scenario: 'You respond to a domestic. The male has a kitchen knife and is threatening his partner. He\'s 3 metres away and advancing. You draw your Taser, give a clear warning: "TASER! TASER! DROP THE KNIFE!" He continues. You deploy the Taser. He falls and drops the knife. You cuff him while he\'s incapacitated.',
        legalBasis: 'Criminal Law Act 1967 s.3. Common law self-defence / defence of another. Must be absolutely necessary.',
        color: '#dc2626',
    },
];

// ─── Legal Basis for Use of Force ──────────────────────────

export interface ForceLegalBasis {
    title: string;
    reference: string;
    eli5: string;
    detail: string;
    color: string;
}

export const FORCE_LEGAL_BASIS: ForceLegalBasis[] = [
    {
        title: 'Self-Defence (Common Law)',
        reference: 'Common Law',
        eli5: 'You can use reasonable force to protect yourself or someone else from being attacked. You don\'t have to wait to be hit first.',
        detail: 'The force used must be necessary (you genuinely believed you were in danger), proportionate (you didn\'t use more force than needed), and reasonable (a jury would agree with your actions).',
        color: '#4ade80',
    },
    {
        title: 'Prevention of Crime',
        reference: 'Criminal Law Act 1967 s.3',
        eli5: 'You can use reasonable force to stop a crime happening or to catch someone committing a crime. This is YOUR main power for using force.',
        detail: 'A person may use such force as is reasonable in the circumstances in the prevention of crime, or in effecting or assisting in the lawful arrest of offenders or suspected offenders.',
        color: '#3b82f6',
    },
    {
        title: 'Exercising PACE Powers',
        reference: 'PACE 1984 s.117',
        eli5: 'Whenever you use a PACE power (arrest, search, entry), you can use reasonable force if needed. So if someone resists a lawful search — you can use force.',
        detail: 'Where any provision of this Act confers a power on a constable and does not provide that the power may only be exercised with the consent of some person, the officer may use reasonable force, if necessary, in the exercise of the power.',
        color: '#f59e0b',
    },
    {
        title: 'Breach of the Peace',
        reference: 'Common Law',
        eli5: 'If someone is about to hurt another person or damage property, you can physically step in to stop it — even if no criminal offence has been committed yet.',
        detail: 'Any person may use reasonable force to prevent a breach of the peace or to stop one that is happening. A breach of the peace occurs when harm is done or threatened to a person or their property.',
        color: '#a855f7',
    },
    {
        title: 'Mental Health Act',
        reference: 'MHA 1983 s.135 / s.136',
        eli5: 's.136: If someone in a public place appears to be suffering from mental illness and is at risk, you can take them to a place of safety. s.135: You can enter a premises with a warrant to remove someone for assessment.',
        detail: 's.136 allows an officer to remove a person from a public place to a place of safety if they appear to be suffering from mental disorder and are in immediate need of care or control. Reasonable force may be used.',
        color: '#ef4444',
    },
];

// ─── Common Police Powers ──────────────────────────────────

export interface PolicePower {
    title: string;
    reference: string;
    category: 'stop-search' | 'arrest' | 'entry' | 'seizure' | 'detention' | 'road';
    eli5: string;
    detail: string;
    keyPoints: string[];
    scenario: string;
}

export const POLICE_POWERS: PolicePower[] = [
    // ── Stop & Search ──
    {
        title: 'Stop & Search (General)',
        reference: 'PACE 1984 s.1',
        category: 'stop-search',
        eli5: 'If you reasonably suspect someone has stolen goods, drugs, weapons, or tools for crime on them, you can search them in a public place.',
        detail: 'A police officer may search any person or vehicle for stolen or prohibited articles if they have reasonable grounds for suspecting they will find such articles.',
        keyPoints: ['Need reasonable grounds to suspect', 'Must deliver GOWISELY', 'Can only search outer clothing in public', 'Must record the search'],
        scenario: 'You smell cannabis coming from a man\'s jacket on the High Street. You suspect he has drugs on him. You stop him, deliver GOWISELY, and search his outer clothing.',
    },
    {
        title: 'Search for Drugs',
        reference: 'Misuse of Drugs Act 1971 s.23',
        category: 'stop-search',
        eli5: 'If you reasonably suspect someone has controlled drugs on them, you can search them. This is often used alongside PACE s.1.',
        detail: 'A constable may search any person if they have reasonable grounds to suspect they are in possession of a controlled drug.',
        keyPoints: ['Specific to drug searches', 'Same GOWISELY requirements', 'Covers all classes: A, B, C', 'Can search person AND vehicle'],
        scenario: 'Intelligence briefing flags a known dealer in the area. You see him conducting what looks like a hand-to-hand exchange. You stop and search under MDA s.23.',
    },
    {
        title: 'Section 60 — No Suspicion Search',
        reference: 'Criminal Justice & Public Order Act 1994 s.60',
        category: 'stop-search',
        eli5: 'When a senior officer authorises it (usually after violence), ANY person in the area can be searched — you don\'t need individual suspicion. Lasts up to 24 hours.',
        detail: 'An Inspector (or above) can authorise s.60 if they reasonably believe serious violence may take place, or people are carrying dangerous instruments or offensive weapons.',
        keyPoints: ['No individual suspicion needed', 'Must be authorised by Inspector+', 'Time-limited (initially 24hrs)', 'Specific geographical area', 'Still need to deliver GOWISELY'],
        scenario: 'After a stabbing at a nightclub, an Inspector authorises s.60 for the town centre. You can now search anyone in the area for weapons without needing specific suspicion about that individual.',
    },
    // ── Arrest ──
    {
        title: 'Arrest Without Warrant',
        reference: 'PACE 1984 s.24',
        category: 'arrest',
        eli5: 'You can arrest anyone if you reasonably suspect they\'ve committed, are committing, or are about to commit an offence — BUT you must also show it\'s NECESSARY using IDCOPPLAN.',
        detail: 'A constable may arrest without warrant anyone who they have reasonable grounds to suspect of committing, having committed, or being about to commit an offence, providing arrest is necessary.',
        keyPoints: ['Two tests: reasonable suspicion + necessity', 'Necessity = IDCOPPLAN', 'Must deliver 5-part arrest', 'Caution must be given', 'Use reasonable force if needed (s.117)'],
        scenario: 'You catch a burglar climbing out of a house window with a bag of jewellery. You arrest him under s.24 — necessary for prompt investigation and to prevent disappearance.',
    },
    {
        title: 'Citizen\'s Arrest',
        reference: 'PACE 1984 s.24A',
        category: 'arrest',
        eli5: 'Members of the public can arrest someone they see committing an indictable (serious) offence — but ONLY if it\'s not practical for a police officer to do it instead.',
        detail: 'Any person may arrest without warrant anyone who is in the act of committing an indictable offence, or who they have reasonable grounds to suspect is committing an indictable offence.',
        keyPoints: ['Only for indictable offences (the serious ones)', 'Must be in the act or immediately after', 'Must be necessary (no officer available)', 'Can use reasonable force', 'Risk of civil/criminal liability if wrong'],
        scenario: 'A shop security guard detains a shoplifter who stuffed a £500 laptop in his bag and ran. No police nearby. The guard holds him until police arrive.',
    },
    {
        title: 'Arrest for Breach of the Peace',
        reference: 'Common Law',
        category: 'arrest',
        eli5: 'If someone is causing violence, threatening violence, or putting people in fear — you can arrest them even though "breach of the peace" isn\'t technically a criminal offence.',
        detail: 'A constable (or any person) may arrest without warrant any person who is committing a breach of the peace, or who they reasonably believe will commit one imminently.',
        keyPoints: ['Not a criminal offence — it\'s common law', 'Can arrest to prevent imminent breach', 'Person must be released once breach is over', 'Bind over by magistrates possible', 'Widely used at public order incidents'],
        scenario: 'Two rival football fans are squaring up outside the ground, fists raised, screaming threats. No punch thrown yet, but it\'s about to kick off. You arrest the main aggressor for breach of the peace.',
    },
    // ── Entry ──
    {
        title: 'Entry to Save Life / Prevent Damage',
        reference: 'PACE 1984 s.17(1)(e)',
        category: 'entry',
        eli5: 'You can kick a door down if you believe someone inside is at risk of dying or serious injury, or there\'s serious damage to property happening right now.',
        detail: 'A constable may enter and search premises without warrant for the purpose of saving life or limb or preventing serious damage to property.',
        keyPoints: ['No warrant needed', 'Must genuinely believe life at risk', 'Can force entry if needed', 'Must search only to the extent needed to find the person', 'Record reasons afterwards'],
        scenario: 'Neighbours call saying the elderly woman next door hasn\'t been seen for 5 days and there\'s a smell. You force entry under s.17(1)(e) to check on her welfare.',
    },
    {
        title: 'Entry to Arrest',
        reference: 'PACE 1984 s.17(1)(a-d)',
        category: 'entry',
        eli5: 'You can enter a premises to arrest someone if you have a warrant, or if the offence is indictable (serious), or to recapture someone who\'s escaped custody.',
        detail: 'A constable may enter and search any premises for the purpose of executing an arrest warrant, arresting for an indictable offence, or recapturing a person unlawfully at large.',
        keyPoints: ['Must have reasonable grounds to believe person is on the premises', 'Indictable offences only (not summary-only)', 'Can use force to enter (s.117)', 'Announce your presence first if possible'],
        scenario: 'A suspect in a GBH (grievous bodily harm) case is believed to be hiding at his girlfriend\'s address. You attend and force entry under s.17(1)(b) when nobody answers.',
    },
    {
        title: 'Search After Arrest',
        reference: 'PACE 1984 s.18',
        category: 'entry',
        eli5: 'After you\'ve arrested someone for an indictable (serious) offence, you can search their home address for evidence related to that offence or connected offences.',
        detail: 'A constable may enter and search any premises occupied or controlled by a person under arrest for an indictable offence, if the constable has reasonable grounds for suspecting that evidence relating to the offence is on the premises.',
        keyPoints: ['Only after arrest for indictable offence', 'Must be authorised by Inspector (in writing, unless urgency)', 'Only for evidence of THAT offence or connected offences', 'Record the search'],
        scenario: 'You arrest a drug dealer on the street. Under s.18 (authorised by your Inspector), you search his flat and find 2kg of cocaine, scales, and deal bags.',
    },
    // ── Seizure ──
    {
        title: 'Search of Person on Arrest',
        reference: 'PACE 1984 s.32',
        category: 'seizure',
        eli5: 'When you arrest someone, you can search them there and then for anything that could help them escape, evidence of the offence, or anything that could harm someone.',
        detail: 'A constable may search an arrested person if they have reasonable grounds to believe the person may present a danger, may have concealed evidence, or may have items that could be used for escape.',
        keyPoints: ['Must be at or near the place of arrest', 'Can search for weapons, evidence, or escape tools', 'Can search the immediate area (room, car)', 'Don\'t need a warrant'],
        scenario: 'You arrest a man for assault. You search him and find a knuckle-duster in his pocket and the victim\'s phone in his jacket. Both seized as evidence.',
    },
    {
        title: 'General Power of Seizure',
        reference: 'PACE 1984 s.19',
        category: 'seizure',
        eli5: 'If you\'re lawfully on premises (e.g. executing a warrant or s.18 search), and you find evidence of ANY offence — you can seize it, even if it\'s for a different crime.',
        detail: 'A constable who is lawfully on any premises may seize anything which they have reasonable grounds for believing is evidence of an offence, and it is necessary to seize it to prevent it being concealed, lost, altered, or destroyed.',
        keyPoints: ['Must be lawfully on premises', 'Covers evidence of ANY offence', 'Seizure must be necessary to preserve evidence', 'Cannot seize legally privileged items', 'Record what you seize'],
        scenario: 'You\'re searching a flat under a drugs warrant. You find the drugs, but also spot a stolen bicycle and an illegal firearm. You can seize ALL of it under s.19.',
    },
    // ── Detention ──
    {
        title: 'Detention Limits',
        reference: 'PACE 1984 s.41-44',
        category: 'detention',
        eli5: 'You can hold someone for up to 24 hours normally. A Superintendent can extend to 36 hours. Beyond that — you need a magistrate\'s court to approve up to 96 hours max.',
        detail: 'Standard detention: 24 hours from arrival at custody. Superintendent extension: up to 36 hours. Magistrates\' court warrant: up to 96 hours. Reviews at 6 hours, then every 9 hours.',
        keyPoints: ['24hrs normal max', '36hrs with Superintendent authority', '96hrs max with court warrant', 'Reviews: 6hrs, then every 9hrs', 'PACE clock starts at custody gate'],
        scenario: 'You arrest someone for a complex fraud at 10am. At 10am the next day (24hrs), you haven\'t finished investigating. Your Superintendent authorises extension to 36hrs. At 10pm that night, you apply to magistrates for a warrant to go to 96hrs.',
    },
    {
        title: 'Mental Health — Place of Safety',
        reference: 'MHA 1983 s.136',
        category: 'detention',
        eli5: 'If you find someone in a public place who seems mentally ill and is a risk to themselves or others, you can take them to a place of safety (usually A&E or a mental health unit) — NOT custody unless absolutely necessary.',
        detail: 'If a constable finds a person who appears to be suffering from mental disorder in a place to which the public have access, and in immediate need of care or control, the officer may remove them to a place of safety.',
        keyPoints: ['Public place only', 'Must appear mentally disordered', 'Place of safety = NOT custody (if avoidable)', 'Detention for up to 24 hours (was 72, reduced in 2017)', 'Person must be assessed by a mental health professional'],
        scenario: 'A woman is standing on a bridge ledge saying she wants to end her life. You talk her down, then use s.136 to take her to the local mental health unit for assessment by a crisis team.',
    },
    // ── Road ──
    {
        title: 'Stop Vehicles',
        reference: 'Road Traffic Act 1988 s.163',
        category: 'road',
        eli5: 'You can stop ANY vehicle on a road. No reason needed. The driver MUST stop. If they don\'t, that\'s an offence in itself.',
        detail: 'A person driving a motor vehicle on a road must stop the vehicle on being required to do so by a constable in uniform.',
        keyPoints: ['No suspicion needed — you can stop any vehicle', 'Must be in uniform (or marked car)', 'Failure to stop is an offence', 'Can request to see driving licence, MOT, insurance', 'Commonly used for traffic checks and roadside operations'],
        scenario: 'You set up a checkpoint on a Friday night near the pubs. You can stop every car that passes and check the driver isn\'t drunk, their licence is valid, and the vehicle is legal.',
    },
    {
        title: 'Driving Offences — Breath Test',
        reference: 'Road Traffic Act 1988 s.6',
        category: 'road',
        eli5: 'If you suspect a driver has been drinking, or they\'ve been in an accident, or they committed a moving traffic offence — you can require them to do a roadside breath test.',
        detail: 'A constable in uniform may require a roadside breath test if they have reasonable cause to suspect the person is driving under the influence, has committed a moving traffic offence, or has been involved in an accident.',
        keyPoints: ['Must be in uniform', 'Need suspicion of drink/drugs, or accident, or traffic offence', 'Refusal to provide is an offence (same penalty as positive)', 'Positive = arrest and station procedure', 'Legal limit: 35 micrograms per 100ml breath'],
        scenario: 'You stop a car that swerved across lanes. The driver\'s eyes are glazed and you can smell alcohol. You require a roadside breath test. It reads 52 — over the limit. You arrest her.',
    },
    {
        title: 'Seize Vehicles — No Insurance / Licence',
        reference: 'Road Traffic Act 1988 s.165A',
        category: 'road',
        eli5: 'If a driver can\'t prove they have insurance or a valid licence, you can seize the vehicle on the spot. They\'ll have to pay to get it back.',
        detail: 'If a vehicle is being driven without insurance or without a valid licence, a constable may seize the vehicle and remove it.',
        keyPoints: ['Can seize immediately', 'Driver doesn\'t need to produce instantly — can produce within 7 days at a station', 'Vehicle held at pound until insurance/licence produced', 'If not claimed within 14 days, vehicle can be destroyed'],
        scenario: 'You stop a car and the driver has no insurance. PNC confirms no policy. You seize the vehicle under s.165A, call a recovery truck, and the driver walks home.',
    },
];

// Category metadata for display
export const POWER_CATEGORIES = [
    { key: 'stop-search', label: 'Stop & Search', icon: '🔍', color: '#4ade80' },
    { key: 'arrest', label: 'Arrest', icon: '⚖️', color: '#ef4444' },
    { key: 'entry', label: 'Entry', icon: '🚪', color: '#3b82f6' },
    { key: 'seizure', label: 'Seizure', icon: '📦', color: '#f59e0b' },
    { key: 'detention', label: 'Detention', icon: '🔒', color: '#a855f7' },
    { key: 'road', label: 'Road Traffic', icon: '🚗', color: '#06b6d4' },
] as const;
