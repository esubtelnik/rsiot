import { ValidationError } from "../utils/apiErrors";
import { CreateBookRequest, Genre } from "../models/Book";

const minStrLength = 2;
const maxStrLength = 100;
const maxPages = 10000;

export class BookValidator {
  static validate(body: Partial<CreateBookRequest>): void {
    this.validateAuthor(body.author);
    this.validateTitle(body.title);
    this.validatePages(body.pages);
    this.validateYear(body.year);
    this.validateGenre(body.genre);
  }

  static validateForUpdate(body: Partial<CreateBookRequest>): void {
    if (body.author !== undefined) {
      this.validateAuthor(body.author);
    }
    if (body.title !== undefined) {
      this.validateTitle(body.title);
    }
    if (body.pages !== undefined) {
      this.validatePages(body.pages);
    }
    if (body.year !== undefined) {
      this.validateYear(body.year);
    }
    if (body.genre !== undefined) {
      this.validateGenre(body.genre);
    }
  }

  private static validateAuthor(author: string | undefined): void {
    if (!author || author.trim().length === 0) {
      throw new ValidationError("Author is required");
    }

    if (author.trim().length < minStrLength) {
      throw new ValidationError(`Author must be at least ${minStrLength} characters`);
    }

    if (author.length > maxStrLength) {
      throw new ValidationError(`Author must be at most ${maxStrLength} characters`);
    }
  }

  private static validateTitle(title: string | undefined): void {
    if (!title || title.trim().length === 0) {
      throw new ValidationError("Title is required");
    }

    if (title.trim().length < minStrLength) {
      throw new ValidationError(`Title must be at least ${minStrLength} characters`);
    }

    if (title.length > maxStrLength) {
      throw new ValidationError(`Title must be at most ${maxStrLength} characters`);
    }
  }

  private static validatePages(pages: number | undefined): void {
    if (pages === undefined || pages === null) {
      throw new ValidationError("Pages is required");
    }

    if (!Number.isInteger(pages)) {
      throw new ValidationError("Pages must be an integer");
    }

    if (pages < 1) {
      throw new ValidationError("Pages must be at least 1");
    }

    if (pages > maxPages) {
      throw new ValidationError(`Pages must be at most ${maxPages}`);
    }
  }

  private static validateYear(year: number | undefined): void {
    if (year === undefined || year === null) {
      throw new ValidationError("Year is required");
    }

    if (!Number.isInteger(year)) {
      throw new ValidationError("Year must be an integer");
    }

    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      throw new ValidationError(`Year cannot be greater than ${currentYear}`);
    }
  }

  private static validateGenre(genre: string | undefined): void {
    if (!genre) {
      throw new ValidationError("Genre is required");
    }

    if (!Object.values(Genre).includes(genre as Genre)) {
      throw new ValidationError(
        `Genre must be one of: ${Object.values(Genre).join(", ")}`
      );
    }
  }
}