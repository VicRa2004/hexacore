import "reflect-metadata";
import { app } from "@/core/shared/infrastructure/http/server";
import { env } from "./core/config/env";

app.listen(env.PORT, () => {
  console.log("-----------------------------------------");
  console.log(`🚀 Server ready at: http://localhost:${env.PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log("-----------------------------------------");
});
