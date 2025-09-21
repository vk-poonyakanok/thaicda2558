
const normalizeThaiDigits = (s: string): string => {
  return s.replace(/[๐-๙]/g, (d) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(d)));
};

const normalizeSpaces = (s: string): string => {
  return s.replace(/\s+/g, ' ').trim();
};

export const normalizeText = (s: string): string => {
    return normalizeSpaces(normalizeThaiDigits(s));
};
