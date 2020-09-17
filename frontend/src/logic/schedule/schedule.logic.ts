import { SectionLogic } from "../../helpers/section.model";
import { ScheduleDataModel } from "../../state/models/schedule-data/schedule-data.model";
import { ChildrenInfoLogic } from "./children-info.logic";
import { DataRow } from "./data-row.logic";
import { MetaDataLogic } from "./metadata.logic";
import { ShiftsInfoLogic } from "./shifts-info.logic";

type ScheduleLogicSectionField = {
  rawData?: DataRow[];
  sectionLogic?: SectionLogic;
  initializer: new (rawData: DataRow[], metaData: MetaDataLogic) => SectionLogic;
};

export class ScheduleLogic {
  //#region members
  //#region schedule sections
  private readonly sections: { [key: string]: ScheduleLogicSectionField } = {
    children_info: {
      initializer: ChildrenInfoLogic,
    },
    nurse_info: {
      initializer: ShiftsInfoLogic,
    },
    babysitter_info: {
      initializer: ShiftsInfoLogic,
    },
  };
  //#endregion
  private metaData: MetaDataLogic;
  //#endregion

  //#public methods

  public getNurseInfo(): ShiftsInfoLogic {
    return this.sections["nurse_info"].sectionLogic as ShiftsInfoLogic;
  }

  public getChildrenInfo(): ChildrenInfoLogic {
    return this.sections["children_info"].sectionLogic as ChildrenInfoLogic;
  }

  public getMetadata(): MetaDataLogic {
    return this.metaData;
  }
  public getBabySitterInfo(): ShiftsInfoLogic {
    return this.sections["babysitter_info"].sectionLogic as ShiftsInfoLogic;
  }

  public findRowByKey(schedule, key: string): [DataRow | undefined, number] {
    let index = schedule.findIndex((r) => r.matchesRowKey(key));
    let data = schedule[index];
    return [data, index];
  }

  public updateRow(row: DataRow) {
    Object.values(this.sections)
      .map((s) => s.sectionLogic)
      .forEach((logic) => {
        logic && logic.tryUpdate(row);
      });
  }

  public getScheduleModel(): ScheduleDataModel {
    return {
      schedule_info: {
        month_number: this.metaData.monthNumber,
        year: this.metaData.year,
      },
      shifts: {
        ...(this.sections["nurse_info"].sectionLogic as ShiftsInfoLogic).getWorkerShifts(),
        ...(this.sections["babysitter_info"].sectionLogic as ShiftsInfoLogic).getWorkerShifts(),
      },
      month_info: {
        days_of_week: this.metaData.daysOfWeek,
        day_numbers: this.metaData.dayNumbers,
        children_number: (this.sections["children_info"].sectionLogic as ChildrenInfoLogic)
          .registeredChildrenNumber,
      },
      employee_info: {
        babysitterCount: (this.sections["babysitter_info"].sectionLogic as ShiftsInfoLogic)
          .workersCount,
        nurseCount: (this.sections["nurse_info"].sectionLogic as ShiftsInfoLogic).workersCount,
      },
    };
  }
  //#endregion
  //#region initialization
  constructor(schedule: Array<Object>) {
    schedule = schedule.map((i) => new DataRow(i));
    [this.metaData, schedule] = this.initMetadataAndCleanUp(schedule as DataRow[]);
    this.initSections(schedule as DataRow[])
  }

  private initMetadataAndCleanUp(rawData: DataRow[]): [MetaDataLogic, DataRow[]] {
    let metaDataKey = "Grafik";
    let [dataRow, start] = this.findRowByKey(rawData, metaDataKey);
    let notSectionsRowsCountFromBeginning = 3;
    let schedule = rawData.slice(start + notSectionsRowsCountFromBeginning);
    return [new MetaDataLogic(dataRow), schedule];
  }

  private initSections(schedule: DataRow[]) {
    const childrenSectionData = this.findChildrenSection(schedule);
    this.sections["children_info"] = {
      rawData: childrenSectionData,
      sectionLogic: new ChildrenInfoLogic(childrenSectionData, this.metaData),
      initializer: ChildrenInfoLogic,
    }

    const [ nurseSectionData, nurseEndIdx ]  = this.findShiftSection(schedule)
    this.sections["nurse_info"] = {
      rawData: nurseSectionData,
      sectionLogic: new ShiftsInfoLogic(nurseSectionData, this.metaData),
      initializer: ShiftsInfoLogic,
    }

    const [ babysitterData ]  = this.findShiftSection(schedule.slice(nurseEndIdx + 1))
    this.sections["babysitter_info"] = {
      rawData: babysitterData,
      sectionLogic: new ShiftsInfoLogic(babysitterData, this.metaData),
      initializer: ShiftsInfoLogic,
    }
  }
  //#endregion

  //#region find shift section logic
  private findShiftSection(rawData: DataRow[]) : [DataRow[], number] {
    const sectionData: DataRow[] = []

    let sectionDataIdx = rawData.findIndex(rawData => rawData.isShiftRow)
    if(sectionDataIdx === -1 ){
      throw new Error("Cannot find section beginning");
    }
    while (rawData[sectionDataIdx].isShiftRow){
      sectionData.push(rawData[sectionDataIdx])
      sectionDataIdx++
    }
    const dataEndIdx = sectionDataIdx;
    return [sectionData, dataEndIdx]
  }
  //#endregion

  //#region find children section
  private findChildrenSection(schedule: DataRow[]): DataRow[] {
    let start = schedule.findIndex((r) => !r.isEmpty);
    let end = schedule.findIndex((r, index) => index > start && r.isEmpty);
    return schedule.slice(start, end);
  }

  //#endregion
}
