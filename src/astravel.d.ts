declare module "astravel" {
  import type { Node } from "meriyah/dist/src/estree";

  export type Traveler = {
    [key: string]: (ast: Node, state?: any) => void;
  };
  export var makeTraveler: (traveler: Traveler) => Traveler;
}
