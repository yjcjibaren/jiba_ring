import { create } from "zustand";
import {
  BOSS_NAME,
  BOSS_MAX_HP,
  CHAPTER_TITLE,
  PLAYER_MAX_ENERGY,
  PLAYER_MAX_HP,
  PLAYER_MAX_STAMINA,
  PLAYER_POTION_COUNT,
  SUMMON_MAX_HP
} from "../game/constants";

export type WeaponType = "summon";
export type ScreenState = "menu" | "playing" | "paused" | "gameover" | "victory";

type GameStore = {
  screen: ScreenState;
  chapterTitle: string;
  bossName: string;
  bossSubtitle: string;
  playerHp: number;
  playerMaxHp: number;
  playerStamina: number;
  playerMaxStamina: number;
  playerEnergy: number;
  playerMaxEnergy: number;
  potions: number;
  currentWeapon: WeaponType;
  summonHp: number;
  summonMaxHp: number;
  bossVisible: boolean;
  bossHp: number;
  bossMaxHp: number;
  phaseTwo: boolean;
  startedOnce: boolean;
  resetRun: number;
  setScreen: (screen: ScreenState) => void;
  startGame: () => void;
  restartGame: () => void;
  quitToMenu: () => void;
  setPlayerStats: (
    hp: number,
    stamina: number,
    energy: number,
    potions: number,
    weapon: WeaponType,
    summonHp: number
  ) => void;
  setBossState: (visible: boolean, hp: number, subtitle?: string) => void;
  setChapter: (title: string, bossName: string, bossMaxHp: number) => void;
  triggerPhaseTwo: () => void;
};

const baseState = {
  chapterTitle: CHAPTER_TITLE,
  bossName: BOSS_NAME,
  bossSubtitle: "",
  playerHp: PLAYER_MAX_HP,
  playerMaxHp: PLAYER_MAX_HP,
  playerStamina: PLAYER_MAX_STAMINA,
  playerMaxStamina: PLAYER_MAX_STAMINA,
  playerEnergy: 0,
  playerMaxEnergy: PLAYER_MAX_ENERGY,
  potions: PLAYER_POTION_COUNT,
  currentWeapon: "summon" as WeaponType,
  summonHp: SUMMON_MAX_HP,
  summonMaxHp: SUMMON_MAX_HP,
  bossVisible: false,
  bossHp: BOSS_MAX_HP,
  bossMaxHp: BOSS_MAX_HP,
  phaseTwo: false
};

export const useGameStore = create<GameStore>((set) => ({
  screen: "menu",
  startedOnce: false,
  resetRun: 0,
  ...baseState,
  setScreen: (screen) => set({ screen }),
  startGame: () =>
    set((state) => ({
      ...baseState,
      screen: "playing",
      startedOnce: true,
      resetRun: state.resetRun + 1
    })),
  restartGame: () =>
    set((state) => ({
      ...baseState,
      screen: "playing",
      resetRun: state.resetRun + 1
    })),
  quitToMenu: () => set({ ...baseState, screen: "menu" }),
  setPlayerStats: (hp, stamina, energy, potions, weapon, summonHp) =>
    set({
      playerHp: hp,
      playerStamina: stamina,
      playerEnergy: energy,
      potions,
      currentWeapon: weapon,
      summonHp
    }),
  setBossState: (visible, hp, subtitle = "") =>
    set({
      bossVisible: visible,
      bossHp: hp,
      bossSubtitle: subtitle
    }),
  setChapter: (title, bossName, bossMaxHp) =>
    set({
      chapterTitle: title,
      bossName,
      bossMaxHp,
      bossHp: bossMaxHp,
      bossSubtitle: "",
      phaseTwo: false
    }),
  triggerPhaseTwo: () => set({ phaseTwo: true })
}));
