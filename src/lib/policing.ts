// Policing procedure knowledge base
// Sources: College of Policing, PACE Code C, National Decision Model

// ─── MG11 Witness Statement (5-Part Structure) ────────────────

export interface MG11Section {
    part: number;
    title: string;
    description: string;
    prompts: string[];
    tips: string[];
    color: string;
}

export const MG11_SECTIONS: MG11Section[] = [
    {
        part: 1,
        title: 'Introduction & Summary',
        description: 'Set the scene. Who you are, your role, why you were there, and a one-line summary of what happened.',
        prompts: [
            'State your name, rank/role, and station/team',
            'Date and time you became involved',
            'Reason for being at the location',
            'One-sentence summary of the incident',
        ],
        tips: [
            'Use formal language: "I am PC [Name], collar number [X], attached to [team]"',
            'Be precise with date/time — use 24-hour format',
            'State whether you were on/off duty',
        ],
        color: '#4ade80',
    },
    {
        part: 2,
        title: 'Cast of Known Individuals',
        description: 'Identify all persons you know who are relevant to the incident.',
        prompts: [
            'Name each known person and their role (victim, witness, suspect)',
            'How you know them (if applicable)',
            'Their relationship to other persons in the incident',
            'Any relevant background about them',
        ],
        tips: [
            'If you don\'t know anyone, state "I did not know any of the persons involved"',
            'Include other officers/professionals present',
            'Use full names where known',
        ],
        color: '#3b82f6',
    },
    {
        part: 3,
        title: 'Description of Location',
        description: 'Paint a picture of the scene. Layout, lighting, conditions, and relevant features.',
        prompts: [
            'Full address/location of the incident',
            'Layout of the area (street, building, room)',
            'Lighting conditions and weather',
            'Any CCTV, obstacles, or notable features',
            'Distances and spatial relationships',
        ],
        tips: [
            'Include compass directions where relevant',
            'Note camera locations for CCTV',
            'Describe visibility conditions (ADVOKATE: Distance, Visibility)',
            'Include a sketch/plan reference if applicable',
        ],
        color: '#f59e0b',
    },
    {
        part: 4,
        title: 'Action & Dialogue',
        description: 'Chronological account of what happened. This is the core of the statement — what you saw, heard, said, and did.',
        prompts: [
            'What first drew your attention to the incident?',
            'What did you see/hear? (in chronological order)',
            'What was said? (use DIRECT SPEECH in capitals where possible)',
            'What actions did you take?',
            'How did you introduce unknown persons? (use distinguishing features)',
            'ADVOKATE considerations throughout',
        ],
        tips: [
            'Write in first person, past tense',
            'Direct speech in CAPITALS: The male stated, "I DIDN\'T DO ANYTHING"',
            'Introduce unknown suspects by their most distinguishing feature',
            'Include your thought process and reasons for decisions (NDM)',
            'Note any use of force and justification',
            'Be specific about times between events',
        ],
        color: '#ef4444',
    },
    {
        part: 5,
        title: 'Closure',
        description: 'Full descriptions, injuries, damage, impact, and remaining ADVOKATE considerations.',
        prompts: [
            'Full 10-point description of each unknown person',
            'Details of any injuries sustained (by anyone)',
            'Damage to property and estimated costs',
            'Victim Personal Statement (impact on victim)',
            'Any remaining ADVOKATE considerations',
            'Exhibits/evidence referenced in the statement',
        ],
        tips: [
            '10-point description: Age, Build, Colour, Distinguishing marks, Elevation (height), Face, Gait, Hair, IC code, Jewellery/accessories',
            'Injuries: type, location on body, who administered first aid',
            'VPS: emotional, physical, financial impact on victim',
            'List all exhibits with reference numbers',
        ],
        color: '#a855f7',
    },
];

// ─── ADVOKATE (Witness Assessment) ─────────────────────────

