import { Request, Response, NextFunction } from "express";

export function downloadHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check if the request is for a download endpoint
  if (req.path.includes('/download')) {
    // Extract the entity type and id from the path
    const pathParts = req.path.split('/');
    const entityType = pathParts[1]; // books, employees, visitors
    const id = pathParts[2];

    // Set Content-Disposition header for file download
    res.setHeader('Content-Disposition', `attachment; filename="${entityType.slice(0, -1)}-${id}.json"`);
    res.setHeader('Content-Type', 'application/json');
  }

  next();
}
