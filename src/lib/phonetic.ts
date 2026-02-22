// NATO Phonetic Alphabet mapping

export const NATO_ALPHABET: Record<string, string> = {
    'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
    'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel',
    'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
    'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa',
    'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
    'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
    'Y': 'Yankee', 'Z': 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
    '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven',
    '8': 'Eight', '9': 'Nine',
};

export function plateToNATO(plate: string): string[] {
    return plate
        .replace(/\s/g, '')
        .toUpperCase()
        .split('')
        .map(char => NATO_ALPHABET[char] || char);
}

export function natoToShort(natoWord: string): string {
    // Find key by value
    for (const [key, value] of Object.entries(NATO_ALPHABET)) {
        if (value.toLowerCase() === natoWord.toLowerCase()) return key;
    }
    return natoWord;
}

// Check if user input matches expected NATO phonetic
export function checkNATOAnswer(expected: string[], userInput: string): {
    matches: boolean[];
    accuracy: number;
} {
    const userWords = userInput
        .trim()
        .split(/[\s,]+/)
        .map(w => w.toLowerCase())
        .filter(w => w.length > 0);

    const matches = expected.map((word, i) => {
        if (i >= userWords.length) return false;
        const user = userWords[i];
        const exp = word.toLowerCase();
        // Exact match or close enough (first 3 chars)
        return user === exp || (user.length >= 3 && exp.startsWith(user.slice(0, 3)));
    });

    const correctCount = matches.filter(Boolean).length;
    return {
        matches,
        accuracy: expected.length > 0 ? (correctCount / expected.length) * 100 : 0,
    };
}
