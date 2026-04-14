import type { CodeyGenerator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerCodeyInfraredGenerators(generator: CodeyGenerator) {
  generator.forBlock["codey_send_message_infrarred"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || '""';
    return `codey.ir.send(${value})\n`;
  };

  generator.forBlock["codey_receive_message_infrarred"] = () => {
    return ["codey.ir.receive()", ORDER_ATOMIC];
  };

  generator.forBlock["record_infrarred_message_controller"] = () => {
    return ["str(codey.ir.receive_remote_code())", ORDER_ATOMIC];
  };

  generator.forBlock["send_signal_infrarred_controller_distance"] = () => {
    return "codey.ir.send_learned_result()\n";
  };
}