export interface MnemonicItem {
    letter: string;
    word: string;
    description: string;
    prompts: string[];
}

export const ADVOKATE: MnemonicItem[] = [
    {
        letter: 'A', word: 'Amount of time', description: 'How long did you observe the incident?',
        prompts: ['Duration of observation', 'Any breaks in observation']
    },
    {
        letter: 'D', word: 'Distance', description: 'How far away were you?',
        prompts: ['Distance from the incident', 'Did distance change?']
    },
    {
        letter: 'V', word: 'Visibility', description: 'What were the conditions?',
        prompts: ['Lighting', 'Weather', 'Obstructions']
    },
    {
        letter: 'O', word: 'Obstruction', description: 'Was your view blocked at any point?',
        prompts: ['Physical barriers', 'Moving objects', 'People in the way']
    },
    {
        letter: 'K', word: 'Known', description: 'Did you know or recognise anyone?',
        prompts: ['Previous knowledge of persons', 'How do you know them?']
    },
    {
        letter: 'A', word: 'Any reason to remember', description: 'Why does this stand out?',
        prompts: ['Unusual features', 'Actions that drew attention', 'Emotional impact']
    },
    {
        letter: 'T', word: 'Time elapsed', description: 'How long between the event and your account?',
        prompts: ['Time before making notes', 'Time before statement']
    },
    {
        letter: 'E', word: 'Errors / Discrepancies', description: 'Any mistakes or inconsistencies?',
        prompts: ['Corrections made', 'Uncertainties', 'Things you\'re not sure about']
    },
];

// ─── GOWISELY (Stop & Search) ──────────────────────────────

export const GOWISELY: MnemonicItem[] = [
    {
        letter: 'G', word: 'Grounds', description: 'Your reasonable grounds for the search',
        prompts: ['What made you suspect?', 'What behaviour/intelligence?']
    },
    {
        letter: 'O', word: 'Object', description: 'What you are looking for',
        prompts: ['Drugs, weapons, stolen property, evidence?']
    },
    {
        letter: 'W', word: 'Warrant card', description: 'Show warrant card if in plain clothes',
        prompts: ['Did you show your warrant card?', 'Were you in uniform?']
    },
    {
        letter: 'I', word: 'Identity', description: 'Provide your name and collar number',
        prompts: ['Full name', 'Collar/shoulder number']
    },
    {
        letter: 'S', word: 'Station', description: 'Which station you are attached to',
        prompts: ['Your home station or team']
    },
    {
        letter: 'E', word: 'Entitlement', description: 'Their right to a copy of the search record',
        prompts: ['Explain right to a copy', 'How to obtain it']
    },
    {
        letter: 'L', word: 'Legislation', description: 'The legal power you are using',
        prompts: ['PACE s.1', 'Misuse of Drugs Act s.23', 'Other powers']
    },
    {
        letter: 'Y', word: 'You are being detained', description: 'Tell them they are being detained for a search',
        prompts: ['Clear communication of detention', '"You are detained for the purpose of a search"']
    },
];

// ─── NASCH (PNC Name Check) ────────────────────────────────

export const NASCH: MnemonicItem[] = [
    {
        letter: 'N', word: 'Name', description: 'Full name of the person',
        prompts: ['Surname', 'First name(s)', 'Any aliases or maiden names']
    },
    {
        letter: 'A', word: 'Age / Date of Birth', description: 'Their date of birth or approximate age',
        prompts: ['Full DOB (DD/MM/YYYY)', 'If unknown, estimated age range']
    },
    {
        letter: 'S', word: 'Sex', description: 'Male or Female',
        prompts: ['Gender as per PNC records']
    },
    {
        letter: 'C', word: 'Colour / IC Code', description: 'Identity Code (IC1-IC6)',
        prompts: ['IC1: White European', 'IC2: Dark European', 'IC3: African/Caribbean', 'IC4: Asian', 'IC5: Chinese/Japanese/SE Asian', 'IC6: Other']
    },
    {
        letter: 'H', word: 'Height', description: 'Approximate height',
        prompts: ['Height in feet/inches or centimetres', 'Build can help if height is estimated']
    },
];

