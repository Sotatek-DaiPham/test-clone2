import { isNumber } from "lodash";

export const REGEX_INPUT_DECIMAL = (min?: number, max?: number) => {
  if (!isNumber(min) || !isNumber(max)) {
    return RegExp(String.raw`^[0-9]*\.?[0-9]*$`);
  }

  return RegExp(String.raw`^([0-9]+\.?[0-9]{${min},${max}}|)$`);
};

export const isNumberGreaterThanOrEqualTo25 = (input: string) => {
  return RegExp(/^(2[5-9]|[3-9][0-9]|[1-9][0-9]{2,})$/).test(input);
};

export const TwitterUrlRegex =
  /^[Hh]ttp(?:s)?:\/\/(?:www\.)?(twitter|x)\.com(\/\S*)*$/;

export const TelegramUrlRegex =
  /([Hh]ttps?:\/\/)?(www[.])?(((web\.)?telegram)\.org|t\.(me))(\/\S*)*$/;

export const WebsiteUrlRegex =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

export const DiscordUrlRegex =
  /[Hh]ttp(?:s)?:\/\/(?:www\.)?discord\.com(\/\S*)*$/;
