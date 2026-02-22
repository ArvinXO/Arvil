// Interactive policing scenarios — observe → stop/search → arrest flow
// Five-part arrest, GOWISELY compliance, necessity criteria

import { generateName, generatePlate } from './generators';

// ─── Five-Part Arrest ──────────────────────────────────────

export interface ArrestStep {
    part: number;
    label: string;
    template: string;
    fieldName: string;
    placeholder: string;
    hint: string;
}

export const FIVE_PART_ARREST: ArrestStep[] = [
    {
        part: 1,
        label: 'Identify yourself',
        template: 'I am {rank} {name}, collar number {collar}, of {station}.',
        fieldName: 'identification',
        placeholder: 'I am PC Smith, collar number 1234, of Newtown Police Station.',
        hint: 'State your rank, name, collar number, and station.',
    },
    {
        part: 2,
        label: 'State the time & offence',
        template: 'The time is {time}. You are under arrest for {offence}.',
        fieldName: 'offence',
        placeholder: 'The time is 16:45. You are under arrest for possession of a controlled drug, contrary to section 5(2) of the Misuse of Drugs Act 1971.',
        hint: 'State the TIME first, then the specific offence and legislation.',
    },
    {
        part: 3,
        label: 'State the grounds',
        template: 'The grounds for your arrest are {grounds}.',
        fieldName: 'grounds',
        placeholder: 'The grounds for your arrest are that upon searching you, a quantity of white powder was found which I suspect to be a Class A drug.',
        hint: 'Explain WHY you are arresting — what evidence/suspicion.',
    },
    {
        part: 4,
        label: 'State the necessity (IDCOPPLAN)',
        template: 'It is necessary to arrest you to {necessity}.',
        fieldName: 'necessity',
        placeholder: 'It is necessary to arrest you to allow the prompt and effective investigation of the offence.',
        hint: 'PACE s.24(5) — use IDCOPPLAN. Why is arrest NECESSARY?',
    },
    {
        part: 5,
        label: 'Give the caution',
        template: 'You do not have to say anything. But it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence. Do you understand?',
        fieldName: 'caution',
        placeholder: 'You do not have to say anything. But it may harm your defence...',
        hint: 'The full caution — word-perfect.',
    },
];

// ─── IDCOPPLAN — Necessity Criteria (PACE s.24(5)) ─────────

export const NECESSITY_CRITERIA = [
    { code: 'investigation', letter: 'I', label: 'Investigation', desc: 'To allow prompt and effective investigation of the offence' },
    { code: 'disappear', letter: 'D', label: 'Disappearance', desc: 'To prevent disappearance / hindrance of prosecution' },
    { code: 'child', letter: 'C', label: 'Child / Vulnerable', desc: 'To protect a child or other vulnerable person' },
    { code: 'obstruction', letter: 'O', label: 'Obstruction', desc: 'To prevent unlawful obstruction of the highway' },
    { code: 'injury', letter: 'P', label: 'Physical injury', desc: 'To prevent physical injury to any person' },
    { code: 'decency', letter: 'P', label: 'Public decency', desc: 'To prevent an offence against public decency' },
    { code: 'damage', letter: 'L', label: 'Loss / Damage', desc: 'To prevent loss of or damage to property' },
    { code: 'address', letter: 'A', label: 'Address', desc: 'To ascertain address (if not known or doubted)' },
    { code: 'name', letter: 'N', label: 'Name', desc: 'To ascertain name (if not known or doubted)' },
];

// ─── GOWISELY Steps for Scenario ───────────────────────────

export interface GOWISELYStep {
    letter: string;
    word: string;
    question: string;
    placeholder: string;
    keywords: string[];
}

export const GOWISELY_STEPS: GOWISELYStep[] = [
    {
        letter: 'G', word: 'Grounds',
        question: 'What are your grounds for searching this person?',
        placeholder: 'I have reasonable grounds to suspect...',
        keywords: ['reasonable', 'grounds', 'suspect', 'believe'],
    },
    {
        letter: 'O', word: 'Object',
        question: 'What are you searching for?',
        placeholder: 'I am searching for...',
        keywords: ['drugs', 'weapon', 'stolen', 'evidence', 'searching for'],
    },
    {
        letter: 'W', word: 'Warrant Card',
        question: 'If in plain clothes, have you shown your warrant card?',
        placeholder: 'I am in full uniform / I have shown my warrant card',
        keywords: ['warrant', 'uniform', 'card', 'shown'],
    },
    {
        letter: 'I', word: 'Identity',
        question: 'Provide your name and collar number.',
        placeholder: 'I am PC Smith, collar number 1234',
        keywords: ['pc', 'collar', 'name', 'officer'],
    },
    {
        letter: 'S', word: 'Station',
        question: 'What station are you attached to?',
        placeholder: 'I am attached to Newtown Police Station',
        keywords: ['station', 'attached', 'based'],
    },
    {
        letter: 'E', word: 'Entitlement',
        question: 'Inform of their right to a copy of the search record.',
        placeholder: 'You are entitled to a copy of the search record...',
        keywords: ['entitled', 'copy', 'record', 'search'],
    },
    {
        letter: 'L', word: 'Legislation',
        question: 'What power are you using?',
        placeholder: 'Under section 1 of PACE 1984...',
        keywords: ['section', 'pace', 'act', 'misuse', 'power'],
    },
    {
        letter: 'Y', word: 'You are being detained',
        question: 'Inform them they are being detained for the purpose of a search.',
        placeholder: 'You are being detained for the purpose of a search...',
        keywords: ['detained', 'purpose', 'search'],
    },
];

