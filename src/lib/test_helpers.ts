import { v4 as uuid } from "uuid";
import { hashSync } from "bcrypt";

export const VALID_USER_DATA = {
  name: "user1",
  email: "user1@email.com",
  passwd: hashSync(uuid(), 10),
};
