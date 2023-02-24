import React from "react";
import { OptionsObject, SnackbarMessage, useSnackbar } from "notistack";

function useMessage() {
  const { enqueueSnackbar } = useSnackbar();

  const alertMessage = (
    message: SnackbarMessage,
    variant: OptionsObject["variant"]
  ) => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
      autoHideDuration: 2000,
    });
  };
  return { alertMessage };
}

export default useMessage;
