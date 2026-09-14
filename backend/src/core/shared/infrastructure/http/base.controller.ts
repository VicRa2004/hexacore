import type { Context } from "hono";
import { ZodError } from "zod";
// Asumiendo que z.treeifyError es una utilidad custom que tienes en tu proyecto.
// Si no, Zod nativo usa error.flatten() o error.format()
import z from "zod";
import { BaseError } from "../../domain/error/BaseError";

/**
 * Controlador base para Hono.
 * Proporciona métodos de utilidad para estandarizar las respuestas de éxito y error.
 */
export abstract class BaseController {
  /**
   * Maneja y formatea los errores capturados en la aplicación.
   * @param {unknown} error - El error capturado (puede ser ZodError, BaseError o genérico).
   * @param {Context} c - Contexto de Hono.
   * @returns {Response} Objeto Response estándar listo para ser retornado por Hono.
   */
  protected handleError(error: unknown, c: Context): Response {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: "Validation error",
          details: z.treeifyError(error),
        },
        400,
      );
    }

    if (error instanceof BaseError) {
      return c.json(
        { error: error.message },
        // Hono tipa estrictamente los HTTP status codes. Usamos 'as any'
        // para evitar conflictos si error.code es de tipo 'number' genérico.
        error.code as any,
      );
    }

    return c.json(
      {
        error: (error as Error)?.message || "Internal server error",
      },
      500,
    );
  }

  /**
   * Retorna una respuesta de éxito HTTP 200.
   */
  protected ok(c: Context, data: unknown): Response {
    return c.json(data, 200);
  }

  /**
   * Retorna una respuesta de creación exitosa HTTP 201.
   */
  protected created(c: Context, data: unknown): Response {
    return c.json(data, 201);
  }

  /**
   * Ejecuta un bloque de código asíncrono de forma segura, capturando cualquier error
   * y delegándolo a `handleError`.
   * @param {Context} c - Contexto de Hono.
   * @param {() => Promise<Response>} handler - Función que contiene la lógica del controlador.
   * @returns {Promise<Response>} La respuesta exitosa o el error formateado.
   */
  protected async executeSafely(
    c: Context,
    handler: () => Promise<Response>,
  ): Promise<Response> {
    try {
      return await handler();
    } catch (error) {
      return this.handleError(error, c);
    }
  }
}
