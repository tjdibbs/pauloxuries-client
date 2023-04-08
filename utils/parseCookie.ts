export default function parseCookie(cookie: string | undefined) {
  if (!cookie) return {};

  return cookie
    .split(";")
    .reduce<{ [x: string]: string }>((parsedCookie, cookieString) => {
      let _c = cookieString.split("=");
      let newCookie = { [_c[0].trim()]: _c[1] };
      return { ...parsedCookie, ...newCookie };
    }, {});
}
