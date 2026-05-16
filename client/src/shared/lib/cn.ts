/**
 * Даний файл представляє папку lib, призначення якої зберігати утиліти, хелпери, функції, які не
 * залежать від бізнес-логіки. В поточному файлі зберігається функція для злиття класів (наприклад,
 * для Tailwind), можуть бути й інші утиліти: формутвання дат, генерація id, робота з localStorage..
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
   return twMerge(clsx(inputs));
}
