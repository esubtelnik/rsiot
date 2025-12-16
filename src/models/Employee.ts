// export enum LibrarySection {
//    FICTION = "fiction",
//    NON_FICTION = "non_fiction",
//    CHILDREN = "children",
//    REFERENCE = "reference",
//    PERIODICALS = "periodicals",
//    RARE_BOOKS = "rare_books",
//    MULTIMEDIA = "multimedia",
//    ADMINISTRATION = "administration",
// }

import { readMyData } from "../utils/fileStorage";
import { LinkManager } from "./LinkManager";

export enum DayOfWeek {
   MONDAY = "monday",
   TUESDAY = "tuesday",
   WEDNESDAY = "wednesday",
   THURSDAY = "thursday",
   FRIDAY = "friday",
   SATURDAY = "saturday",
   SUNDAY = "sunday",
 }
 

export interface Employee {
   id: string;
   name: string;
   surname: string;
   experience: number;
   workDays: DayOfWeek[];
}

export class EmployeeLinkManager extends LinkManager<Employee> {
   protected fileName = "employees.sea";
   protected tableName = "employees";

   async findWorkingOnDay(day: string): Promise<Employee[]> {
      const employees = await readMyData<Employee>(this.fileName);
      return employees.filter((e) => e.workDays.includes(day as DayOfWeek));
   }
}  

export const employeeLinkManager = new EmployeeLinkManager();

export interface CreateEmployeeRequest {
   name: string;
   surname: string;
   experience: number;
   workDays: DayOfWeek[];
}
