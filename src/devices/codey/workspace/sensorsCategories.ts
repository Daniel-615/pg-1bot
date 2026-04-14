import { blocklyText } from "../../../blockly/messages";

export function getSensorsCategories(){
    return [
        {
            kind: "category",
            name: blocklyText("1BOT_CAT_CODEY_SENSORS"),
            colour: "#4CBFE6",
            contents:[
                {
                    kind: "block",
                    type: "codey_potentiometer_value",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_volume",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_light_intensity",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_battery_level",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_is_shaked",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_shake_strength",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_is_tilted",
                    colour: "#4CBFE6",
                    fields: {
                        DIRECTION: "LEFT",
                    }
                },
                {
                    kind: "block",
                    type: "codey_is_face",
                    colour: "#4CBFE6",
                    fields: {
                        FACE: "DISPLAY_UP",
                    }
                },
                {
                    kind: "block",
                    type: "codey_roll_angle",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_pitch_angle",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_rotation_angle",
                    colour: "#4CBFE6",
                    fields: {
                        AXIS: "x",
                    }
                },
                {
                    kind: "block",
                    type: "codey_reset_rotation",
                    colour: "#4CBFE6",
                    fields: {
                        AXIS: "all",
                    }
                },
                {
                    kind: "block",
                    type: "codey_timer",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "codey_reset_timer",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "rocky_is_obstacle_ahead",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "rocky_is_color",
                    colour: "#4CBFE6",
                    fields: {
                        COLOR: "red",
                    }
                },
                {
                    kind: "block",
                    type: "rocky_detected_color",
                    colour: "#4CBFE6",
                    fields: {
                        COLOR: "RED",
                    }
                },
                {
                    kind: "block",
                    type: "rocky_light_strength",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "rocky_reflected_light",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "rocky_reflected_infrared",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "rocky_greyness",
                    colour: "#4CBFE6",
                },
                {
                    kind: "block",
                    type: "pulse_button",
                    colour: "#4CBFE6",
                    fields: {
                        BUTTON: "A",
                    }
                },
                {
                    kind: "block",
                    type: "codey_connect_rocky",
                    colour: "#4CBFE6",
                }
            ]
        }
    ]
}
