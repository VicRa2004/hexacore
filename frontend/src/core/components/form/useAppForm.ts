import { createFormHook } from "@tanstack/react-form";
import {
	BotonEnviar,
	CampoCheckbox,
	CampoSelect,
	CampoTexto,
	Formulario,
} from "./campos";
import { fieldContext, formContext } from "./contextos";

/**
 * `useForm` con los campos del proyecto ya cableados (valor, blur, error, aria):
 *
 * <form.AppForm>
 *   <form.Formulario>
 *     <form.AppField name="email">{(c) => <c.CampoTexto label="Email" />}</form.AppField>
 *     <form.BotonEnviar>Guardar</form.BotonEnviar>
 *   </form.Formulario>
 * </form.AppForm>
 */
export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: { CampoTexto, CampoSelect, CampoCheckbox },
	formComponents: { Formulario, BotonEnviar },
});
