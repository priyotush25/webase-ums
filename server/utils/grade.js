// Bangladesh-style 4.00 grading scale
const SCALE = [
    { min: 80, letter: "A+", point: 4.0 },
    { min: 75, letter: "A", point: 3.75 },
    { min: 70, letter: "A-", point: 3.5 },
    { min: 65, letter: "B+", point: 3.25 },
    { min: 60, letter: "B", point: 3.0 },
    { min: 55, letter: "B-", point: 2.75 },
    { min: 50, letter: "C+", point: 2.5 },
    { min: 45, letter: "C", point: 2.25 },
    { min: 40, letter: "D", point: 2.0 },
    { min: 0, letter: "F", point: 0 },
];

export const calculateGrade = (total) => {
    const row = SCALE.find((item) => total >= item.min) || SCALE.at(-1);
    return { letterGrade: row.letter, gradePoint: row.point };
};
