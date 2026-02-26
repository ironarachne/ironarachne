import type { TaggedItem } from "./tags/tag_types";

export type Mutator<T> = TaggedItem & {
    name: string;
    mutate: (seed: string, target: T) => T;
}