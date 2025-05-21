"use client";

import { isValidPhoneNumber } from "libphonenumber-js";
import * as yup from "yup";

export const signUpValidator = yup.object({
  email: yup
    .string()
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      {
        message: "Email inválido!",
      }
    )
    .required("Esse campo é obrigatório!"),
  firstname: yup.string().required("Este campo é obrigatório!"),
  lastname: yup.string().required("Este campo é obrigatório!"),
  phonenumber: yup
    .string()
    .test("matches-phone", "Número de telefone inválido!", (value) => {
      if (!value) return true;
      return isValidPhoneNumber(value);
    })
    .required("Esse campo é obrigatório!"),
  address1: yup.string().required("Esse campo é obrigatório!"),
  address2: yup.string(),
  password: yup
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres!")
    .required("Esse campo é obrigatório!"),
  password2: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "As senhas não coincidem!")
    .required("Esse campo é obrigatório!"),
  country: yup.string().required("Esse campo é obrigatório!"),
  postcode: yup.string().length(8).required("Esse campo é obrigatório!"),
  state: yup.string().required("Esse campo é obrigatório!"),
  city: yup.string().required("Esse campo é obrigatório!"),
});
