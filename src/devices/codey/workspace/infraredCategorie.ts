import { blocklyText } from "../../../blockly/messages";

export function getCodeyInfraredCategories(){
    return [
        {
            kind: "category",
            name: blocklyText("1BOT_CAT_CODEY_INFRARED"),
            colour: "#CF63CF",
            contents:[
                {
                    kind: "block",
                    type: "codey_send_message_infrarred",
                    inputs: {
                        VALUE: { shadow: {type: "string", fields: {STRING: "1BOT"}}},
                    },    
                    colour: "#CF63CF",
                },
                {
                    kind: "block",
                    type: "codey_receive_message_infrarred",
                    colour: "#CF63CF",
                },
                {
                    kind: "block",
                    type: "record_infrarred_message_controller",
                    colour: "#CF63CF",
                },
                {
                    kind: "block",
                    type: "send_signal_infrarred_controller_distance",
                    colour: "#CF63CF",
                }

            ]
        },
    ]
}