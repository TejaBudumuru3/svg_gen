export interface Concept {
    id: number;
    title: string;
    text: string;
    details?: string
}

export const Concepts: Concept [] = [
    {
        id: 1,
        title: "Pythagoras' theorem",
        text: "In a right-angled triangle, the longest side is called the hypotenuse. The square of the hypotenuse is equal to the sum of the squares of the other two sides: a² + b² = c².",
        details: "Draw a right-angled triangle with the right angle marked by a small square. Label the two shorter sides a and b, and the longest side, opposite the right angle, c (the hypotenuse). Draw a square on each side and label their areas a², b² and c². Use a 3-4-5 triangle so the squares show 9, 16 and 25, and choose a scale so everything fits inside the safe area. Animate by highlighting the squares on a and b together, then the square on c, to show 9 + 16 = 25. Show a² + b² = c² as a label.",
    },
    {
        id: 2,
        title: "Parts of a circle",
        text: "A circle has a centre. The radius is the distance from the centre to the edge. The diameter goes across the circle through the centre and is twice the radius. The circumference is the distance around the circle.",
        details: "Draw a circle with a clearly marked centre point. Draw the radius as a line from the centre to the edge, and the diameter as a straight line through the centre from edge to edge. Label the circumference as the distance around the edge. Show the relationship d = 2r as a label. Animate the radius rotating around the centre while a highlight traces the circumference, then loop.",
    },
    {
        id: 3,
        title: "Series circuit",
        text: "In a series circuit there is only one loop. The current is the same everywhere in the loop. The voltage of the cell is shared between the components.",
        details: "Draw one rectangular loop with a cell and two lamps and no branches. Label the cell, lamp 1 and lamp 2. Label the cell 6 V and each lamp 3 V to show the voltage is shared (6 V = 3 V + 3 V). Mark the direction of conventional current going from the positive terminal of the cell around the loop, with an arrow. Animate small dots travelling around the loop at the same speed everywhere to show the current is the same at every point. Label the current with the same value, for example 0.5 A, at two different points in the loop.",
    },
    {
        id: 4,
        title: "Photosynthesis",
        text: "Plants take in carbon dioxide and water. They use light energy, absorbed by chlorophyll, to make glucose and oxygen.",
        details: "Draw a plant with a leaf. Show carbon dioxide (CO₂) arriving at the leaf, water (H₂O) rising from the roots, and sunlight shining on the leaf labelled light energy. Label chlorophyll inside the leaf. Show glucose being made and oxygen (O₂) leaving the leaf. Animate arrows or small molecules moving in the direction they travel. Show the word equation: carbon dioxide + water → glucose + oxygen, with light energy and chlorophyll written above the arrow.",
    },
    {
        id: 5,
        title: "States of matter",
        text: "In a solid the particles are close together and vibrate in place. In a liquid they are close but move past each other. In a gas they are far apart and move fast.",
        details: "Draw three boxes side by side labelled Solid, Liquid and Gas, each about 220 wide. Solid: about 12 particles touching in a regular grid, each vibrating slightly in place. Liquid: about 12 particles close together in an irregular arrangement, slowly drifting past each other. Gas: about 6 particles far apart, moving quickly around the box. Every particle must stay inside its box at all times, including during movement. Use a small fast jitter for the solid, a slow drift for the liquid and large fast movement for the gas.",
    },
]