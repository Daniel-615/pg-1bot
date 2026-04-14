import type { CodeyGenerator } from "../generator";

const emotionCodeByBlock: Record<string, string> = {
  codey_emotion_look_up: 'codey.display.show_image("00000018183c3c7e7e66660000000000")\n',
  codey_emotion_look_down: 'codey.display.show_image("00000066667e7e3c3c18180000000000")\n',
  codey_emotion_look_left: 'codey.display.show_image("00183c7eff7e3c180000181818181800")\n',
  codey_emotion_look_right: 'codey.display.show_image("1818181818180000183c7eff7e3c1800")\n',
  codey_emotion_look_around:
    'codey.display.show_image("00183c7e7e3c18000018181818180000")\n' +
    'time.sleep(0.2)\n' +
    'codey.display.show_image("0000181818181800183c7e7e3c180000")\n',
  codey_emotion_blink:
    'codey.display.show_image("00000066660000000000666600000000")\n' +
    'time.sleep(0.15)\n' +
    'codey.display.show_image("00000066660000000000666600000000")\n',
  codey_emotion_smile: 'codey.display.show_image("00003c42425a423c0000000000000000")\n',
  codey_emotion_oh_yes: 'codey.display.show("ok", 0, 0, False)\n',
  codey_emotion_naughty: 'codey.display.show(";)", 0, 0, False)\n',
  codey_emotion_proud: 'codey.display.show("^_^", 0, 0, False)\n',
  codey_emotion_yummy: 'codey.display.show("^o^", 0, 0, False)\n',
  codey_emotion_uh_oh: 'codey.display.show(":o", 0, 0, False)\n',
  codey_emotion_wow: 'codey.display.show("wow", 0, 0, False)\n',
  codey_emotion_hurt: 'codey.display.show(">_<", 0, 0, False)\n',
  codey_emotion_sad: 'codey.display.show(":(", 0, 0, False)\n',
  codey_emotion_angry: 'codey.display.show(">:", 0, 0, False)\n',
  codey_emotion_hello: 'codey.display.show("hi", 0, 0, False)\n',
  codey_emotion_run:
    'codey.display.show(">>", 0, 0, False)\n' +
    'time.sleep(0.15)\n' +
    'codey.display.show(">>>", 0, 0, False)\n',
  codey_emotion_scared: 'codey.display.show("D:", 0, 0, False)\n',
  codey_emotion_shiver:
    'codey.display.show("*_*", 0, 0, False)\n' +
    'time.sleep(0.15)\n' +
    'codey.display.show("-_-", 0, 0, False)\n',
  codey_emotion_dizzy: 'codey.display.show("@_@", 0, 0, False)\n',
  codey_emotion_yawn: 'codey.display.show("-o-", 0, 0, False)\n',
  codey_emotion_sleep: 'codey.display.show("zzz", 0, 0, False)\n',
  codey_emotion_wakeup: 'codey.display.show("!!!", 0, 0, False)\n',
  codey_emotion_yes: 'codey.display.show("yes", 0, 0, False)\n',
  codey_emotion_no: 'codey.display.show("no", 0, 0, False)\n',
};

export function registerCodeyEmotionGenerators(generator: CodeyGenerator) {
  for (const [blockType, code] of Object.entries(emotionCodeByBlock)) {
    generator.forBlock[blockType] = () => code;
  }
}
