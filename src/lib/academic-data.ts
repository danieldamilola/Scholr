import { COLLEGES, DEPARTMENTS, PROGRAMMES, LEVELS } from "@/constants";

export type Role = "student" | "lecturer" | "class_rep" | "librarian";

export interface College {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Programme {
  id: string;
  name: string;
}

export interface Level {
  id: string;
  name: string;
}

export const colleges: College[] = COLLEGES.map((college) => ({
  id: college,
  name: college,
}));

export const departments: Record<string, Department[]> = Object.fromEntries(
  Object.entries(DEPARTMENTS).map(([college, depts]) => [
    college,
    depts.map((dept) => ({ id: dept, name: dept })),
  ]),
);

export const programmes: Record<string, Programme[]> = Object.fromEntries(
  Object.entries(PROGRAMMES).map(([dept, progs]) => [
    dept,
    progs.map((prog) => ({ id: prog, name: prog })),
  ]),
);

export const levels: Level[] = LEVELS.map((level) => ({
  id: level,
  name: level,
}));
