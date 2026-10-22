"use client";

import * as yup from "yup";

export const logInValidator = yup.object({
  email: yup
    .string()
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      {
        message: "Email inválido!",
      }
    )
    .required("Esse campo é obrigatório!"),
  password: yup.string().min(8).required("Esse campo é obrigatório!"),
});
