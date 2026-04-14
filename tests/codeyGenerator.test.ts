import { describe, expect, it } from "vitest";
import { CodeyGenerator } from "../src/devices/codey/generator";

type MockBlock = {
  getFieldValue: (name: string) => string;
};

function createBlockMock(fields: Record<string, string> = {}): MockBlock {
  return {
    getFieldValue: (name: string) => fields[name] ?? "",
  };
}

describe("CodeyGenerator", () => {
  it("genera lecturas de sensores basicos de Codey", () => {
    const generator = new CodeyGenerator();

    expect(generator.forBlock["codey_potentiometer_value"](createBlockMock() as never, generator as never)).toEqual([
      "codey.potentiometer.get_value()",
      0,
    ]);
    expect(generator.forBlock["codey_volume"](createBlockMock() as never, generator as never)).toEqual([
      "codey.sound_sensor.get_loudness()",
      0,
    ]);
    expect(generator.forBlock["codey_light_intensity"](createBlockMock() as never, generator as never)).toEqual([
      "codey.light_sensor.get_value()",
      0,
    ]);
    expect(generator.forBlock["codey_battery_level"](createBlockMock() as never, generator as never)).toEqual([
      "codey.battery.get_percentage()",
      0,
    ]);
  });

  it("genera sensores de movimiento y orientacion de Codey", () => {
    const generator = new CodeyGenerator();

    expect(generator.forBlock["codey_is_shaked"](createBlockMock() as never, generator as never)).toEqual([
      "codey.motion_sensor.is_shaked()",
      0,
    ]);
    expect(generator.forBlock["codey_shake_strength"](createBlockMock() as never, generator as never)).toEqual([
      "codey.motion_sensor.get_shake_strength()",
      0,
    ]);
    expect(
      generator.forBlock["codey_is_tilted"](
        createBlockMock({ DIRECTION: "RIGHT" }) as never,
        generator as never
      )
    ).toEqual(["codey.motion_sensor.is_tilted_right()", 0]);
    expect(
      generator.forBlock["codey_is_face"](
        createBlockMock({ FACE: "EARS_DOWN" }) as never,
        generator as never
      )
    ).toEqual(["codey.motion_sensor.is_ears_down()", 0]);
    expect(generator.forBlock["codey_roll_angle"](createBlockMock() as never, generator as never)).toEqual([
      "codey.motion_sensor.get_roll()",
      0,
    ]);
    expect(generator.forBlock["codey_pitch_angle"](createBlockMock() as never, generator as never)).toEqual([
      "codey.motion_sensor.get_pitch()",
      0,
    ]);
    expect(
      generator.forBlock["codey_rotation_angle"](
        createBlockMock({ AXIS: "z" }) as never,
        generator as never
      )
    ).toEqual(['codey.motion_sensor.get_rotation("z")', 0]);
  });

  it("genera temporizador, reinicio de rotacion y sensores de Rocky", () => {
    const generator = new CodeyGenerator();

    expect(
      generator.forBlock["codey_reset_rotation"](
        createBlockMock({ AXIS: "all" }) as never,
        generator as never
      )
    ).toBe('codey.motion_sensor.reset_rotation("all")\n');
    expect(generator.forBlock["codey_timer"](createBlockMock() as never, generator as never)).toEqual([
      "codey.get_timer()",
      0,
    ]);
    expect(generator.forBlock["codey_reset_timer"](createBlockMock() as never, generator as never)).toBe(
      "codey.reset_timer()\n"
    );
    expect(generator.forBlock["rocky_is_obstacle_ahead"](createBlockMock() as never, generator as never)).toEqual([
      "rocky.color_ir_sensor.is_obstacle_ahead()",
      0,
    ]);
    expect(
      generator.forBlock["rocky_is_color"](
        createBlockMock({ COLOR: "green" }) as never,
        generator as never
      )
    ).toEqual(['rocky.color_ir_sensor.is_color("green")', 0]);
    expect(
      generator.forBlock["rocky_detected_color"](
        createBlockMock({ COLOR: "BLUE" }) as never,
        generator as never
      )
    ).toEqual(["rocky.color_ir_sensor.get_blue()", 0]);
    expect(generator.forBlock["rocky_light_strength"](createBlockMock() as never, generator as never)).toEqual([
      "rocky.color_ir_sensor.get_light_strength()",
      0,
    ]);
    expect(generator.forBlock["rocky_reflected_light"](createBlockMock() as never, generator as never)).toEqual([
      "rocky.color_ir_sensor.get_reflected_light()",
      0,
    ]);
    expect(
      generator.forBlock["rocky_reflected_infrared"](createBlockMock() as never, generator as never)
    ).toEqual(["rocky.color_ir_sensor.get_reflected_infrared()", 0]);
    expect(generator.forBlock["rocky_greyness"](createBlockMock() as never, generator as never)).toEqual([
      "rocky.color_ir_sensor.get_greyness()",
      0,
    ]);
    expect(Array.from(generator.includes)).toContain("import rocky");
  });

  it("genera bloques de accion de Rocky", () => {
    const generator = new CodeyGenerator();

    expect(
      generator.forBlock["rocky_forward_for"](
        createBlockMock({ POWER: "60", SECONDS: "2" }) as never,
        generator as never
      )
    ).toBe("rocky.forward(60, 2)\n");
    expect(
      generator.forBlock["rocky_forward_straight_for"](
        createBlockMock({ POWER: "40", SECONDS: "3" }) as never,
        generator as never
      )
    ).toBe("rocky.forward(40, 3, True)\n");
    expect(
      generator.forBlock["rocky_turn_right_degree"](
        createBlockMock({ ANGLE: "90" }) as never,
        generator as never
      )
    ).toBe("rocky.turn_right_by_degree(90)\n");
    expect(
      generator.forBlock["rocky_move_power"](
        createBlockMock({ DIRECTION: "turn_left", POWER: "30" }) as never,
        generator as never
      )
    ).toBe("rocky.turn_left(30)\n");
    expect(
      generator.forBlock["rocky_drive_power"](
        createBlockMock({ LEFT_POWER: "20", RIGHT_POWER: "80" }) as never,
        generator as never
      )
    ).toBe("rocky.drive(20, 80)\n");
    expect(generator.forBlock["rocky_stop"](createBlockMock() as never, generator as never)).toBe("rocky.stop()\n");
  });

  it("genera bloques de altavoz de Codey", () => {
    const generator = new CodeyGenerator();

    expect(
      generator.forBlock["codey_play_sound"](
        createBlockMock({ SOUND: "hello" }) as never,
        generator as never
      )
    ).toBe('codey.speaker.play_melody("hello")\n');
    expect(
      generator.forBlock["codey_play_sound_until_done"](
        createBlockMock({ SOUND: "wow" }) as never,
        generator as never
      )
    ).toBe('codey.speaker.play_melody_until_done("wow")\n');
    expect(generator.forBlock["codey_stop_sounds"](createBlockMock() as never, generator as never)).toBe(
      "codey.speaker.stop_sounds()\n"
    );
    expect(
      generator.forBlock["codey_play_note"](
        createBlockMock({ NOTE: "C4", BEAT: "0.25" }) as never,
        generator as never
      )
    ).toBe('codey.speaker.play_note("C4", 0.25)\n');
    expect(
      generator.forBlock["codey_rest_beat"](
        createBlockMock({ BEAT: "0.5" }) as never,
        generator as never
      )
    ).toBe("codey.speaker.rest(0.5)\n");
    expect(
      generator.forBlock["codey_play_tone"](
        createBlockMock({ FREQUENCY: "700", SECONDS: "1.2" }) as never,
        generator as never
      )
    ).toBe("codey.speaker.play_tone(700, 1200)\n");
    expect(
      generator.forBlock["codey_change_volume"](
        createBlockMock({ DELTA: "-10" }) as never,
        generator as never
      )
    ).toBe("codey.speaker.volume = min(100, max(0, codey.speaker.volume + (-10)))\n");
    expect(
      generator.forBlock["codey_set_volume"](
        createBlockMock({ VOLUME: "80" }) as never,
        generator as never
      )
    ).toBe("codey.speaker.volume = 80\n");
    expect(generator.forBlock["codey_current_volume"](createBlockMock() as never, generator as never)).toEqual([
      "codey.speaker.volume",
      0,
    ]);
  });

  it("genera bloques de iluminacion de Codey y Rocky", () => {
    const generator = new CodeyGenerator();

    expect(
      generator.forBlock["codey_led_rgb_for"](
        createBlockMock({ COLOR: "#ff0000", SECONDS: "1.5" }) as never,
        generator as never
      )
    ).toBe("codey.led.show(255, 0, 0)\ntime.sleep(1.5)\ncodey.led.off()\n");
    expect(
      generator.forBlock["codey_led_rgb"](
        createBlockMock({ COLOR: "#00ff00" }) as never,
        generator as never
      )
    ).toBe("codey.led.show(0, 255, 0)\n");
    expect(
      generator.forBlock["codey_led_component"](
        createBlockMock({ COMPONENT: "blue", VALUE: "128" }) as never,
        generator as never
      )
    ).toBe("codey.led.set_blue(128)\n");
    expect(generator.forBlock["codey_led_off"](createBlockMock() as never, generator as never)).toBe(
      "codey.led.off()\n"
    );
    expect(
      generator.forBlock["rocky_light_color"](
        createBlockMock({ COLOR: "red" }) as never,
        generator as never
      )
    ).toBe('rocky.color_ir_sensor.set_led_color("red")\n');
    expect(generator.forBlock["rocky_light_off"](createBlockMock() as never, generator as never)).toBe(
      'rocky.color_ir_sensor.set_led_color("black")\n'
    );
  });

  it("genera bloques de apariencia de Codey", () => {
    const generator = new CodeyGenerator();

    expect(
      generator.forBlock["codey_show_image"](
        createBlockMock({ IMAGE: "0066660000000000" }) as never,
        generator as never
      )
    ).toBe('codey.display.show_image("0066660000000000")\n');
    expect(
      generator.forBlock["codey_show_image_at"](
        createBlockMock({ IMAGE: "0066660000000000", X: "0", Y: "0" }) as never,
        generator as never
      )
    ).toBe('codey.display.show_image("0066660000000000", 0, 0)\n');
    expect(generator.forBlock["codey_clear_display"](createBlockMock() as never, generator as never)).toBe(
      "codey.display.clear()\n"
    );
    expect(
      generator.forBlock["codey_show_text"](
        createBlockMock({ TEXT: "hello" }) as never,
        generator as never
      )
    ).toBe('codey.display.show("hello", 0, 0, False)\n');
    expect(
      generator.forBlock["codey_show_text_until_done"](
        createBlockMock({ TEXT: "hello" }) as never,
        generator as never
      )
    ).toBe('codey.display.show("hello", 0, 0, True)\n');
    expect(
      generator.forBlock["codey_show_text_at"](
        createBlockMock({ TEXT: "hello", X: "1", Y: "2" }) as never,
        generator as never
      )
    ).toBe('codey.display.show("hello", 1, 2, False)\n');
    expect(
      generator.forBlock["codey_set_pixel_on"](
        createBlockMock({ X: "0", Y: "0" }) as never,
        generator as never
      )
    ).toBe("codey.display.set_pixel(0, 0, True)\n");
    expect(
      generator.forBlock["codey_set_pixel_off"](
        createBlockMock({ X: "0", Y: "0" }) as never,
        generator as never
      )
    ).toBe("codey.display.set_pixel(0, 0, False)\n");
    expect(
      generator.forBlock["codey_toggle_pixel"](
        createBlockMock({ X: "0", Y: "0" }) as never,
        generator as never
      )
    ).toBe("codey.display.toggle_pixel(0, 0)\n");
    expect(
      generator.forBlock["codey_get_pixel"](
        createBlockMock({ X: "0", Y: "0" }) as never,
        generator as never
      )
    ).toEqual(["codey.display.get_pixel(0, 0)", 0]);
  });

  it("genera bloques de emocion de Codey", () => {
    const generator = new CodeyGenerator();

    expect(generator.forBlock["codey_emotion_look_up"](createBlockMock() as never, generator as never)).toBe(
      'codey.display.show_image("00000018183c3c7e7e66660000000000")\n'
    );
    expect(generator.forBlock["codey_emotion_hello"](createBlockMock() as never, generator as never)).toBe(
      'codey.display.show("hi", 0, 0, False)\n'
    );
    expect(generator.forBlock["codey_emotion_sleep"](createBlockMock() as never, generator as never)).toBe(
      'codey.display.show("zzz", 0, 0, False)\n'
    );
  });
});
