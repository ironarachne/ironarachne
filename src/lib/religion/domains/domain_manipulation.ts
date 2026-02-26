import type { DomainSet } from "./domain_types";
import * as Words from "@ironarachne/words";

export function listDomains(domainSet: DomainSet): string {
    const domains = [domainSet.primary?.name, domainSet.secondary?.name, domainSet.tertiary?.name].filter((d): d is string => typeof d === "string");

    if (domains.length === 0) {
        return "no domains";
    }

    return Words.arrayToPhrase(domains);
}