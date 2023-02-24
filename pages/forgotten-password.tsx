import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import message from "lib/message";
import { useSnackbar } from "notistack";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  CircularProgress,
  Collapse,
  Divider,
  Paper,
  TextField,
  useTheme,
} from "@mui/material";
import dynamic from "next/dynamic";
import SEO from "@comp/seo";

type Props = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function ForgottenPassword(props: Props) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [response, setResponse] = React.useState<{
    message: string;
    done: boolean;
    success: boolean;
  }>();
  const { enqueueSnackbar } = useSnackbar();
  const {
    handleSubmit,
    register,
    formState: { errors },
    getValues,
  } = useForm<{ email: string }>();
  const theme = useTheme();

  const onSubmit = async (data: { email: string }) => {
    try {
      if (loading) return;
      setLoading(true);

      const request = await axios.post("/api/request-password-change", {
        email: data.email,
      });

      const { success, message } = await request.data;
      setResponse({ success, message, done: true });
      setLoading(false);
    } catch (e: any) {
      setResponse({ success: false, message: e.message, done: true });
      setLoading(false);
    }
  };

  const pageDescription = {
    title: `Forgotten Password`,
    description:
      "Request for change of password if you can't remember it anymore, just submit your registered email address and a link will be sent to you if the email is registered.",
    url: "https://pauloxuries.com/forgotten-password",
    image: "https://pauloxuries.com/identity/dark-logo.png",
  };

  return (
    <Paper
    className="component-wrap"
      component="form"
      action="#"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        [theme.breakpoints.down(400)]: { px: 1.5, py: 3 },
        borderRadius: "20px",
        bgcolor: `secondary.${theme.palette.mode}`,
        p: 2,
      }}
    >
      <SEO {...pageDescription} />
      <Divider textAlign="left">
        <Typography
          variant="subtitle1"
          component="h2"
          my={1}
          fontWeight={700}
          color={"grey"}
        >
          Forgotten Password
        </Typography>
      </Divider>
      <Typography
        id="transition-modal-title"
        variant="subtitle1"
        component="h2"
        mt={3}
        mb={1.5}
      >
        Enter your registered email address
      </Typography>
      <Box mb={2} maxWidth={400}>
        <TextField
          label={"Registered Email Address"}
          {...register("email", { required: true })}
          fullWidth
          autoComplete="email"
          disabled={loading}
          variant="outlined"
          size={"small"}
          error={Boolean(errors.email)}
          helperText={Boolean(errors.email) && "This field is required"}
        />
      </Box>
      <Collapse in={response!?.done ?? false}>
        <Box
          sx={{
            p: "1em",
            background: response!?.success ? color["green"] : color["red"],
            borderRadius: "20px",
            maxWidth: "500px",
            border: `2px solid grey`,
            mb: "1em",
          }}
        >
          <Typography
            variant={"subtitle1"}
            fontWeight={700}
            color={response!?.success ? color["green_text"] : color["red_text"]}
          >
            {response!?.success
              ? "Email Sent Successfully"
              : response!?.message ?? "Unable To Verify The Email Entered"}
          </Typography>

          <Typography variant={"subtitle2"} color={"grey"}>
            {response!?.success
              ? "Check your email, if not found, Check your spam. The link will expired in 2hours."
              : "We are having issue sending you an email"}
          </Typography>
        </Box>
      </Collapse>
      <Box className={"action-group"} mb={3}>
        <Button variant={"contained"} type={"submit"} disabled={loading}>
          {loading && !response!?.done && (
            <CircularProgress size={20} color={"inherit"} />
          )}
          <Typography
            component={"span"}
            ml={loading ? 2 : 0}
            fontWeight={600}
            variant={"subtitle1"}
            textTransform={"none"}
          >
            {loading
              ? "Verifying..."
              : response!?.done && response!?.success
              ? "Resend Email"
              : "Get Link"}
          </Typography>
        </Button>
      </Box>
    </Paper>
  );
}

const color = {
  red: "#c507074a",
  green: "#07c51e4a",
  red_text: "#833232",
  green_text: "green",
};

export default dynamic(async () => await ForgottenPassword, { ssr: false });
