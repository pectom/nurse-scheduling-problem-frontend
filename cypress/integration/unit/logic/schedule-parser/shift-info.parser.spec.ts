/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/// <reference types="cypress" />
import { DataRowParser } from "../../../../../src/logic/schedule-parser/data-row.parser";
import { MetaDataParser } from "../../../../../src/logic/schedule-parser/metadata.parser";
import { ShiftsInfoParser } from "../../../../../src/logic/schedule-parser/shifts-info.parser";

//#region  data declaration

const TestCases: { data: DataRowParser[]; expectedData: DataRowParser[]; errorCount: number }[] = [
  {
    data: [
      new DataRowParser(["opiekunka 1", "N", "Error", "N", " ", "D", "N", "NotValid", "L4", "U"]),
    ],
    expectedData: [
      new DataRowParser(["opiekunka 1", "N", "W", "N", "W", "D", "N", "W", "L4", "U"]),
    ],
    errorCount: 2,
  },
  {
    data: [
      new DataRowParser(["opiekunka 1", "N", "Error", "N", " ", "D", "N", "NotValid", "L4", "U"]),
      new DataRowParser(["opiekunka 2", "NotVald", "L4", "L4", "L4", "*", "N", "W", "L4", "U"]),
      new DataRowParser(["opiekunka 3", "N", "W", "N", "Errr ", "D", "N", "W", "L4", "U"]),
    ],
    expectedData: [
      new DataRowParser(["opiekunka 1", "N", "W", "N", "W", "D", "N", "W", "L4", "U"]),
      new DataRowParser(["opiekunka 2", "W", "L4", "L4", "L4", "L4", "N", "W", "L4", "U"]),
      new DataRowParser(["opiekunka 3", "N", "W", "N", "W", "D", "N", "W", "L4", "U"]),
    ],
    errorCount: 5,
  },
  {
    data: [new DataRowParser(["opiekunka 1", "N", " ", "N", " ", "D", "N", " ", "L4", "U"])],

    expectedData: [
      new DataRowParser(["opiekunka 1", "N", "W", "N", "W", "D", "N", "W", "L4", "U"]),
    ],
    errorCount: 0,
  },
];

const metaData: MetaDataParser = new MetaDataParser(
  2020,
  10,
  new DataRowParser(["Dni miesiąca", "28", "29", "30", "31", "1", "2", "3", "4", "5"])
);

//#region

describe("ShifstInfo parser", () => {
  context("Testing detection of errors", () => {
    TestCases.forEach((element) => {
      const shiftsInfoParser = new ShiftsInfoParser(element.data, metaData);
      const result = shiftsInfoParser.errors;
      it(`should have exaclty ${element.errorCount} errors`, () => {
        expect(result).have.lengthOf(element.errorCount);
      });
    });
  });
  context("Testing section data", () => {
    TestCases.forEach((element) => {
      const shiftsInfoParser = new ShiftsInfoParser(element.data, metaData);
      const result = shiftsInfoParser.sectionData;

      it(`should be equal`, () => {
        expect(result).eql(element.expectedData);
      });
    });
  });
});
