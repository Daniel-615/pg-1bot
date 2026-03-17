export const operatorsMathematicCategories = [
    { 
        kind: "block",
        type: "math_add" 
    },
    { 
        kind: "block", 
        type: "math_subtract" 
    },
    { 
        kind: "block",
        type: "math_multiply" 
    },
    { 
    
        kind: "block", 
        type: "math_divide" 
    },
    {
        kind: "block",
        type: "math_random",
        inputs: {
            MIN: {
                shadow: {
                type: "number",
                fields: { NUM: 1 },
                },
            },
            MAX: {
                shadow: {
                type: "number",
                fields: { NUM: 10 },
                },
            },
        },
    },
];