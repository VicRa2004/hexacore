-- Dispositivo (user agent) de cada sesión, para listarlas y cerrarlas una a una.
ALTER TABLE "refresh_token" ADD COLUMN "rft_user_agent" VARCHAR(255);
