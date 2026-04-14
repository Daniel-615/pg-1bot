import { blocklyText } from "../../../blockly/messages";

export function getCodeySpeakerCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_CODEY_SPEAKER"),
      colour: "#C65AD9",
      contents: [
        {
          kind: "block",
          type: "codey_play_sound",
          colour: "#C65AD9",
          fields: { SOUND: "hello" },
        },
        {
          kind: "block",
          type: "codey_play_sound_until_done",
          colour: "#C65AD9",
          fields: { SOUND: "hello" },
        },
        {
          kind: "block",
          type: "codey_stop_sounds",
          colour: "#C65AD9",
        },
        {
          kind: "block",
          type: "codey_play_note",
          colour: "#C65AD9",
          fields: { NOTE: "C4", BEAT: 0.25 },
        },
        {
          kind: "block",
          type: "codey_rest_beat",
          colour: "#C65AD9",
          fields: { BEAT: 0.25 },
        },
        {
          kind: "block",
          type: "codey_play_tone",
          colour: "#C65AD9",
          fields: { FREQUENCY: 700, SECONDS: 1 },
        },
        {
          kind: "block",
          type: "codey_change_volume",
          colour: "#C65AD9",
          fields: { DELTA: -10 },
        },
        {
          kind: "block",
          type: "codey_set_volume",
          colour: "#C65AD9",
          fields: { VOLUME: 100 },
        },
        {
          kind: "block",
          type: "codey_current_volume",
          colour: "#C65AD9",
        },
      ],
    },
  ];
}
