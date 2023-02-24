import {
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSnackbar } from "notistack";
import router from "next/router";
import { pink } from "@mui/material/colors";
import { GetServerSideProps } from "next";
import message from "lib/message";
import JWT from "jsonwebtoken";

type Props = { email: string; error?: string };
type Inputs = { password: string; confirm: string };

export default function SignIn({ email, error }: Props): JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const {
    handleSubmit,
    formState: { errors },
    register,
    watch,
  } = useForm<Inputs>();

  const { password, confirm } = watch();

  const onSubmit = async (data: Inputs) => {
    try {
      if (loading) return;
      setLoading(true);

      if (!(password === confirm)) throw new Error("Password doesn't match");
      const request = await axios.post(
        "/api/reset-password",
        Object.assign(data, { email })
      );

      const { success, message: msg } = await request.data;

      message(
        enqueueSnackbar,
        success
          ? "Password Changed Successfully"
          : msg ?? "Error changing password",
        success ? "success" : "error"
      );

      setLoading(false);
      if (success) router.replace("/sign-in");
    } catch (e: any) {
      console.log({ e });
      message(enqueueSnackbar, e.message, "error");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Paper
        sx={{
          [theme.breakpoints.down(400)]: { px: 1.5, py: 3 },
          borderRadius: "20px",
          bgcolor: `secondary.${theme.palette.mode}`,
          p: 2,
        }}
      >
        <Typography
          variant={"subtitle1"}
          fontWeight={600}
          color={"primary"}
          textTransform={"uppercase"}
        >
          {error}
        </Typography>
        <Typography variant={"subtitle2"}>
          The link looks like expired one.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        [theme.breakpoints.down(400)]: { px: 1.5, py: 3 },
        borderRadius: "20px",
        bgcolor: `secondary.${theme.palette.mode}`,
        p: 2,
      }}
      className="reset-wrapper component-wrap"
    >
      <Divider textAlign="left">
        <Typography
          variant="h6"
          component="h2"
          my={1}
          fontWeight={700}
          color={"grey"}
        >
          Reset Password
        </Typography>
      </Divider>
      <Box component="form" action="#" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="caption">
          The reset password link will expire after 2hrs of creation.
        </Typography>
        <Box className={"form-body"} maxWidth={350} mt={3}>
          <Box mb={2} className="form-group">
            <TextField
              label={"New Password"}
              {...register("password", { required: true })}
              fullWidth
              autoComplete="new-password"
              variant="outlined"
              size={"small"}
              type={"password"}
              error={Boolean(errors.password)}
              helperText={Boolean(errors.password) && "This field is required"}
            />
          </Box>
          <Box mb={2} className="form-group">
            <TextField
              label={"Confirm Password"}
              {...register("confirm", { required: true })}
              fullWidth
              type={"password"}
              size={"small"}
              autoComplete="confirm-password"
              variant="outlined"
              error={Boolean(errors.confirm)}
              helperText={Boolean(errors.confirm) && "This field is required"}
            />
          </Box>
          <Box className={"action-group"} mb={3}>
            <Button
              variant={"contained"}
              size={"large"}
              type={"submit"}
              color={"primary"}
              disabled={loading || !password || !confirm}
              sx={{
                color: "#fff",
                p: 1.5,
                bgcolor: `primary.${theme.palette.mode}`,
                "&:hover": { bgcolor: pink[800] },
              }}
              fullWidth
            >
              {loading && <CircularProgress size={20} color={"inherit"} />}
              <Typography
                component={"span"}
                ml={loading ? 2 : 0}
                fontWeight={600}
                variant={"subtitle1"}
                textTransform={"none"}
              >
                Change Password
              </Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  try {
    const token = query.token as string;
    if (!token) {
      return {
        notFound: true,
      };
    }

    const SECRET_KEY = process.env.SECRET_KEY as string;

    const user = JWT.verify(token, SECRET_KEY);
    return {
      props: {
        ...(user as JWT.JwtPayload),
      },
    };
  } catch (error: any) {
    return {
      props: {
        error: error.message,
      },
    };
  }
};
