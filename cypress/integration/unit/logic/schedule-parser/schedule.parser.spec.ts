/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable @typescript-eslint/camelcase */
/// <reference types="cypress" />
import { ScheduleParser } from "../../../../../src/logic/schedule-parser/schedule.parser";
import { ScheduleDataModel } from "../../../../../src/common-models/schedule-data.model";
import { ShiftCode, ShiftInfoModel } from "../../../../../src/common-models/shift-info.model";
import { WorkersInfoModel, WorkerType } from "../../../../../src/common-models/worker-info.model";

function fillWorkerInfo(
  shifts: ShiftInfoModel,
  employeeInfo: WorkersInfoModel,
  section: string[][],
  sectionType: WorkerType
): void {
  section.forEach((element) => {
    shifts[element[0]] = element.slice(1).map((x) => ShiftCode[x] ?? ShiftCode.W);
    employeeInfo.type[element[0]] = sectionType;
    employeeInfo.time[element[0]] = 1;
  });
}

//#region data declaration
const emptyRow = [""];
const dates = [28, 29, 30, 31, 1, 2, 3, 4, 5, 6];
const nurseSection = [
  ["pielęgniarka 1", "DN", " ", " ", " ", "U", "U", "U", "U", "U", "D"],
  ["pielęgniarka 2", "DN", "DN", "U", "W", "U", "U", "U", "U", "U", "D"],
  ["pielęgniarka 3", "N", " ", "L4", "D", "U", "U", "U", "U", "U", "D"],
  ["pielęgniarka 4", "U", "U", "U", "U", "D", "D", "DN", "L4", "DN", "U"],
  ["pielęgniarka 5", "DN", "L4", "L4", "W", "L4", "L4", "L4", "L4", "L4", "L4"],
];

const babysitterSection = [
  ["opiekunka 1", "L4", "L4", "L4", "L4", "L4", "D", "N", "L4", "L4", "L4"],
  ["opiekunka 2", "L4", "L4", "L4", "L4", "L4", "L4", "L4", "L4", "L4", "D"],
];

const exampleData = [
  ["Grafik ", "miesiąc listopad", "rok 2020", "ilość godz 0"],
  ["Dni miesiąca", ...dates.map((x) => x.toString())],
  emptyRow,
  ["Dzieci", ...dates.map((x) => "1")],
  emptyRow,
  ...nurseSection,
  emptyRow,
  ...babysitterSection,
];

const shifts: ShiftInfoModel = {};
const employee_info: WorkersInfoModel = { type: {}, time: {} };

fillWorkerInfo(shifts, employee_info, nurseSection, WorkerType.NURSE);
fillWorkerInfo(shifts, employee_info, babysitterSection, WorkerType.OTHER);

const expectedSchedule: ScheduleDataModel = {
  schedule_info: { month_number: 10, year: 2020, daysFromPreviousMonthExists: true },
  shifts: shifts,
  month_info: {
    frozen_shifts: [],
    children_number: dates.map((x) => 1),
    dates: dates,
  },
  employee_info: employee_info,
};

//#endregion

describe("Schedule parser", () => {
  const scheduleParser = new ScheduleParser(exampleData);
  const result = scheduleParser.schedule.getDataModel();
  it("check if workerType was parsed correctly ", () => {
    for (const [key, value] of Object.entries(result.employee_info.type)) {
      expect(expectedSchedule.employee_info.type[key]).to.equal(value);
    }
  });
  it("length of days must be equal to length of shifts", () => {
    for (const [, value] of Object.entries(result.shifts)) {
      expect(value).to.have.lengthOf(result.month_info.dates.length);
    }
  });

  it("should check if input and output shifts are equal", () => {
    for (const [key, value] of Object.entries(result.shifts)) {
      expect(value).to.eql(expectedSchedule.shifts[key]);
    }
  });
  it("all babysitter and nurses are in  employee_info ", () => {
    expect(result.employee_info).to.have.keys(Object.keys(expectedSchedule.employee_info));
  });
});