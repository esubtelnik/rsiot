// src/validators/VisitorValidator.ts
import { ValidationError } from "../utils/apiErrors";
import { CreateVisitorRequest } from "../models/Visitor";

const minStrLength = 2;
const maxStrLength = 50;

export class VisitorValidator {
  static validate(body: CreateVisitorRequest): void {
    this.validateName(body.name);
    this.validateSurname(body.surname);
    this.validateRegistrationDate(body.registrationDate);
  }

  static validateForUpdate(body: Partial<CreateVisitorRequest>): void {
    if (body.name !== undefined) {
      this.validateName(body.name);
    }

    if (body.surname !== undefined) {
      this.validateSurname(body.surname);
    }

    if (body.registrationDate !== undefined) {
      this.validateRegistrationDate(body.registrationDate);
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

  private static validateRegistrationDate(dateStr: string | undefined): void {
    if (!dateStr) {
      throw new ValidationError("Registration date is required");
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new ValidationError("Invalid registration date format");
    }

    const now = new Date();
    if (date > now) {
      throw new ValidationError("Registration date cannot be in the future");
    }
  }
}
