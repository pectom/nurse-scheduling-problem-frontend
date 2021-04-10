/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { SCHEDULE_CONTAINERS_LENGTH, ScheduleContainerType } from "./schedule-data.model";
import * as _ from "lodash";

export interface Shift {
  code: string;
  name: string;
  from: number;
  to: number;
  color: string;
  isWorkingShift: boolean;
  normSubtraction?: number;
}

export enum ShiftCode {
  RP = "RP",
  RPN = "RPN",
  N8 = "N8",
  D1 = "D1",
  D2 = "D2",
  P1 = "P1",
  R1 = "R1",
  R = "R",
  P = "P",
  D = "D",
  N = "N",
  DN = "DN",
  PN = "PN",
  W = "W",
  U = "U",
  L4 = "L4",
  K = "K",
  NZ = "NZ",
  OK8 = "OK8",
  OK12 = "OK12",
  OP8 = "OP8",
  OP12 = "OP12",
  P2 = "P2",
}

export const SHIFTS: { [code in ShiftCode]: Shift } = {
  P2: {
    code: ShiftCode.P2,
    name: "popołudnie 2",
    from: 13,
    to: 19,
    color: "805646",
    isWorkingShift: true,
  },
  RP: {
    code: ShiftCode.RP,
    name: "rano, popołudnie",
    from: 7,
    to: 19,
    color: "FFD100",
    isWorkingShift: true,
  },
  RPN: {
    code: ShiftCode.RPN,
    name: "rano, popołudnie, noc",
    from: 7,
    to: 7,
    color: "9025cf",
    isWorkingShift: true,
  },
  N8: {
    code: ShiftCode.N8,
    name: "noc 8h",
    from: 23,
    to: 7,
    color: "76a877",
    isWorkingShift: true,
  },
  D1: {
    code: ShiftCode.D1,
    name: "dzień 1",
    from: 7,
    to: 17,
    color: "396e75",
    isWorkingShift: true,
  },
  D2: {
    code: ShiftCode.D2,
    name: "dzień 2",
    from: 7,
    to: 16,
    color: "eda81c",
    isWorkingShift: true,
  },
  P1: {
    code: ShiftCode.P1,
    name: "popołudnie 1",
    from: 15,
    to: 21,
    color: "2003fc",
    isWorkingShift: true,
  },
  R1: {
    code: ShiftCode.R1,
    name: "rano 1",
    from: 7,
    to: 13,
    color: "5ce6dc",
    isWorkingShift: true,
  },

  R: { code: ShiftCode.R, name: "rano", from: 7, to: 15, color: "a82758", isWorkingShift: true },
  P: {
    code: ShiftCode.P,
    name: "popołudnie",
    from: 15,
    to: 19,
    color: "00A3FF",
    isWorkingShift: true,
  },
  D: { code: ShiftCode.D, name: "dzień", from: 7, to: 19, color: "73B471", isWorkingShift: true },
  N: { code: ShiftCode.N, name: "noc", from: 19, to: 7, color: "1D3557", isWorkingShift: true },
  DN: {
    code: ShiftCode.DN,
    name: "dzień, noc",
    from: 7,
    to: 7,
    color: "641EAA",
    isWorkingShift: true,
  },
  PN: {
    code: ShiftCode.PN,
    name: "popołudnie, noc",
    from: 15,
    to: 7,
    color: "FFD100",
    isWorkingShift: true,
  },
  W: { code: ShiftCode.W, name: "wolne", from: 0, to: 24, color: "FF8A00", isWorkingShift: false },
  U: {
    code: ShiftCode.U,
    name: "urlop wypoczynkowy",
    from: 0,
    to: 24,
    color: "92D050",
    isWorkingShift: false,
  },
  L4: {
    code: ShiftCode.L4,
    name: "zwolnienie lekarskie (L4)",
    from: 0,
    to: 24,
    color: "C60000",
    isWorkingShift: false,
  },
  K: {
    code: ShiftCode.K,
    name: "kwarantanna",
    from: 0,
    to: 24,
    color: "000000",
    isWorkingShift: false,
  },
  OP8: {
    code: ShiftCode.OP8,
    name: "urlop opiekuńczy 8",
    from: 0,
    to: 24,
    color: "641EAA",
    isWorkingShift: false,
  },
  OP12: {
    code: ShiftCode.OP12,
    name: "urlop opiekuńczy 12",
    from: 0,
    to: 24,
    color: "fc03e7",
    isWorkingShift: false,
  },

  OK8: {
    code: ShiftCode.OK8,
    name: "urlop okolicznościowy 8h",
    from: 0,
    to: 24,
    color: "127622",
    isWorkingShift: false,
    normSubtraction: 8,
  },
  OK12: {
    code: ShiftCode.OK12,
    name: "urlop okolicznościowy 12h",
    from: 0,
    to: 24,
    color: "C3A000",
    isWorkingShift: false,
    normSubtraction: 12,
  },
  NZ: {
    code: ShiftCode.NZ,
    name: "niezatrudniony",
    from: 0,
    to: 24,
    color: "000000",
    isWorkingShift: false,
  },
};

export const FREE_SHIFTS = Object.values(SHIFTS)
  .filter((shift) => !shift.isWorkingShift && shift.code !== "W")
  .map((shift) => shift.code);

export const WORKING_SHIFTS = Object.values(SHIFTS)
  .filter((shift) => shift.isWorkingShift)
  .map((shift) => shift.code);

export interface ShiftInfoModel {
  [nurseName: string]: ShiftCode[];
}

export interface ShiftsTypesDict {
  [shiftCode: string]: Shift;
}

export function validateShiftInfoModel(
  shifts: ShiftInfoModel,
  containerType: ScheduleContainerType
): void {
  if (shifts !== undefined && !_.isEmpty(shifts)) {
    const [worker, workerShifts] = Object.entries(shifts)[0];
    const shiftLen = workerShifts.length;
    if (!SCHEDULE_CONTAINERS_LENGTH[containerType].includes(shiftLen)) {
      throw new Error(
        `Schedule shift for worker ${worker} have wrong length: ${shiftLen} it should be on of ${SCHEDULE_CONTAINERS_LENGTH[containerType]}`
      );
    }
    Object.entries(shifts).forEach(([workerName, shift]) => {
      if (shift.length !== shiftLen) {
        throw new Error(`Shifts for worker: ${workerName} have wrong length: ${shift.length}`);
      }
    });
  }
}
