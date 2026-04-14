import type { CodeyBlockDefinition } from "./types";

export const infraredBlocks: CodeyBlockDefinition[] = [
  {
    type: "codey_send_message_infrarred",
    message0: "%{BKY_1BOT_CODEY_IR_SEND}",
    args0: [
      {
        type: "input_value",
        name: "VALUE",
        check: "String",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#CF63CF",
    tooltip: "%{BKY_1BOT_CODEY_IR_SEND_TOOLTIP}",
    helpUrl: "",
  },
  {
    type: "codey_receive_message_infrarred",
    message0: "%{BKY_1BOT_CODEY_IR_RECEIVE}",
    output: "String",
    colour: "#CF63CF",
    tooltip: "%{BKY_1BOT_CODEY_IR_RECEIVE_TOOLTIP}",
    helpUrl: "",
  },
  {
    type: "record_infrarred_message_controller",
    message0: "%{BKY_1BOT_CODEY_IR_RECORD_CONTROLLER}",
    output: "String",
    colour: "#CF63CF",
    tooltip: "%{BKY_1BOT_CODEY_IR_RECORD_CONTROLLER_TOOLTIP}",
    helpUrl: "",
  },
  {
    type: "send_signal_infrarred_controller_distance",
    message0: "%{BKY_1BOT_CODEY_IR_SEND_REMOTE}",
    previousStatement: null,
    nextStatement: null,
    colour: "#CF63CF",
    tooltip: "%{BKY_1BOT_CODEY_IR_SEND_REMOTE_TOOLTIP}",
    helpUrl: "",
  },
];
