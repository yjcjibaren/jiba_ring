import { Howl } from "howler";

type SoundKey =
  | "attack"
  | "hit"
  | "dodge"
  | "arrow"
  | "boss_roar"
  | "phase_two"
  | "victory"
  | "death";

const silentDataUri =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

const sounds: Record<SoundKey, Howl> = {
  attack: new Howl({ src: [silentDataUri], volume: 0 }),
  hit: new Howl({ src: [silentDataUri], volume: 0 }),
  dodge: new Howl({ src: [silentDataUri], volume: 0 }),
  arrow: new Howl({ src: [silentDataUri], volume: 0 }),
  boss_roar: new Howl({ src: [silentDataUri], volume: 0 }),
  phase_two: new Howl({ src: [silentDataUri], volume: 0 }),
  victory: new Howl({ src: [silentDataUri], volume: 0 }),
  death: new Howl({ src: [silentDataUri], volume: 0 })
};

export const audio = {
  play(key: SoundKey) {
    sounds[key].play();
  }
};