// ─── Custody Procedures (PACE Code C) ──────────────────────

export interface CustodyStep {
    order: number;
    title: string;
    description: string;
    requirements: string[];
    legalRef: string;
    critical: boolean;
}

export const CUSTODY_PROCEDURE: CustodyStep[] = [
    {
        order: 1,
        title: 'Arrive at Custody',
        description: 'Present the detained person to the Custody Officer. Do NOT discuss the case in front of the DP.',
        requirements: [
            'State the offence and grounds for arrest',
            'Confirm necessity criteria for detention',
            'Provide any relevant risk information',
            'Hand over any seized property',
        ],
        legalRef: 'PACE s.37',
        critical: true,
    },
    {
        order: 2,
        title: 'Custody Officer Decision',
        description: 'The Custody Officer decides whether there is sufficient evidence to charge or whether detention is necessary.',
        requirements: [
            'Sufficient evidence to charge? → charge or release',
            'Not sufficient? → Is detention necessary to obtain/preserve evidence or by questioning?',
            'Record grounds for detention on custody record',
        ],
        legalRef: 'PACE s.37(2)',
        critical: true,
    },
    {
        order: 3,
        title: 'Rights & Entitlements',
        description: 'The detained person must be informed of their rights.',
        requirements: [
            'Right to have someone informed of arrest (s.56)',
            'Right to consult privately with a solicitor (s.58)',
            'Right to consult the Codes of Practice',
            'Right to free and independent legal advice',
            'Provide written notice of rights',
            'Explain right to a copy of the custody record on release',
        ],
        legalRef: 'PACE Code C 3.1-3.5',
        critical: true,
    },
    {
        order: 4,
        title: 'Risk Assessment',
        description: 'Assess the detained person for risks to themselves and others.',
        requirements: [
            'Mental health concerns / self-harm risk',
            'Physical health / medical needs / medication',
            'Drug/alcohol dependency or intoxication',
            'Dietary requirements',
            'Any disabilities or communication needs',
            'Appropriate Adult required? (vulnerable/juvenile)',
        ],
        legalRef: 'PACE Code C 3.6-3.10',
        critical: true,
    },
    {
        order: 5,
        title: 'Search & Property',
        description: 'Search the detained person and record all property.',
        requirements: [
            'Search to the extent necessary (PACE s.54)',
            'Record all property on custody record',
            'Items retained or returned to DP',
            'Remove items that could cause harm',
            'Clothing: only remove if necessary, provide replacement',
        ],
        legalRef: 'PACE s.54, Code C 4',
        critical: false,
    },
    {
        order: 6,
        title: 'Detention Reviews',
        description: 'Regular reviews of the need for continued detention.',
        requirements: [
            'First review: 6 hours after detention authorised',
            'Subsequent reviews: every 9 hours',
            'Maximum detention: 24 hours (36 with Superintendent authority)',
            'Beyond 36 hours: requires Magistrates\' Court warrant',
            'Review can be by phone/video if not practicable in person',
        ],
        legalRef: 'PACE s.40',
        critical: true,
    },
    {
        order: 7,
        title: 'Care & Welfare',
        description: 'Ongoing duty of care throughout detention.',
        requirements: [
            'At least 2 light meals and 1 main meal per 24 hours',
            'Drinks at meal times and on reasonable request',
            '8 hours continuous rest per 24 hours',
            'Brief outdoor exercise daily if practicable',
            'Medical attention if required',
            'Cell visits at least every hour (more if intoxicated)',
        ],
        legalRef: 'PACE Code C 8-9',
        critical: false,
    },
    {
        order: 8,
        title: 'Interview',
        description: 'Conducting the interview under caution.',
        requirements: [
            'Caution before interview: "You do not have to say anything..."',
            'Right to solicitor (delay only in limited circumstances)',
            'Appropriate Adult for vulnerable adults/juveniles',
            'Audio/video recording (Code E/F)',
            'Breaks: refreshments, comfort, medical needs',
            'Interpreter if needed',
        ],
        legalRef: 'PACE Code C 11-12, Code E',
        critical: true,
    },
    {
        order: 9,
        title: 'Charge / Release',
        description: 'Decision on outcome after investigation.',
        requirements: [
            'Charge: read charge and caution, provide charge sheet',
            'Release without charge: release as soon as grounds cease',
            'Bail: conditions must be necessary and proportionate',
            'Released Under Investigation (RUI)',
            'Record outcome on custody record',
        ],
        legalRef: 'PACE s.37, 38',
        critical: true,
    },
];

