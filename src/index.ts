import "reflect-metadata";
import { app } from "@/core/shared/infrastructure/http/server";
import { env } from "./core/config/env";

app.listen(env.PORT, () => {
  console.log(`SERVER ON PORT http://localhost:${env.PORT}`);
});
