import type { CodeyGenerator } from "../generator";

function ensureRockyImport(generator: CodeyGenerator) {
  generator.addInclude("import rocky");
}

export function registerCodeyActionGenerators(generator: CodeyGenerator) {
  generator.forBlock["rocky_forward_for"] = (block) => {
    ensureRockyImport(generator);
    const power = Number(block.getFieldValue("POWER") || 50);
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    return `rocky.forward(${power}, ${seconds})\n`;
  };

  generator.forBlock["rocky_backward_for"] = (block) => {
    ensureRockyImport(generator);
    const power = Number(block.getFieldValue("POWER") || 50);
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    return `rocky.backward(${power}, ${seconds})\n`;
  };

  generator.forBlock["rocky_turn_left_for"] = (block) => {
    ensureRockyImport(generator);
    const power = Number(block.getFieldValue("POWER") || 50);
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    return `rocky.turn_left(${power}, ${seconds})\n`;
  };

  generator.forBlock["rocky_turn_right_for"] = (block) => {
    ensureRockyImport(generator);
    const power = Number(block.getFieldValue("POWER") || 50);
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    return `rocky.turn_right(${power}, ${seconds})\n`;
  };

  generator.forBlock["rocky_forward_straight_for"] = (block) => {
    ensureRockyImport(generator);
    const power = Number(block.getFieldValue("POWER") || 50);
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    return `rocky.forward(${power}, ${seconds}, True)\n`;
  };

  generator.forBlock["rocky_backward_straight_for"] = (block) => {
    ensureRockyImport(generator);
    const power = Number(block.getFieldValue("POWER") || 50);
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    return `rocky.backward(${power}, ${seconds}, True)\n`;
  };

  generator.forBlock["rocky_turn_left_degree"] = (block) => {
    ensureRockyImport(generator);
    const angle = Number(block.getFieldValue("ANGLE") || 15);
    return `rocky.turn_left_by_degree(${angle})\n`;
  };

  generator.forBlock["rocky_turn_right_degree"] = (block) => {
    ensureRockyImport(generator);
    const angle = Number(block.getFieldValue("ANGLE") || 15);
    return `rocky.turn_right_by_degree(${angle})\n`;
  };

  generator.forBlock["rocky_move_power"] = (block) => {
    ensureRockyImport(generator);
    const direction = block.getFieldValue("DIRECTION") || "forward";
    const power = Number(block.getFieldValue("POWER") || 50);

    switch (direction) {
      case "backward":
        return `rocky.backward(${power})\n`;
      case "turn_left":
        return `rocky.turn_left(${power})\n`;
      case "turn_right":
        return `rocky.turn_right(${power})\n`;
      default:
        return `rocky.forward(${power})\n`;
    }
  };

  generator.forBlock["rocky_drive_power"] = (block) => {
    ensureRockyImport(generator);
    const leftPower = Number(block.getFieldValue("LEFT_POWER") || 50);
    const rightPower = Number(block.getFieldValue("RIGHT_POWER") || 50);
    return `rocky.drive(${leftPower}, ${rightPower})\n`;
  };

  generator.forBlock["rocky_stop"] = () => {
    ensureRockyImport(generator);
    return "rocky.stop()\n";
  };
}