// ─── PNB Entry Requirements ────────────────────────────────

export interface PNBRequirement {
    category: string;
    items: string[];
    tip: string;
}

export const PNB_REQUIREMENTS: PNBRequirement[] = [
    {
        category: 'Header (every entry)',
        items: ['Date', 'Time (24hr)', 'Duty number/tour', 'Location', 'Weather conditions'],
        tip: 'Start every page with this. Never leave blank pages.',
    },
    {
        category: 'Person Encountered',
        items: [
            'Full name (+ alias/maiden)',
            'Date of birth',
            'Address',
            'Phone number',
            'IC code and description',
            'Reason for encounter',
        ],
        tip: 'Use NASCH for PNC checks.',
    },
    {
        category: 'Incident Notes',
        items: [
            'CAD/Reference number',
            'Time of call / time of arrival',
            'Informant details',
            'Persons present (names, roles)',
            'Account given by each person',
            'Your observations and actions',
            'Direct speech where relevant',
            'Evidence seized / photographs taken',
        ],
        tip: 'Write contemporaneous notes as soon as practicable.',
    },
    {
        category: 'Stop & Search',
        items: [
            'GOWISELY compliance',
            'Self-defined ethnicity',
            'Outcome of search',
            'Search record reference',
        ],
        tip: 'Complete the search record form in addition to PNB.',
    },
    {
        category: 'Use of Force',
        items: [
            'Type of force used',
            'Justification (NDM threat assessment)',
            'Subject\'s behaviour before, during, after',
            'Injuries (to anyone)',
            'Medical attention provided',
            'Body-worn video activated?',
        ],
        tip: 'Complete a Use of Force form separately.',
    },
    {
        category: 'Closing Entry',
        items: ['Time duty ended', 'Any outstanding actions', 'Signature/initials'],
        tip: 'Draw a line under the last entry if ending duty.',
    },
];

// ─── Custody Front Sheet — What Arresting Officer Provides ─

export interface CustodyFrontSheetField {
    section: string;
    color: string;
    fields: { label: string; detail: string; critical: boolean }[];
}

