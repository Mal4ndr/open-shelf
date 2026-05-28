/**
 * У фронтенді для опису DTO/інтерфейсів частіше використовують type або
 * interface,бо це чисто типізація, яка повністю зникає після компіляції
 * і не створює зайвого коду в JS.
 */

export type LoginDto = {
   email: string;
   password: string;
};

/**
 * Dto - це те що посилається на сервер, а Response те що приходить
 * від сервера. Це щодо різниці між Dto та Response.
 */
export type RegisterDto = {
   email: string;
   password: string;
};

export type RegisterResponse = {
   id: string;
   email: string;
};

export type AuthResponse = {
   access_token: string;
};

/**
 * Якщо пізніше бекенд почне повертати більше полів у me, можна розширити User
 */
export type User = {
   userId: string;
   email: string;
};
