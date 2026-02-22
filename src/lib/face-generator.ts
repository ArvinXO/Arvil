// Procedural SVG face generator — creates unique, recognizable faces
// Each face has distinct features for memory training

export interface FaceFeatures {
    skinTone: string;
    hairColor: string;
    hairStyle: 'short' | 'long' | 'curly' | 'bald' | 'mohawk' | 'ponytail' | 'buzz' | 'afro';
    eyeColor: string;
    eyeShape: 'round' | 'narrow' | 'wide' | 'droopy';
    noseSize: 'small' | 'medium' | 'large';
    mouthSize: 'small' | 'medium' | 'wide';
    facialHair: 'none' | 'beard' | 'moustache' | 'goatee' | 'stubble';
    glasses: boolean;
    earrings: boolean;
    scar: boolean;
    faceShape: 'round' | 'oval' | 'square' | 'long';
    age: 'young' | 'middle' | 'older';
}

const SKIN_TONES = ['#FDDBB4', '#E8B98C', '#C68A5B', '#A0694B', '#7B4B34', '#4A3020', '#F5D1A8', '#D9A774'];
const HAIR_COLORS = ['#1a1a1a', '#3D2314', '#8B4513', '#C19A6B', '#E8D8B8', '#B22222', '#D2691E', '#808080', '#F5F5DC'];
const EYE_COLORS = ['#2B6CB0', '#4CAF50', '#6B3E0F', '#1a1a1a', '#708090', '#8B7355'];
const HAIR_STYLES: FaceFeatures['hairStyle'][] = ['short', 'long', 'curly', 'bald', 'mohawk', 'ponytail', 'buzz', 'afro'];
const EYE_SHAPES: FaceFeatures['eyeShape'][] = ['round', 'narrow', 'wide', 'droopy'];
const FACE_SHAPES: FaceFeatures['faceShape'][] = ['round', 'oval', 'square', 'long'];
const FACIAL_HAIR: FaceFeatures['facialHair'][] = ['none', 'none', 'none', 'beard', 'moustache', 'goatee', 'stubble'];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFaceFeatures(): FaceFeatures {
    return {
        skinTone: pick(SKIN_TONES),
        hairColor: pick(HAIR_COLORS),
        hairStyle: pick(HAIR_STYLES),
        eyeColor: pick(EYE_COLORS),
        eyeShape: pick(EYE_SHAPES),
        noseSize: pick(['small', 'medium', 'large']),
        mouthSize: pick(['small', 'medium', 'wide']),
        facialHair: pick(FACIAL_HAIR),
        glasses: Math.random() < 0.25,
        earrings: Math.random() < 0.15,
        scar: Math.random() < 0.1,
        faceShape: pick(FACE_SHAPES),
        age: pick(['young', 'middle', 'older']),
    };
}

export function describeFace(f: FaceFeatures): string {
    const parts: string[] = [];
    parts.push(f.age === 'young' ? 'Young' : f.age === 'middle' ? 'Middle-aged' : 'Older');

    if (f.hairStyle === 'bald') parts.push('bald');
    else parts.push(`${f.hairStyle} ${getHairColorName(f.hairColor)} hair`);

    if (f.facialHair !== 'none') parts.push(f.facialHair);
    if (f.glasses) parts.push('glasses');
    if (f.earrings) parts.push('earrings');
    if (f.scar) parts.push('scar on cheek');

    return parts.join(', ');
}

function getHairColorName(hex: string): string {
    const map: Record<string, string> = {
        '#1a1a1a': 'black', '#3D2314': 'dark brown', '#8B4513': 'brown',
        '#C19A6B': 'light brown', '#E8D8B8': 'blonde', '#B22222': 'red',
        '#D2691E': 'auburn', '#808080': 'grey', '#F5F5DC': 'white',
    };
    return map[hex] || 'brown';
}

