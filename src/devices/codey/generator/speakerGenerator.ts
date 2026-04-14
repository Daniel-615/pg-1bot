import type { CodeyGenerator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerCodeySpeakerGenerators(generator: CodeyGenerator) {
  generator.forBlock["codey_play_sound"] = (block) => {
    const sound = block.getFieldValue("SOUND") || "hello";
    return `codey.speaker.play_melody(${JSON.stringify(sound)})\n`;
  };

  generator.forBlock["codey_play_sound_until_done"] = (block) => {
    const sound = block.getFieldValue("SOUND") || "hello";
    return `codey.speaker.play_melody_until_done(${JSON.stringify(sound)})\n`;
  };

  generator.forBlock["codey_stop_sounds"] = () => {
    return "codey.speaker.stop_sounds()\n";
  };

  generator.forBlock["codey_play_note"] = (block) => {
    const note = block.getFieldValue("NOTE") || "C4";
    const beat = Number(block.getFieldValue("BEAT") || 0.25);
    return `codey.speaker.play_note(${JSON.stringify(note)}, ${beat})\n`;
  };

  generator.forBlock["codey_rest_beat"] = (block) => {
    const beat = Number(block.getFieldValue("BEAT") || 0.25);
    return `codey.speaker.rest(${beat})\n`;
  };

  generator.forBlock["codey_play_tone"] = (block) => {
    const frequency = Number(block.getFieldValue("FREQUENCY") || 700);
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    return `codey.speaker.play_tone(${frequency}, ${Math.round(seconds * 1000)})\n`;
  };

  generator.forBlock["codey_change_volume"] = (block) => {
    const delta = Number(block.getFieldValue("DELTA") || 0);
    return `codey.speaker.volume = min(100, max(0, codey.speaker.volume + (${delta})))\n`;
  };

  generator.forBlock["codey_set_volume"] = (block) => {
    const volume = Number(block.getFieldValue("VOLUME") || 100);
    return `codey.speaker.volume = ${volume}\n`;
  };

  generator.forBlock["codey_current_volume"] = () => {
    return ["codey.speaker.volume", ORDER_ATOMIC];
  };
}
