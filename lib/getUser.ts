import React from "react";
import { useAppDispatch } from "@lib/redux/store";
import Cookie from "js-cookie";

const GetUser = () => {
  const dispatch = useAppDispatch();

  React.useLayoutEffect(() => {
    const user = Cookie.get("_u");
    console.log({ user });
  }, []);

  return;
};

export default GetUser;
