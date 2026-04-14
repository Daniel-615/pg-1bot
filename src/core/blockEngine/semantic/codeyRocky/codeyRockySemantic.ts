import * as Blockly from "blockly";
import type { VarType } from "../base/symbolTable";
import type { CodeyRockyHost, CodeyRockyState } from "./shared";
import { MovimientoCodeyRockySemantic } from "./movimiento/movimientoSemantic";
import { EmocionCodeyRockySemantic } from "./emocion/emocionSemantic";
import { AparienciaCodeyRockySemantic } from "./apariencia/aparienciaSemantic";
import { IluminacionCodeyRockySemantic } from "./iluminacion/iluminacionSemantic";
import { AltavozCodeyRockySemantic } from "./altavoz/altavozSemantic";
import { SensoresCodeyRockySemantic } from "./sensores/sensoresSemantic";
import { InfrarrojoCodeyRockySemantic } from "./infrarrojo/infrarrojoSemantic";

const CODEY_NUMBER_TYPES = new Set([
  "codey_potentiometer_value",
  "codey_volume",
  "codey_light_intensity",
  "codey_battery_level",
  "codey_shake_strength",
  "codey_roll_angle",
  "codey_pitch_angle",
  "codey_rotation_angle",
  "codey_timer",
  "codey_current_volume",
  "rocky_detected_color",
  "rocky_light_strength",
  "rocky_reflected_light",
  "rocky_reflected_infrared",
  "rocky_greyness",
]);

const CODEY_BOOLEAN_TYPES = new Set([
  "codey_is_shaked",
  "codey_is_tilted",
  "codey_is_face",
  "rocky_is_obstacle_ahead",
  "rocky_is_color",
  "codey_get_pixel",
  "pulse_button",
]);

const CODEY_STRING_TYPES = new Set([
  "codey_receive_message_infrarred",
  "record_infrarred_message_controller",
]);

export class CodeyRockySemantic {
  private readonly state: CodeyRockyState = {
    hasCodeyRockyConnect: false,
    hasCodeyIrLearned: false,
    lastCodeyDisplaySignature: null,
    lastCodeyLightingSignature: null,
    lastCodeySpeakerSignature: null,
    rockyStopped: false,
    codeyTimerResetSeen: false,
    codeyRotationResets: new Set<string>(),
  };
  private readonly movimiento: MovimientoCodeyRockySemantic;
  private readonly emocion: EmocionCodeyRockySemantic;
  private readonly apariencia: AparienciaCodeyRockySemantic;
  private readonly iluminacion: IluminacionCodeyRockySemantic;
  private readonly altavoz: AltavozCodeyRockySemantic;
  private readonly sensores: SensoresCodeyRockySemantic;
  private readonly infrarrojo: InfrarrojoCodeyRockySemantic;
  private readonly host: CodeyRockyHost;

  constructor(host: CodeyRockyHost) {
    this.host = host;
    this.movimiento = new MovimientoCodeyRockySemantic(host, this.state);
    this.emocion = new EmocionCodeyRockySemantic(host, this.state);
    this.apariencia = new AparienciaCodeyRockySemantic(host, this.state);
    this.iluminacion = new IluminacionCodeyRockySemantic(host, this.state);
    this.altavoz = new AltavozCodeyRockySemantic(host, this.state);
    this.sensores = new SensoresCodeyRockySemantic(host, this.state);
    this.infrarrojo = new InfrarrojoCodeyRockySemantic(host, this.state);
  }

  reset() {
    this.state.hasCodeyRockyConnect = false;
    this.state.hasCodeyIrLearned = false;
    this.state.lastCodeyDisplaySignature = null;
    this.state.lastCodeyLightingSignature = null;
    this.state.lastCodeySpeakerSignature = null;
    this.state.rockyStopped = false;
    this.state.codeyTimerResetSeen = false;
    this.state.codeyRotationResets = new Set();
  }

  handleBlock(block: Blockly.Block): boolean {
    if (this.movimiento.handleBlock(block)) return true;
    if (this.emocion.handleBlock(block)) return true;
    if (this.apariencia.handleBlock(block)) return true;
    if (this.iluminacion.handleBlock(block)) return true;
    if (this.altavoz.handleBlock(block)) return true;
    if (this.sensores.handleBlock(block)) return true;
    if (this.infrarrojo.handleBlock(block)) return true;

    switch (block.type) {
      case "codey_connect_rocky":
        if (this.state.hasCodeyRockyConnect) {
          this.host.addIssue(
            block,
            "Ya agregaste una espera de conexion con Rocky en este flujo",
            "suggestion"
          );
        }
        this.state.hasCodeyRockyConnect = true;
        return true;

      default:
        return false;
    }
  }

  inferType(block: Blockly.Block): VarType | undefined {
    if (CODEY_NUMBER_TYPES.has(block.type)) return "number";
    if (CODEY_BOOLEAN_TYPES.has(block.type)) return "boolean";
    if (CODEY_STRING_TYPES.has(block.type)) return "string";
    return undefined;
  }

  inferValue(block: Blockly.Block): { handled: boolean; value: unknown } {
    if (CODEY_BOOLEAN_TYPES.has(block.type)) {
      return { handled: true, value: false };
    }

    if (CODEY_NUMBER_TYPES.has(block.type)) {
      return { handled: true, value: 0 };
    }

    if (CODEY_STRING_TYPES.has(block.type)) {
      return { handled: true, value: "" };
    }

    return { handled: false, value: null };
  }
}
