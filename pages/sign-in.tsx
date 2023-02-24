import { Container, Divider, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";
import { pink } from "@mui/material/colors";
import { GetServerSideProps } from "next";
import PasswordShowIcon from "@mui/icons-material/VisibilityRounded";
import PasswordOffIcon from "@mui/icons-material/VisibilityOffRounded";
import message from "lib/message";
import { useAppDispatch } from "lib/redux/store";
import Cookies from "js-cookie";
import { auth } from "lib/redux/reducer";
import { Button, Input } from "antd";
import { motion } from "framer-motion";

type State = Partial<{
  email: string;
  password: string;
}>;

type LoadType = { pending: boolean; message: null | string };

export default function SignIn(): JSX.Element {
  const [state, setState] = React.useState<State>({});
  const [loading, setLoading] = React.useState<LoadType>({
    pending: false,
    message: null,
  });
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const redirect = router.query.redirect as string;
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state?.email || !state.password) {
      message(enqueueSnackbar, "All Fields Required", "error");
    }

    try {
      if (loading.pending) return;
      setLoading({ ...loading, pending: true });

      const request = await axios.post("/api/sign-in", state);
      const response = await request.data;

      message(
        enqueueSnackbar,
        response?.message,
        response.success ? "success" : "error"
      );

      if (response.success) {
        setLoading({ ...loading, message: "Redirecting...." });

        if (!response?.user[0]?.verified) {
          router.replace(
            "/email/request-verification" +
              (redirect ? "?redirect=" + redirect : "")
          );
          return;
        }

        dispatch(auth(response.user[0]));
        router.replace(redirect || "/").then(() => {
          setLoading({ pending: false, message: null });
        });
      } else setLoading({ pending: false, message: null });
    } catch (e: any) {
      message(enqueueSnackbar, e.message, "error");
      setLoading({ pending: false, message: null });
    }
  };

  return (
    <Container className="auth-container component-wrap ">
      <div className="auth-wrapper bg-white rounded-xl shadow-lg w-[400px] max-w-full mx-auto">
        <motion.form
          layoutId="auth-form"
          className="w-full py-20 my-6 px-3 sm:px-6 bg-primary-low/5 mx-auto"
          action="#"
          onSubmit={onSubmit}
        >
          <div className={"form-header mb-4"}>
            <Divider>
              <div className="font-extrabold text-lg text-center">SIGN IN</div>
            </Divider>
          </div>
          <Box className={"form-body"} maxWidth={"95%"} width={350} m={"auto"}>
            <div className="form-group mb-2">
              <label htmlFor="email" className="text-sm font-bold mb-1 block">
                Email
              </label>
              <Input
                id="email"
                onChange={({ target }) =>
                  setState({ ...state, email: target.value })
                }
                placeholder="Enter your registered email"
                autoComplete="email"
                size={"large"}
                status={errors.method && "error"}
              />
            </div>
            <div className={"form-group mb-2"}>
              <label htmlFor="email" className="text-sm font-bold mb-1 block">
                Password
              </label>
              <Input.Password
                size="large"
                placeholder="Enter Password"
                onChange={({ target }) =>
                  setState({ ...state, password: target.value })
                }
              />
            </div>
            <div className={"action-group my-4"}>
              <Button
                size={"large"}
                type={"primary"}
                htmlType="submit"
                className="w-full bg-primary-low"
                loading={loading.pending}
                disabled={
                  loading.pending ||
                  Boolean(loading.message) ||
                  !state.email ||
                  !state.password
                }
              >
                <span>
                  {loading.pending
                    ? "Authenticating..."
                    : loading.message || "Submit"}
                </span>
              </Button>
            </div>
            <Box textAlign={"center"} mt={2}>
              <div>
                Have an account already ?
                <Link
                  className="text-primary-low ml-2 font-bold"
                  href={"/sign-up"}
                >
                  <span>Sign Up</span>
                </Link>
              </div>
              <Link
                className="font-semibold text-sm text-gray-900"
                href={"/forgotten-password"}
              >
                <span>Forgotten Password</span>
              </Link>
            </Box>
          </Box>
        </motion.form>
      </div>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  //@ts-ignore
  const userid = req.session.user ?? null;
  // const cookies = res.cookie

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=120"
  );

  if (userid) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};
