import type EcosystemConfig from "./ecosystem_config";
import type Ecosystem from "./ecosystem";

export function generate(config: EcosystemConfig): Ecosystem {
    // TODO: use a generational algorithm to select fauna and flora
    return {
        name: "",
        description: "",
        fauna: [],
        flora: []
    }
}

export function getDefaultConfig(): EcosystemConfig {
    return {
        possibleFauna: [],
        possibleFlora: []
    }
}