import { Controller, Get, Route, Tags, Post, Body, Path, Delete, Patch, Response, Produces } from "tsoa";
import { Employee, CreateEmployeeRequest } from "../models/Employee";
import { readMyData, writeMyData } from "../utils/fileStorage";
import { wrapResponse, ApiResponse } from "../utils/responseWrapper";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../utils/apiErrors";
import { EmployeeValidator } from "../validators/employeeValidator";

@Route("employees")
@Tags("Employees")
export class EmployeeController extends Controller {
  private readonly file = "employees.sea";


  @Get("/")
  public async getEmployees(
  ): Promise<ApiResponse<Employee[]>> {
    const employees = await readMyData<Employee>(this.file);
    return wrapResponse(employees);
  }

  @Get("/{id}")
  public async getEmployee(@Path() id: string): Promise<ApiResponse<Employee>> {
    const employees = await readMyData<Employee>(this.file);
    const employee = employees.find(e => e.id === id);

    if (!employee) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }

    return wrapResponse(employee);
  }

  @Post("/")
  public async addEmployee(
    @Body() body: CreateEmployeeRequest
  ): Promise<ApiResponse<Employee>> {
    EmployeeValidator.validate(body);

    const employees = await readMyData<Employee>(this.file);

    const newEmployee: Employee = {
      id: uuidv4(),
      name: body.name.trim(),
      surname: body.surname.trim(),
      experience: body.experience,
      workDays: body.workDays
    };

    employees.push(newEmployee);
    await writeMyData(this.file, employees);

    return wrapResponse(newEmployee);
  }

  @Patch("/{id}")
  public async updateEmployee(
    @Path() id: string,
    @Body() body: Partial<CreateEmployeeRequest>
  ): Promise<ApiResponse<Employee>> {
    EmployeeValidator.validateForUpdate(body);

    const employees = await readMyData<Employee>(this.file);
    const index = employees.findIndex(e => e.id === id);

    if (index === -1) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }

    employees[index] = { ...employees[index], ...body };
    await writeMyData(this.file, employees);

    return wrapResponse(employees[index]);
  }

  @Delete("/{id}")
  public async deleteEmployee(@Path() id: string): Promise<ApiResponse<void>> {
    const employees = await readMyData<Employee>(this.file);
    const index = employees.findIndex(e => e.id === id);

    if (index === -1) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }

    employees.splice(index, 1);
    await writeMyData(this.file, employees);

    return wrapResponse();
  }

  @Get("/{id}/download")
  @Produces("application/json")
  @Response(200, "File download")
  public async downloadEmployee(@Path() id: string): Promise<string> {
    const employee = await this.getEmployee(id);
    return JSON.stringify(employee.data, null, 2);
  }

}