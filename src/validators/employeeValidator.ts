
import { ValidationError } from "../utils/apiErrors";
import { CreateEmployeeRequest, DayOfWeek } from "../models/Employee";

const minStrLength = 2;
const maxStrLength = 50;
const maxExperience = 60;

export class EmployeeValidator {
  static validate(body: CreateEmployeeRequest): void {
    this.validateName(body.name);
    this.validateSurname(body.surname);
    this.validateExperience(body.experience);
    this.validateWorkDays(body.workDays);
    // this.validateSection(body.section);
  }

  static validateForUpdate(body: Partial<CreateEmployeeRequest>): void {
    if (body.name !== undefined) {
      this.validateName(body.name);
    }
    if (body.surname !== undefined) {
      this.validateSurname(body.surname);
    }
    if (body.experience !== undefined) {
      this.validateExperience(body.experience);
    }
    if (body.workDays !== undefined) {
      this.validateWorkDays(body.workDays);
    }
  }

  private static validateName(name: string | undefined): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Name is required");
    }

    if (name.trim().length < minStrLength) {
      throw new ValidationError(`Name must be at least ${minStrLength} characters`);
    }

    if (name.length > maxStrLength) {
        throw new ValidationError(`Name must be at most ${maxStrLength} characters`);
    }

    if (/\d/.test(name)) {
      throw new ValidationError("Name must not contain digits");
    }
  }

  private static validateSurname(surname: string | undefined): void {
    if (!surname || surname.trim().length === 0) {
      throw new ValidationError("Surname is required");
    }

    if (surname.trim().length < minStrLength) {
      throw new ValidationError(`Surname must be at least ${minStrLength} characters`);
    }

    if (surname.length > maxStrLength) {
      throw new ValidationError(`Surname must be at most ${maxStrLength} characters`);
    }

    if (/\d/.test(surname)) {
      throw new ValidationError("Surname must not contain digits");
    }
  }

  private static validateExperience(experience: number | undefined): void {
    if (experience === undefined || experience === null) {
      throw new ValidationError("Experience is required");
    }

    if (!Number.isInteger(experience)) {
      throw new ValidationError("Experience must be an integer");
    }

    if (experience < 0 || experience > maxExperience) {
      throw new ValidationError(`Experience must be between 0 and ${maxExperience} years`);
    }
  }

  // private static validateSection(section: LibrarySection | undefined): void {
  //   if (!section) {
  //     throw new ValidationError("Section is required");
  //   }

  //   if (!Object.values(LibrarySection).includes(section)) {
  //     throw new ValidationError(
  //       `Section must be one of: ${Object.values(LibrarySection).join(", ")}`
  //     );
  //   }
  // }

  private static validateWorkDays(workDays: DayOfWeek[] | undefined): void {
    if (!workDays || workDays.length === 0) {
      throw new ValidationError("Work days are required");
    }

    if (!workDays.every(day => Object.values(DayOfWeek).includes(day))) {
      throw new ValidationError(`Work days must be one of: ${Object.values(DayOfWeek).join(", ")}`);
    }
  }
}