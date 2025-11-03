// src/utils/idGenerator.ts
import { customAlphabet } from 'nanoid';

// 1. Define el alfabeto (Base62: números, mayúsculas y minúsculas)
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// 2. Crea una función generadora que devuelve una cadena de 8 caracteres
// nanoid() usará el alfabeto y la longitud especificada.
export const generateShortId = customAlphabet(alphabet, 8);
