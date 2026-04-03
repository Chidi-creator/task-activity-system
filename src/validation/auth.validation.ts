import joi from "joi";
import { RegisterInput, LoginInput } from "@usecases/auth.usecase";

export const validateRegister = (object: RegisterInput) => {
  const schema = joi.object({
    firstName: joi.string().min(2).max(30).required(),
    lastName: joi.string().min(2).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
  });
  return schema.validate(object, { abortEarly: false });
};

export const validateLogin = (object: LoginInput) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
  });
  return schema.validate(object, { abortEarly: false });
};
