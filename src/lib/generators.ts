// Synthetic data generators — no real-world data ever stored

const LETTERS = 'ABCDEFGHJKLMNOPRSTUVWXYZ'; // Excludes I, Q (not used on UK plates)
const DIGITS = '0123456789';

function randomFrom(str: string): string {
    return str[Math.floor(Math.random() * str.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate synthetic UK-format registration plate (AB12 CDE)
export function generatePlate(): string {
    const area1 = randomFrom(LETTERS);
    const area2 = randomFrom(LETTERS);
    const age1 = randomFrom(DIGITS);
    const age2 = randomFrom(DIGITS);
    const rand1 = randomFrom(LETTERS);
    const rand2 = randomFrom(LETTERS);
    const rand3 = randomFrom(LETTERS);
    return `${area1}${area2}${age1}${age2} ${rand1}${rand2}${rand3}`;
}

// Generate multiple unique plates
export function generatePlates(count: number): string[] {
    const plates = new Set<string>();
    while (plates.size < count) {
        plates.add(generatePlate());
    }
    return Array.from(plates);
}

// Fake name generator
const FIRST_NAMES = [
    'James', 'Sarah', 'Michael', 'Emma', 'David', 'Sophie', 'Daniel', 'Laura',
    'Thomas', 'Jessica', 'Christopher', 'Hannah', 'Matthew', 'Charlotte', 'Andrew',
    'Rebecca', 'Robert', 'Victoria', 'William', 'Emily', 'Richard', 'Megan',
    'Joseph', 'Lauren', 'Mark', 'Chloe', 'Steven', 'Natasha', 'Paul', 'Rachel',
    'George', 'Olivia', 'Peter', 'Amy', 'Jack', 'Katie', 'Luke', 'Holly',
    'Ben', 'Jade', 'Sam', 'Alice', 'Harry', 'Grace', 'Charlie', 'Ellie'
];

const LAST_NAMES = [
    'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson',
    'Thomas', 'Johnson', 'Roberts', 'Robinson', 'Thompson', 'Wright', 'Walker',
    'White', 'Edwards', 'Hughes', 'Green', 'Hall', 'Lewis', 'Harris', 'Clarke',
    'Patel', 'Jackson', 'Wood', 'Turner', 'Martin', 'Cooper', 'Hill', 'Ward',
    'Morris', 'Moore', 'Clark', 'Lee', 'King', 'Baker', 'Harrison', 'Morgan'
];

export function generateName(): string {
    const first = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
    const last = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
    return `${first} ${last}`;
}

// Location generator
const LOCATIONS = [
    'High Street', 'Station Road', 'Church Lane', 'Park Avenue', 'Victoria Road',
    'Queen Street', 'King Road', 'Mill Lane', 'The Green', 'Springfield Way',
    'Oakfield Drive', 'Elm Close', 'Manor Road', 'Bridge Street', 'Market Square',
    'London Road', 'Chapel Lane', 'Meadow View', 'New Road', 'Castle Street',
    'George Street', 'Albert Road', 'Windsor Terrace', 'Prospect Row', 'Garden Place'
];

const AREAS = [
    'Bromley', 'Croydon', 'Lewisham', 'Greenwich', 'Bexley', 'Newham',
    'Barking', 'Havering', 'Redbridge', 'Waltham Forest', 'Enfield',
    'Haringey', 'Islington', 'Camden', 'Westminster', 'Lambeth',
    'Southwark', 'Tower Hamlets', 'Hackney', 'Barnet'
];

export function generateLocation(): string {
    const street = LOCATIONS[randomInt(0, LOCATIONS.length - 1)];
    const area = AREAS[randomInt(0, AREAS.length - 1)];
    return `${street}, ${area}`;
}

// Description generator
const BUILDS = ['slim', 'medium', 'heavy', 'athletic', 'stocky', 'tall and thin'];
const HAIR_COLOR = ['dark', 'light brown', 'blonde', 'black', 'grey', 'red', 'shaved'];
const CLOTHING_TOP = [
    'black hoodie', 'grey jacket', 'blue puffer coat', 'dark tracksuit top',
    'white t-shirt', 'red jumper', 'green parka', 'denim jacket', 'hi-vis vest',
    'black leather jacket'
];
const CLOTHING_BOTTOM = [
    'dark jeans', 'black tracksuit bottoms', 'grey joggers', 'blue jeans',
    'cargo trousers', 'black trousers', 'shorts', 'chinos'
];
const DISTINGUISHING = [
    'tattoo on neck', 'scar above left eye', 'glasses', 'beard', 'clean-shaven',
    'moustache', 'earring in left ear', 'baseball cap', 'face mask',
    'backpack', 'limping gait', 'spoke with an accent', 'no distinguishing features'
];

export interface PersonDescription {
    name: string;
    age: string;
    build: string;
    hair: string;
    top: string;
    bottom: string;
    distinguishing: string;
}

export function generatePersonDescription(): PersonDescription {
    return {
        name: generateName(),
        age: `approx ${randomInt(18, 55)}`,
        build: BUILDS[randomInt(0, BUILDS.length - 1)],
        hair: HAIR_COLOR[randomInt(0, HAIR_COLOR.length - 1)],
        top: CLOTHING_TOP[randomInt(0, CLOTHING_TOP.length - 1)],
        bottom: CLOTHING_BOTTOM[randomInt(0, CLOTHING_BOTTOM.length - 1)],
        distinguishing: DISTINGUISHING[randomInt(0, DISTINGUISHING.length - 1)],
    };
}

// Generate a time string
export function generateTime(): string {
    const hour = randomInt(0, 23);
    const minute = randomInt(0, 59);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Scene card generator
export interface SceneCard {
    time: string;
    date: string;
    location: string;
    persons: PersonDescription[];
    vehicles: { plate: string; color: string; type: string }[];
    incident: string;
}

const VEHICLE_COLORS = ['black', 'white', 'silver', 'red', 'blue', 'grey', 'dark green'];
const VEHICLE_TYPES = ['Ford Focus', 'VW Golf', 'BMW 3 Series', 'Vauxhall Astra', 'Toyota Yaris',
    'Honda Civic', 'Audi A3', 'Mercedes C-Class', 'Nissan Qashqai', 'Range Rover Sport'];
const INCIDENTS = [
    'Suspected shoplifting from retail premises',
    'Report of anti-social behaviour',
    'Suspicious vehicle seen in residential area',
    'Verbal altercation outside licensed premises',
    'Report of criminal damage to parked vehicle',
    'Suspected drug transaction observed',
    'Missing person last seen in area',
    'Disturbance reported by local residents',
    'Attempted vehicle break-in',
    'Suspect seen leaving premises in haste',
];

export function generateScene(): SceneCard {
    const personCount = randomInt(1, 3);
    const vehicleCount = randomInt(0, 2);
    const day = randomInt(1, 28);
    const month = randomInt(1, 12);

    return {
        time: generateTime(),
        date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/2025`,
        location: generateLocation(),
        persons: Array.from({ length: personCount }, () => generatePersonDescription()),
        vehicles: Array.from({ length: vehicleCount }, () => ({
            plate: generatePlate(),
            color: VEHICLE_COLORS[randomInt(0, VEHICLE_COLORS.length - 1)],
            type: VEHICLE_TYPES[randomInt(0, VEHICLE_TYPES.length - 1)],
        })),
        incident: INCIDENTS[randomInt(0, INCIDENTS.length - 1)],
    };
}