export function renderFaceSVG(f: FaceFeatures, size: number = 120): string {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;

    // Face shape adjustments
    const faceRx = f.faceShape === 'round' ? r : f.faceShape === 'square' ? r * 0.92 : f.faceShape === 'long' ? r * 0.82 : r * 0.88;
    const faceRy = f.faceShape === 'round' ? r : f.faceShape === 'square' ? r * 0.95 : f.faceShape === 'long' ? r * 1.12 : r * 1.05;

    // Age lines
    const ageLines = f.age === 'older'
        ? `<line x1="${cx - faceRx * 0.3}" y1="${cy + faceRy * 0.25}" x2="${cx - faceRx * 0.5}" y2="${cy + faceRy * 0.35}" stroke="${f.skinTone}88" stroke-width="0.8"/>
       <line x1="${cx + faceRx * 0.3}" y1="${cy + faceRy * 0.25}" x2="${cx + faceRx * 0.5}" y2="${cy + faceRy * 0.35}" stroke="${f.skinTone}88" stroke-width="0.8"/>
       <path d="M${cx - faceRx * 0.2} ${cy - faceRy * 0.15} Q${cx} ${cy - faceRy * 0.2} ${cx + faceRx * 0.2} ${cy - faceRy * 0.15}" fill="none" stroke="${f.skinTone}66" stroke-width="0.5"/>`
        : '';

    // Hair
    let hair = '';
    const hairY = cy - faceRy;
    switch (f.hairStyle) {
        case 'short':
            hair = `<ellipse cx="${cx}" cy="${cy - faceRy * 0.3}" rx="${faceRx * 1.05}" ry="${faceRy * 0.65}" fill="${f.hairColor}"/>`;
            break;
        case 'long':
            hair = `<ellipse cx="${cx}" cy="${cy - faceRy * 0.2}" rx="${faceRx * 1.15}" ry="${faceRy * 0.75}" fill="${f.hairColor}"/>
              <rect x="${cx - faceRx * 1.1}" y="${cy}" width="${faceRx * 0.4}" height="${faceRy * 1.0}" rx="5" fill="${f.hairColor}"/>
              <rect x="${cx + faceRx * 0.7}" y="${cy}" width="${faceRx * 0.4}" height="${faceRy * 1.0}" rx="5" fill="${f.hairColor}"/>`;
            break;
        case 'curly':
            hair = `<circle cx="${cx}" cy="${cy - faceRy * 0.5}" r="${faceRx * 0.6}" fill="${f.hairColor}"/>
              <circle cx="${cx - faceRx * 0.4}" cy="${cy - faceRy * 0.35}" r="${faceRx * 0.35}" fill="${f.hairColor}"/>
              <circle cx="${cx + faceRx * 0.4}" cy="${cy - faceRy * 0.35}" r="${faceRx * 0.35}" fill="${f.hairColor}"/>`;
            break;
        case 'afro':
            hair = `<circle cx="${cx}" cy="${cy - faceRy * 0.2}" r="${faceRx * 1.2}" fill="${f.hairColor}"/>`;
            break;
        case 'mohawk':
            hair = `<rect x="${cx - faceRx * 0.15}" y="${hairY - faceRy * 0.4}" width="${faceRx * 0.3}" height="${faceRy * 0.6}" rx="3" fill="${f.hairColor}"/>`;
            break;
        case 'ponytail':
            hair = `<ellipse cx="${cx}" cy="${cy - faceRy * 0.3}" rx="${faceRx * 1.0}" ry="${faceRy * 0.6}" fill="${f.hairColor}"/>
              <rect x="${cx + faceRx * 0.5}" y="${cy - faceRy * 0.1}" width="${faceRx * 0.6}" height="${faceRy * 0.15}" rx="3" fill="${f.hairColor}" transform="rotate(20 ${cx + faceRx * 0.8} ${cy})"/>`;
            break;
        case 'buzz':
            hair = `<ellipse cx="${cx}" cy="${cy - faceRy * 0.35}" rx="${faceRx * 1.0}" ry="${faceRy * 0.55}" fill="${f.hairColor}" opacity="0.7"/>`;
            break;
        // bald — no hair
    }

    // Eyes
    const eyeY = cy - faceRy * 0.05;
    const eyeSpacing = faceRx * 0.35;
    const eyeW = f.eyeShape === 'wide' ? 7 : f.eyeShape === 'narrow' ? 4 : 5.5;
    const eyeH = f.eyeShape === 'droopy' ? 4 : f.eyeShape === 'narrow' ? 3.5 : 5;

    const eyes = `
    <ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="white"/>
    <circle cx="${cx - eyeSpacing}" cy="${eyeY + 0.5}" r="${eyeH * 0.5}" fill="${f.eyeColor}"/>
    <circle cx="${cx - eyeSpacing}" cy="${eyeY + 0.5}" r="${eyeH * 0.25}" fill="#1a1a1a"/>
    <ellipse cx="${cx + eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="white"/>
    <circle cx="${cx + eyeSpacing}" cy="${eyeY + 0.5}" r="${eyeH * 0.5}" fill="${f.eyeColor}"/>
    <circle cx="${cx + eyeSpacing}" cy="${eyeY + 0.5}" r="${eyeH * 0.25}" fill="#1a1a1a"/>
    ${f.eyeShape === 'droopy'
            ? `<line x1="${cx - eyeSpacing - eyeW}" y1="${eyeY - eyeH + 1}" x2="${cx - eyeSpacing + eyeW}" y2="${eyeY - eyeH - 1}" stroke="${f.skinTone}" stroke-width="2"/>
         <line x1="${cx + eyeSpacing - eyeW}" y1="${eyeY - eyeH - 1}" x2="${cx + eyeSpacing + eyeW}" y2="${eyeY - eyeH + 1}" stroke="${f.skinTone}" stroke-width="2"/>`
            : ''
        }
  `;

    // Eyebrows
    const browY = eyeY - eyeH - 3;
    const eyebrows = `
    <line x1="${cx - eyeSpacing - eyeW * 0.7}" y1="${browY + 1}" x2="${cx - eyeSpacing + eyeW * 0.7}" y2="${browY}" stroke="${f.hairColor}" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="${cx + eyeSpacing - eyeW * 0.7}" y1="${browY}" x2="${cx + eyeSpacing + eyeW * 0.7}" y2="${browY + 1}" stroke="${f.hairColor}" stroke-width="1.8" stroke-linecap="round"/>
  `;

    // Nose
    const noseW = f.noseSize === 'large' ? 8 : f.noseSize === 'small' ? 4 : 6;
    const noseY = cy + faceRy * 0.15;
    const nose = `<path d="M${cx} ${eyeY + 5} L${cx - noseW / 2} ${noseY} Q${cx} ${noseY + 3} ${cx + noseW / 2} ${noseY}" fill="none" stroke="${f.skinTone}99" stroke-width="1.5"/>`;

    // Mouth
    const mouthY = cy + faceRy * 0.35;
    const mouthW = f.mouthSize === 'wide' ? faceRx * 0.6 : f.mouthSize === 'small' ? faceRx * 0.25 : faceRx * 0.4;
    const mouth = `<path d="M${cx - mouthW} ${mouthY} Q${cx} ${mouthY + 5} ${cx + mouthW} ${mouthY}" fill="none" stroke="#c97878" stroke-width="2" stroke-linecap="round"/>`;

    // Ears
    const earY = cy;
    const ears = `
    <ellipse cx="${cx - faceRx - 2}" cy="${earY}" rx="4" ry="7" fill="${f.skinTone}"/>
    <ellipse cx="${cx + faceRx + 2}" cy="${earY}" rx="4" ry="7" fill="${f.skinTone}"/>
    ${f.earrings ? `<circle cx="${cx - faceRx - 2}" cy="${earY + 8}" r="2" fill="#FFD700" stroke="#DAA520" stroke-width="0.5"/>` : ''}
  `;

    // Facial hair
    let facialHairSVG = '';
    if (f.facialHair === 'beard') {
        facialHairSVG = `<path d="M${cx - faceRx * 0.6} ${mouthY - 5} Q${cx - faceRx * 0.7} ${cy + faceRy * 0.7} ${cx} ${cy + faceRy * 0.8} Q${cx + faceRx * 0.7} ${cy + faceRy * 0.7} ${cx + faceRx * 0.6} ${mouthY - 5}" fill="${f.hairColor}" opacity="0.6"/>`;
    } else if (f.facialHair === 'moustache') {
        facialHairSVG = `<path d="M${cx - mouthW * 1.2} ${mouthY - 3} Q${cx} ${mouthY - 6} ${cx + mouthW * 1.2} ${mouthY - 3} Q${cx} ${mouthY} ${cx - mouthW * 1.2} ${mouthY - 3}" fill="${f.hairColor}" opacity="0.7"/>`;
    } else if (f.facialHair === 'goatee') {
        facialHairSVG = `<ellipse cx="${cx}" cy="${mouthY + 8}" rx="${mouthW * 0.6}" ry="7" fill="${f.hairColor}" opacity="0.5"/>`;
    } else if (f.facialHair === 'stubble') {
        const dots = [];
        for (let i = 0; i < 20; i++) {
            const dx = (Math.random() - 0.5) * faceRx * 1.2;
            const dy = Math.random() * faceRy * 0.4;
            dots.push(`<circle cx="${cx + dx}" cy="${mouthY - 5 + dy}" r="0.8" fill="${f.hairColor}" opacity="0.3"/>`);
        }
        facialHairSVG = dots.join('');
    }

    // Glasses
    const glassesSVG = f.glasses ? `
    <rect x="${cx - eyeSpacing - eyeW - 3}" y="${eyeY - eyeH - 2}" width="${eyeW * 2 + 6}" height="${eyeH * 2 + 4}" rx="3" fill="none" stroke="#444" stroke-width="1.5"/>
    <rect x="${cx + eyeSpacing - eyeW - 3}" y="${eyeY - eyeH - 2}" width="${eyeW * 2 + 6}" height="${eyeH * 2 + 4}" rx="3" fill="none" stroke="#444" stroke-width="1.5"/>
    <line x1="${cx - eyeSpacing + eyeW + 3}" y1="${eyeY}" x2="${cx + eyeSpacing - eyeW - 3}" y2="${eyeY}" stroke="#444" stroke-width="1.5"/>
  ` : '';

    // Scar
    const scarSVG = f.scar ? `<path d="M${cx + faceRx * 0.3} ${cy - faceRy * 0.1} l5 8 l-3 6" fill="none" stroke="#d4a0a0" stroke-width="1" opacity="0.6"/>` : '';

    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#2a2a2a" rx="8"/>
    ${hair}
    ${ears}
    <ellipse cx="${cx}" cy="${cy + faceRy * 0.05}" rx="${faceRx}" ry="${faceRy}" fill="${f.skinTone}"/>
    ${ageLines}
    ${eyes}
    ${eyebrows}
    ${nose}
    ${mouth}
    ${facialHairSVG}
    ${glassesSVG}
    ${scarSVG}
  </svg>`;
}
