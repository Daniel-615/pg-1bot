import type { CodeyGenerator } from "../generator";

const ORDER_ATOMIC = 0;
const BUTTON_MAP: Record<string, string> = {
  A: "button_a",
  B: "button_b",
  C: "button_c",
};
const TILT_MAP: Record<string, string> = {
  LEFT: "is_tilted_left",
  RIGHT: "is_tilted_right",
};
const FACE_MAP: Record<string, string> = {
  DISPLAY_UP: "is_display_up",
  DISPLAY_DOWN: "is_display_down",
  EARS_UP: "is_ears_up",
  EARS_DOWN: "is_ears_down",
  UPRIGHT: "is_upright",
};
const ROCKY_COLOR_CHANNEL_MAP: Record<string, string> = {
  RED: "get_red",
  GREEN: "get_green",
  BLUE: "get_blue",
};

function ensureRockyImport(generator: CodeyGenerator) {
  generator.addInclude("import rocky");
}

export function registerCodeySensorGenerators(generator: CodeyGenerator) {
  generator.forBlock["codey_potentiometer_value"] = () => {
    return ["codey.potentiometer.get_value()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_volume"] = () => {
    return ["codey.sound_sensor.get_loudness()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_light_intensity"] = () => {
    return ["codey.light_sensor.get_value()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_battery_level"] = () => {
    return ["codey.battery.get_percentage()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_is_shaked"] = () => {
    return ["codey.motion_sensor.is_shaked()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_shake_strength"] = () => {
    return ["codey.motion_sensor.get_shake_strength()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_is_tilted"] = (block) => {
    const direction = block.getFieldValue("DIRECTION") || "LEFT";
    const method = TILT_MAP[direction] || TILT_MAP.LEFT;
    return [`codey.motion_sensor.${method}()`, ORDER_ATOMIC];
  };

  generator.forBlock["codey_is_face"] = (block) => {
    const face = block.getFieldValue("FACE") || "DISPLAY_UP";
    const method = FACE_MAP[face] || FACE_MAP.DISPLAY_UP;
    return [`codey.motion_sensor.${method}()`, ORDER_ATOMIC];
  };

  generator.forBlock["codey_roll_angle"] = () => {
    return ["codey.motion_sensor.get_roll()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_pitch_angle"] = () => {
    return ["codey.motion_sensor.get_pitch()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_rotation_angle"] = (block) => {
    const axis = (block.getFieldValue("AXIS") || "x").toLowerCase();
    return [`codey.motion_sensor.get_rotation(${JSON.stringify(axis)})`, ORDER_ATOMIC];
  };

  generator.forBlock["codey_reset_rotation"] = (block) => {
    const axis = (block.getFieldValue("AXIS") || "all").toLowerCase();
    return `codey.motion_sensor.reset_rotation(${JSON.stringify(axis)})\n`;
  };

  generator.forBlock["codey_timer"] = () => {
    return ["codey.get_timer()", ORDER_ATOMIC];
  };

  generator.forBlock["codey_reset_timer"] = () => {
    return "codey.reset_timer()\n";
  };

  generator.forBlock["rocky_is_obstacle_ahead"] = () => {
    ensureRockyImport(generator);
    return ["rocky.color_ir_sensor.is_obstacle_ahead()", ORDER_ATOMIC];
  };

  generator.forBlock["rocky_is_color"] = (block) => {
    ensureRockyImport(generator);
    const color = (block.getFieldValue("COLOR") || "red").toLowerCase();
    return [`rocky.color_ir_sensor.is_color(${JSON.stringify(color)})`, ORDER_ATOMIC];
  };

  generator.forBlock["rocky_detected_color"] = (block) => {
    ensureRockyImport(generator);
    const color = block.getFieldValue("COLOR") || "RED";
    const method = ROCKY_COLOR_CHANNEL_MAP[color] || ROCKY_COLOR_CHANNEL_MAP.RED;
    return [`rocky.color_ir_sensor.${method}()`, ORDER_ATOMIC];
  };

  generator.forBlock["rocky_light_strength"] = () => {
    ensureRockyImport(generator);
    return ["rocky.color_ir_sensor.get_light_strength()", ORDER_ATOMIC];
  };

  generator.forBlock["rocky_reflected_light"] = () => {
    ensureRockyImport(generator);
    return ["rocky.color_ir_sensor.get_reflected_light()", ORDER_ATOMIC];
  };

  generator.forBlock["rocky_reflected_infrared"] = () => {
    ensureRockyImport(generator);
    return ["rocky.color_ir_sensor.get_reflected_infrared()", ORDER_ATOMIC];
  };

  generator.forBlock["rocky_greyness"] = () => {
    ensureRockyImport(generator);
    return ["rocky.color_ir_sensor.get_greyness()", ORDER_ATOMIC];
  };

  generator.forBlock["pulse_button"] = (block) => {
    const button = block.getFieldValue("BUTTON") || "A";
    const buttonModule = BUTTON_MAP[button] || BUTTON_MAP.A;
    return [`codey.${buttonModule}.is_pressed()`, ORDER_ATOMIC];
  };

  generator.forBlock["codey_connect_rocky"] = () => {
    return "while not codey.is_rocky_connected():\n    time.sleep(0.1)\n";
  };
}
