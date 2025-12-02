import { IRequest } from "../../../../configs/types/IRequest";
export const getLang = (req: IRequest): string => {
  return req.headers["accept-language"] || "en";
};
