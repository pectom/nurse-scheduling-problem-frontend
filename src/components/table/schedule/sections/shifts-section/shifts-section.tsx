import { Button } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { StringHelper } from "../../../../../helpers/string.helper";
import { DataRow } from "../../../../../logic/schedule-logic/data-row";
import {
  WorkerInfo,
  WorkerType,
  WorkerTypeHelper,
} from "../../../../../common-models/worker-info.model";
import { ShiftCode } from "../../../../../common-models/shift-info.model";
import { AddWorkerModal } from "../../../../add-worker-modal/add-worker-modal";
import { ShiftCellComponent } from "../../schedule-parts/shift-cell.component";
import { ScheduleLogicContext } from "../../use-schedule-state";
import { BaseSectionComponent, BaseSectionOptions } from "../base-section/base-section.component";
import { ShiftRowComponent } from "../../schedule-parts/shift-row.component";
import { Sections } from "../../../../../logic/providers/schedule-provider.model";
import { ShiftsInfoLogic } from "../../../../../logic/schedule-logic/shifts-info.logic";

export interface ShiftsSectionOptions extends BaseSectionOptions {
  workerType: WorkerType;
}

export function ShiftsSectionComponent(options: ShiftsSectionOptions): JSX.Element {
  const { data = [], workerType, uuid } = options;
  const scheduleLogic = useContext(ScheduleLogicContext);
  const sectionKey: keyof Sections =
    workerType === WorkerType.NURSE ? "NurseInfo" : "BabysitterInfo";
  const sectionInfoProvider = scheduleLogic?.getSection<ShiftsInfoLogic>(sectionKey);

  const [dataState, setDataState] = useState(data);
  useEffect(() => {
    setDataState(data);
  }, [data, uuid]);
  const [isOpened, setIsOpened] = useState(false);
  const [workerInfo, setWorkerInfo] = useState({});

  const modal = (
    <AddWorkerModal
      isOpened={isOpened}
      setIsOpened={setIsOpened}
      submit={submit}
      workerType={workerType}
      workerInfo={workerInfo}
    />
  );

  function addOrUpdateWorker(newRow: DataRow, workerTime: number): void {
    if (sectionKey)
      scheduleLogic?.addWorker(sectionKey, newRow, workerTime, (newState) =>
        setDataState([...newState])
      );
  }

  function openWorkerModal(workerName?: string): void {
    let workerInfo = {};
    if (workerName && sectionInfoProvider) {
      workerInfo = { name: workerName, time: sectionInfoProvider.workerWorkTime(workerName) };
    }
    setWorkerInfo(workerInfo);
    setIsOpened(true);
  }

  function submit({ name, time }: WorkerInfo): void {
    if (!name || !time) return;
    let dataRow = dataState.find((row) => row.rowKey === name);
    if (!dataRow) {
      dataRow = new DataRow(name, new Array(data[0].length - 1).fill(ShiftCode.W));
    }
    addOrUpdateWorker(dataRow, time || 0);
  }

  return (
    <React.Fragment>
      {dataState.length > 0 && (
        <tr className="section-header">
          <td>
            <h3>{StringHelper.capitalize(WorkerTypeHelper.translate(workerType, true))}</h3>
          </td>

          <td>
            <div>
              <Button onClick={(): void => openWorkerModal()}>Dodaj</Button>
            </div>
          </td>
        </tr>
      )}

      <BaseSectionComponent
        {...options}
        key={uuid}
        data={dataState}
        sectionKey={sectionKey}
        cellComponent={ShiftCellComponent}
        rowComponent={ShiftRowComponent}
        onRowKeyClicked={(rowIndex): void => openWorkerModal(dataState[rowIndex].rowKey)}
      />
      {modal}
    </React.Fragment>
  );
}