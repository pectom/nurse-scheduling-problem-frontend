/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { RevisionType, ThunkFunction } from "../../../logic/data-access/persistance-store.model";
import * as _ from "lodash";
import { cropScheduleDMToMonthDM } from "../../../logic/schedule-container-converter/schedule-container-converter";
import { LocalStorageProvider } from "../../../logic/data-access/local-storage-provider.model";
import { Shift, ShiftCode } from "./shift-types.model";
import { MonthDataModel, ScheduleDataModel } from "../schedule-data.model";
import { VerboseDateHelper } from "../../../helpers/verbose-date.helper";
import { ScheduleDataActionCreator } from "../schedule-data.action-creator";

export class ShiftsActionCreator {
  static deleteShift(shift: Shift | undefined): ThunkFunction<unknown> {
    return async (dispatch, getState): Promise<void> => {
      if (!shift) return;

      const { code } = shift;
      const actualSchedule = _.cloneDeep(getState().actualState.persistentSchedule.present);
      const actualMonth = cropScheduleDMToMonthDM(actualSchedule);

      const updatedMonth = ShiftsActionCreator.deleteShiftFromMonthDM(actualMonth, code);

      dispatch(this.createUpdateAction(updatedMonth));

      const nextMonthDM = await new LocalStorageProvider().getMonthRevision(
        actualMonth.scheduleKey.nextMonthKey.getRevisionKey("primary")
      );

      if (_.isNil(nextMonthDM) || !nextMonthDM.isAutoGenerated) return;
      const updatedNextMonth = ShiftsActionCreator.deleteShiftFromMonthDM(actualMonth, code);
      await new LocalStorageProvider().saveBothMonthRevisionsIfNeeded("primary", updatedNextMonth);
    };
  }

  private static deleteShiftFromMonthDM(
    monthDataModel: MonthDataModel,
    shiftCode: string
  ): MonthDataModel {
    const monthDataModelCopy = _.cloneDeep(monthDataModel);
    Object.entries(monthDataModelCopy.shifts).forEach(([workerName, workersShifts]) => {
      monthDataModelCopy.shifts[workerName] = workersShifts.map((shiftCodeInArray) =>
        shiftCodeInArray === shiftCode ? ShiftCode.W : shiftCodeInArray
      );
    });
    delete monthDataModelCopy.shift_types[shiftCode];
    return monthDataModelCopy;
  }

  private static createUpdateAction(
    updatedMonth: MonthDataModel
  ): ThunkFunction<ScheduleDataModel> {
    const { year, month } = updatedMonth.scheduleKey;
    const revision: RevisionType = VerboseDateHelper.isMonthInFuture(month, year)
      ? "primary"
      : "actual";

    return ScheduleDataActionCreator.setScheduleFromMonthDMAndSaveInDB(updatedMonth, revision);
  }
}