// ─── Scenario Generator ────────────────────────────────────

export interface Scenario {
    id: string;
    title: string;
    type: 'stop-search' | 'arrest' | 'stop-search-arrest';
    setting: string;
    time: string;
    suspectName: string;
    suspectDescription: string;
    observation: string;
    intelligence: string;
    searchRequired: boolean;
    searchFinds: string;
    offence: string;
    legislation: string;
    suspicionAllayed: boolean;
    arrestRequired: boolean;
    necessityCriteria: string[];
}

const SCENARIOS: (() => Scenario)[] = [
    // Drug offences
    () => {
        const name = generateName();
        return {
            id: 'drug-street-deal',
            title: 'Suspected Street Deal',
            type: 'stop-search-arrest',
            setting: 'You are on foot patrol on the High Street',
            time: '22:15',
            suspectName: name,
            suspectDescription: 'White male, approximately 25 years old, slim build, wearing a dark hoodie and grey joggers',
            observation: `You observe a male matching the description of ${name} engage in what appears to be a hand-to-hand exchange with another person. The other person quickly walks away. ${name} then places his hand in his right hoodie pocket and looks around nervously.`,
            intelligence: 'Local intelligence suggests this area is a known drug dealing hotspot. A recent briefing flagged increased reports of street-level dealing in this location.',
            searchRequired: true,
            searchFinds: 'Upon searching the right hoodie pocket, you find 3 small snap-seal bags containing white powder and £85 in cash in various denominations.',
            offence: 'Possession with intent to supply a controlled drug (Class A)',
            legislation: 'Misuse of Drugs Act 1971, section 5(3)',
            suspicionAllayed: false,
            arrestRequired: true,
            necessityCriteria: ['investigation', 'disappear'],
        };
    },
    // Knife / offensive weapon
    () => {
        const name = generateName();
        return {
            id: 'knife-possession',
            title: 'Suspected Weapon',
            type: 'stop-search-arrest',
            setting: 'You are responding to a call near the town centre',
            time: '01:30',
            suspectName: name,
            suspectDescription: 'Black male, approximately 19 years old, medium build, wearing a puffer jacket, dark jeans, and white trainers',
            observation: `A member of the public flags you down and points towards ${name}, stating they saw the male tuck something shiny into his waistband. The male sees you approaching and begins to walk quickly in the opposite direction, adjusting his waistband.`,
            intelligence: 'The area has had a recent spike in knife crime. Section 60 is NOT in force.',
            searchRequired: true,
            searchFinds: 'Upon searching the waistband area, you find a folding lock-knife with a 4-inch blade.',
            offence: 'Possession of a bladed article in a public place',
            legislation: 'Criminal Justice Act 1988, section 139(1)',
            suspicionAllayed: false,
            arrestRequired: true,
            necessityCriteria: ['investigation', 'injury'],
        };
    },
    // Theft / shoplifting
    () => {
        const name = generateName();
        return {
            id: 'shoplifting',
            title: 'Suspected Shoplifter',
            type: 'stop-search-arrest',
            setting: 'You are called to a supermarket on the retail park',
            time: '14:45',
            suspectName: name,
            suspectDescription: 'White female, approximately 35 years old, heavy build, wearing a large overcoat and carrying a shopping bag',
            observation: `The store security officer shows you CCTV footage of ${name} placing items into her bag without scanning them at the self-checkout. She then attempted to leave the store. Security detained her at the door. The bag contains approximately £120 worth of unpaid goods including alcohol and cosmetics.`,
            intelligence: 'PNC check reveals ${name} has 3 previous convictions for theft from shops and is currently on a conditional discharge.',
            searchRequired: false,
            searchFinds: '£120 of unpaid goods in her bag, and a "booster bag" (foil-lined bag designed to defeat security tags).',
            offence: 'Theft from a shop',
            legislation: 'Theft Act 1968, section 1',
            suspicionAllayed: false,
            arrestRequired: true,
            necessityCriteria: ['investigation', 'name'],
        };
    },
    // Public order
    () => {
        const name = generateName();
        return {
            id: 'public-order',
            title: 'Public Order Incident',
            type: 'stop-search-arrest',
            setting: 'You are called to a disturbance outside a pub',
            time: '23:50',
            suspectName: name,
            suspectDescription: 'White male, approximately 40 years old, stocky build, bald head, wearing a checked shirt covered in what appears to be blood',
            observation: `Upon arrival, you see ${name} standing in the street shouting aggressively at passers-by. He is using threatening language: "COME ON THEN, I'LL HAVE THE LOT OF YOU!" Several members of the public appear frightened and are crossing the road to avoid him. A female is sat on the pavement crying with a swollen face.`,
            intelligence: 'Two 999 calls reporting a male punching a female and then threatening bystanders.',
            searchRequired: false,
            searchFinds: '',
            offence: 'Assault by beating / Section 4 Public Order Act',
            legislation: 'Criminal Justice Act 1988 s.39 / Public Order Act 1986 s.4',
            suspicionAllayed: false,
            arrestRequired: true,
            necessityCriteria: ['injury', 'investigation', 'child'],
        };
    },
    // Cannabis smell — search then no arrest
    () => {
        const name = generateName();
        const plate = generatePlate();
        return {
            id: 'cannabis-vehicle',
            title: 'Cannabis Smell from Vehicle',
            type: 'stop-search',
            setting: 'You have stopped a vehicle for a routine traffic check',
            time: '19:30',
            suspectName: name,
            suspectDescription: 'Asian male, approximately 22 years old, slim build, wearing a tracksuit',
            observation: `You approach the vehicle (${plate}) and upon speaking with the driver ${name}, you detect a strong smell of cannabis emanating from inside the vehicle. The driver appears nervous and avoids eye contact. You can see a grinder on the passenger seat.`,
            intelligence: 'No current intelligence on this individual or vehicle.',
            searchRequired: true,
            searchFinds: 'Upon searching the vehicle, you find a small amount of cannabis herb (approx. 1g) in a tin in the glovebox. No other drugs or paraphernalia found beyond the grinder.',
            offence: 'Possession of a controlled drug (Class B)',
            legislation: 'Misuse of Drugs Act 1971, section 5(2)',
            suspicionAllayed: true,
            arrestRequired: false,
            necessityCriteria: [],
        };
    },
    // Burglary suspect
    () => {
        const name = generateName();
        return {
            id: 'burglary-suspect',
            title: 'Suspected Burglar',
            type: 'stop-search-arrest',
            setting: 'You are on night patrol in a residential area',
            time: '03:15',
            suspectName: name,
            suspectDescription: 'Mixed-race male, approximately 30 years old, wearing all dark clothing, gloves, and a beanie hat',
            observation: `You observe ${name} climbing over a garden wall of a residential property carrying a rucksack. Upon seeing your patrol car, he drops the rucksack and runs. You pursue on foot and detain him after a short chase. The rucksack contains a laptop, jewellery, and a crowbar.`,
            intelligence: 'There have been 4 burglaries in this street over the past 2 weeks with a similar MO — rear entry, electronics and jewellery targeted.',
            searchRequired: false,
            searchFinds: 'Rucksack already recovered containing stolen property and a crowbar. A balaclava is found in his jacket pocket upon search incident to arrest.',
            offence: 'Burglary (dwelling)',
            legislation: 'Theft Act 1968, section 9(1)(b)',
            suspicionAllayed: false,
            arrestRequired: true,
            necessityCriteria: ['investigation', 'disappear', 'address'],
        };
    },
];

export function generateScenario(): Scenario {
    const generator = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    return generator();
}

export function getAllScenarios(): Scenario[] {
    return SCENARIOS.map(gen => gen());
}

// ─── Caution Text (for checking) ───────────────────────────

export const FULL_CAUTION = 'You do not have to say anything. But it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence.';

export function checkCaution(input: string): { accuracy: number; missing: string[] } {
    const key = FULL_CAUTION.toLowerCase();
    const user = input.toLowerCase().trim();

    const keyPhrases = [
        'do not have to say anything',
        'may harm your defence',
        'do not mention when questioned',
        'later rely on in court',
        'anything you do say',
        'may be given in evidence',
    ];

    const missing: string[] = [];
    let found = 0;

    for (const phrase of keyPhrases) {
        if (user.includes(phrase.substring(0, Math.min(20, phrase.length)))) {
            found++;
        } else {
            missing.push(phrase);
        }
    }

    return {
        accuracy: (found / keyPhrases.length) * 100,
        missing,
    };
}
