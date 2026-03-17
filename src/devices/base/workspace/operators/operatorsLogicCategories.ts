export const operatorsLogicCategories = [
    {
        kind: "block",
        type: "logic_greater",
            inputs: {
            B: {
                shadow: {
                type: "number",
                fields: { NUM: 50 },
                },
            },
        },
    },
    {
        kind: "block",
        type: "logic_less",
        inputs: {
            B: {
                shadow: {
                type: "number",
                fields: { NUM: 50 },
                },
            },
        },
    },
    {
        kind: "block",
        type: "logic_equal",
        inputs: {
            B: {
                shadow: {
                type: "number",
                fields: { NUM: 50 },
                },
            },
        },
    },
    { 
        kind: "block",
        type: "logic_and" 
    },
    { 
        kind: "block",
        type: "logic_or" 
    },
    { 
        kind: "block", 
        type: "logic_not" 
    },
];