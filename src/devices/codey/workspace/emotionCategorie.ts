import { blocklyText } from "../../../blockly/messages";

const emotionBlockTypes = [
  "codey_emotion_look_up",
  "codey_emotion_look_down",
  "codey_emotion_look_left",
  "codey_emotion_look_right",
  "codey_emotion_look_around",
  "codey_emotion_blink",
  "codey_emotion_smile",
  "codey_emotion_oh_yes",
  "codey_emotion_naughty",
  "codey_emotion_proud",
  "codey_emotion_yummy",
  "codey_emotion_uh_oh",
  "codey_emotion_wow",
  "codey_emotion_hurt",
  "codey_emotion_sad",
  "codey_emotion_angry",
  "codey_emotion_hello",
  "codey_emotion_run",
  "codey_emotion_scared",
  "codey_emotion_shiver",
  "codey_emotion_dizzy",
  "codey_emotion_yawn",
  "codey_emotion_sleep",
  "codey_emotion_wakeup",
  "codey_emotion_yes",
  "codey_emotion_no",
];

export function getCodeyEmotionCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_CODEY_EMOTION"),
      colour: "#46B8F2",
      contents: emotionBlockTypes.map((type) => ({
        kind: "block",
        type,
        colour: "#46B8F2",
      })),
    },
  ];
}