export const CUSTODY_FRONT_SHEET: CustodyFrontSheetField[] = [
    {
        section: 'PACE Clock & Arrival',
        color: '#ef4444',
        fields: [
            { label: 'Time arrived at custody gate', detail: 'PACE clock starts — exact time entering the custody suite gate/door', critical: true },
            { label: 'Time presented to Custody Sgt', detail: 'Time the DP is presented to the Custody Officer at the desk', critical: true },
            { label: 'Custody suite location', detail: 'Which custody suite (e.g. "Newtown Custody Suite")', critical: true },
            { label: 'Custody Officer name/number', detail: 'Name and collar number of the Custody Sergeant', critical: false },
            { label: 'Arresting Officer details', detail: 'Your name, collar number, team, station', critical: true },
        ],
    },
    {
        section: 'Detained Person Details',
        color: '#3b82f6',
        fields: [
            { label: 'Full name (surname, forenames)', detail: 'As confirmed by DP or PNC. Include aliases/maiden names', critical: true },
            { label: 'Date of birth', detail: 'DD/MM/YYYY — cross-reference with PNC', critical: true },
            { label: 'Home address', detail: 'Full current address including postcode', critical: true },
            { label: 'Ethnicity (self-defined)', detail: 'Ask the DP to self-define. Use Home Office codes if applicable', critical: true },
            { label: 'Gender', detail: 'Male/Female/Other as stated by the DP', critical: false },
            { label: 'PNC ID / CRO number', detail: 'PNC identifier if known from earlier check', critical: false },
            { label: 'Phone number', detail: 'Contact number for the DP', critical: false },
            { label: 'Occupation', detail: 'Employment status and role', critical: false },
        ],
    },
    {
        section: 'Arrest Details — What You Tell the Custody Sgt',
        color: '#f59e0b',
        fields: [
            { label: 'Time of arrest', detail: 'Exact time the arrest was made (24hr format)', critical: true },
            { label: 'Location of arrest', detail: 'Full address or location where the arrest took place', critical: true },
            { label: 'Offence', detail: 'The specific offence and legislation (e.g. "Theft Act 1968 s.1")', critical: true },
            { label: 'Circumstances', detail: 'Brief summary of what happened — your grounds for arrest', critical: true },
            { label: 'Necessity (IDCOPPLAN)', detail: 'WHY arrest was necessary — which IDCOPPLAN criteria apply', critical: true },
            { label: 'Caution given?', detail: 'Confirm caution was delivered. Note any significant statements made', critical: true },
            { label: 'Use of force?', detail: 'Any force used during arrest — type and justification', critical: true },
        ],
    },
    {
        section: 'Risk Information',
        color: '#a855f7',
        fields: [
            { label: 'Self-harm / suicide risk', detail: 'Any concerns, previous attempts, current mental state', critical: true },
            { label: 'Violence risk', detail: 'Any threats made, known for violence, warnings on PNC', critical: true },
            { label: 'Medical conditions', detail: 'Known medical issues, medications, injuries sustained', critical: true },
            { label: 'Drug/alcohol intoxication', detail: 'Signs of intoxication, substances disclosed, needle risk', critical: true },
            { label: 'Appropriate Adult needed?', detail: 'Under 18, mental health, learning difficulties — if yes, AA must be called', critical: true },
            { label: 'Interpreter needed?', detail: 'Language barriers, hearing impairment', critical: false },
            { label: 'Escape risk', detail: 'Any attempts to flee, known for escape, previous breach', critical: false },
        ],
    },
    {
        section: 'Property & Evidence',
        color: '#4ade80',
        fields: [
            { label: 'Property seized', detail: 'List all items seized from the DP — description and quantity', critical: true },
            { label: 'Evidential property', detail: 'Items that form part of the evidence (drugs, weapons, etc.)', critical: true },
            { label: 'Cash', detail: 'Exact amount and denominations', critical: false },
            { label: 'Vehicle', detail: 'If vehicle involved — VRM, make, model, colour, location', critical: false },
            { label: 'Clothing for forensics?', detail: 'Any clothing needing forensic examination — need replacement clothing', critical: false },
        ],
    },
    {
        section: 'Pre-Detention Observations',
        color: '#06b6d4',
        fields: [
            { label: 'DP demeanour', detail: 'Cooperative, aggressive, distressed, calm, withdrawn', critical: false },
            { label: 'Anything said post-arrest', detail: 'Any significant statements, comments, or admissions', critical: true },
            { label: 'Witnesses present at arrest', detail: 'Names and details of any witnesses', critical: false },
            { label: 'Body-worn video', detail: 'Was BWV activated? Reference number if applicable', critical: true },
            { label: 'Other officers involved', detail: 'Names, collar numbers, and roles of other officers at scene', critical: false },
        ],
    },
];

