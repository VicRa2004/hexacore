import type { AwilixContainer } from "awilix";

declare module "express-serve-static-core" {
  interface Request {
    container?: AwilixContainer;
  }
}

// Module augmentation for Express request to add Awilix container.
