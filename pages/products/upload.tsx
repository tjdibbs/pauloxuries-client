import React from "react";
import Box from "@mui/material/Box";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import axios from "axios";
import { AppState, FormDataType, Response } from "@lib/types";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";
import Cookie from "js-cookie";
import { GetServerSideProps } from "next";
import { auth } from "@lib/redux/reducer";
import { getUser } from "../../server/routes/router";
import { marked } from "marked";

const Upload: React.FC<{ user: AppState["user"] }> = function (props) {
  const [progress, setProgress] = React.useState<number>(0);
  const [response, setResponse] = React.useState<Response>({});
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [front_mage, set_front_image] = React.useState<string>();
  const [back_image, set_back_image] = React.useState<string>();
  const [additional_image, set_additional_image] = React.useState<string[]>([]);

  const frontImageRef = React.useRef<HTMLInputElement>(null);
  const backImageRef = React.useRef<HTMLInputElement>(null);
  const additionalImageRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<FormDataType>();

  const { frontImage, backImage, additionalImage, description } = watch();

  const frontRegister = register("frontImage", { required: true });
  const backRegister = register("backImage", { required: true });
  const additionalRegister = register("additionalImage");

  React.useEffect(() => {
    if (frontImage?.length) displayFileList("frontImage", frontImage);
  }, [frontImage]);

  React.useEffect(() => {
    if (backImage?.length) displayFileList("backImage", backImage);
  }, [backImage]);

  React.useEffect(() => {
    if (additionalImage?.length)
      displayFileList("additionalImage", additionalImage);
  }, [additionalImage]);

  React.useEffect(() => {
    if (props.user) {
      dispatch(auth(props.user));
    } else {
      router.replace("/sign-in").then(() => {
        enqueueSnackbar("You are not authorized to access that page", {
          variant: "error",
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (progress === 100) {
      setResponse({ loading: true, message: "Waiting for response..." });
    }
  }, [progress]);

  const onSubmit = React.useCallback(
    async (data: FormDataType): Promise<void> => {
      try {
        setResponse({ loading: true, message: "Uploading..." });

        let formData: FormData = new FormData();
        let allFormName = Object.keys(data) as [x: keyof FormDataType];

        allFormName.forEach((name) => {
          if (name === "additionalImage") {
            Array.from(data.additionalImage).forEach((file) => {
              formData.append(name, file);
            });
          } else if (data[name] instanceof FileList) {
            formData.append(name, (data[name] as FileList)[0]);
          } else formData.append(name, data[name] as string);
        });
        formData.append("userid", props.user!.id);

        const config = {
          headers: { "content-type": "multipart/form-data" },
          onUploadProgress: (event: any) => {
            setProgress(Math.round((event.loaded * 100) / event.total));
          },
        };

        const request = await axios.post<
          Pick<Response, "success" | "message" | "error">
        >("/api/upload", formData, config);

        let res = await request.data;
        if (res.error) {
          Cookie.remove("session", { path: "/" });
          await router.replace("/sign-in");
          return;
        }

        if (!res.success) throw new Error(res.message);

        setResponse({
          success: res.success,
          message: res.message,
        });

        if (res.success) {
          reset();
          setResponse({});
          setProgress(0);
          set_front_image("");
          set_back_image("");
          set_additional_image([]);
          enqueueSnackbar("Product Uploaded Successfully", {
            variant: "success",
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "center",
            },
          });
        }
      } catch (e: any) {
        setProgress(0);
        setResponse({});
        enqueueSnackbar(e.message, {
          variant: "error",
        });
      } finally {
        setProgress(0);
        setResponse({});
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  );

  // const handleDrop = (ev: React.DragEvent<HTMLDivElement>) => {
  //   ev.preventDefault();
  // };

  // const handleLeaveAndEnter = (ev: React.DragEvent) => {
  //   (ev.target as HTMLInputElement).classList.toggle("active");
  // };

  const displayFileList = (name: keyof FormDataType, files: FileList) => {
    const getBlobUrl = (file: File, cb: (filename: string) => void) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const byteCharacters = window.atob(
          String(
            reader.result!.slice((reader.result as string).indexOf(",") + 1)
          )
        );
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type });
        const filename = URL.createObjectURL(blob);

        return cb(filename);
      };
      reader.readAsDataURL(file);
    };

    let file = files[0];
    switch (name) {
      case "frontImage":
        getBlobUrl(file, (filename: string) => {
          set_front_image(filename);
        });
        break;
      case "backImage":
        getBlobUrl(file, (filename: string) => {
          set_back_image(filename);
        });
        break;
      case "additionalImage":
        (() => {
          let blobUrls: string[] = [];
          for (let i = 0; i < files.length; i++) {
            getBlobUrl(files[i], (filename) => {
              blobUrls.push(filename);
              setTimeout(() => {
                if (i === files.length - 1) {
                  set_additional_image(blobUrls);
                }
              }, 400);
            });
          }
        })();
    }
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setResponse({});
  };

  const data = [
    {
      name: "frontImage",
      label: "Front Image",
      required: true,
      ref: frontImageRef,
      filename: front_mage,
      register: frontRegister,
    },
    {
      name: "backImage",
      label: "Back Image",
      required: true,
      ref: backImageRef,
      register: backRegister,
      filename: back_image,
    },
    {
      name: "additionalImage",
      label: "Additional Image",
      required: false,
      ref: additionalImageRef,
      register: additionalRegister,
      filename: additional_image,
    },
  ];

  return (
    <Container maxWidth={"xl"} sx={{ p: 0 }} className="component-wrap uploader">
      <Box
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
        aria-autocomplete={"none"}
        py={3}
      >
        <Box mb={"2em"} className="form-group">
          <Typography variant={"h6"} color={"primary"} sx={{ fontWeight: 800 }}>
            Upload Product
          </Typography>
        </Box>
        <Box mb={3} className="form-group">
          <Grid container spacing={3} className={"media-content"}>
            {data.map((d, index) => {
              let name = d.name as keyof FormDataType;
              return (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <Box mb={2}>
                    <Typography
                      textAlign={"center"}
                      variant={"subtitle1"}
                      fontWeight={800}
                    >
                      {d.label}
                    </Typography>
                    <input
                      type="file"
                      style={{ display: "none" }}
                      accept={".jpg,.png,.jpeg"}
                      multiple={name === "additionalImage"}
                      {...{
                        ...d.register,
                        ref: (instance) => {
                          d.register.ref(instance);
                          //@ts-ignore
                          d.ref.current = instance;
                        },
                      }}
                      id={name}
                    />
                  </Box>
                  <Box
                    sx={dropStyle}
                    style={{
                      borderColor: errors[name] ? "#d32f2f" : "grey",
                      color: errors[name] ? "#d32f2f" : "inherit",
                      borderRadius: "20px",
                    }}
                    // onDrop={handleDrop}
                    // onDragOver={(e) => e.preventDefault()}
                    // onDragLeave={handleLeaveAndEnter}
                    // onDragEnter={handleLeaveAndEnter}
                    onClick={() => d.ref.current!.click()}
                  >
                    <Typography
                      variant={"subtitle2"}
                      fontWeight={600}
                      className="primary-text"
                    >
                      Drop image
                    </Typography>
                    <Divider sx={{ width: 100 }}>
                      <Typography variant={"caption"} fontWeight={500}>
                        OR
                      </Typography>
                    </Divider>
                    <Typography
                      className="secondary-text"
                      color={errors[name] ? "inherit" : "text.secondary"}
                      variant={"subtitle2"}
                      fontWeight={500}
                    >
                      Click to select image
                    </Typography>
                  </Box>
                  {Boolean(d.filename) && name !== "additionalImage" ? (
                    <Zoom in={true}>
                      <Card>
                        <CardMedia
                          alt={d.name}
                          src={d.filename as string}
                          component={"img"}
                          sx={{
                            maxWidth: "100%",
                          }}
                        />
                      </Card>
                    </Zoom>
                  ) : (
                    name === "additionalImage" && (
                      <Grid spacing={2} container>
                        {additional_image.map((filename) => {
                          return (
                            <Grid key={filename} item xs={6}>
                              <Zoom in={true}>
                                <Card>
                                  <CardMedia
                                    alt={d.name}
                                    src={filename}
                                    component={"img"}
                                    sx={{
                                      maxWidth: "100%",
                                    }}
                                  />
                                </Card>
                              </Zoom>
                            </Grid>
                          );
                        })}
                      </Grid>
                    )
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>
        <Divider sx={{ mb: 4 }}> Product Details </Divider>
        <Box maxWidth={"100%"}>
          <div className="form-group" style={{ marginBottom: "1em" }}></div>
          <Grid
            container
            className="form-group"
            spacing={{ xs: 1.5, sm: 2.5, md: 3 }}
            style={{ marginBottom: "1em" }}
          >
            <Grid item xs={12} md={8}>
              <Grid
                container
                className="form-group"
                spacing={{ xs: 1.5, sm: 2.5, md: 3 }}
                style={{ marginBottom: "1em" }}
              >
                <Grid item xs={12}>
                  <TextField
                    size={"small"}
                    fullWidth
                    label={"Product title"}
                    autoComplete={"off"}
                    autoCorrect={"on"}
                    {...register("title", { required: true })}
                    error={Boolean(errors.title)}
                    helperText={
                      Boolean(errors.title) && "Enter the title of the status"
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    label={"Product price"}
                    size={"small"}
                    autoComplete={"off"}
                    type={"text"}
                    {...register("price", {
                      required: true,
                      onChange: (e) => {
                        let value = parseInt(
                          e.target.value.replaceAll(/\D/g, "")
                        );
                        setValue(
                          "price",
                          isNaN(value) ? "" : String(value.toLocaleString())
                        );
                      },
                      setValueAs: (value) =>
                        isNaN(parseInt(value))
                          ? ""
                          : parseInt(value.replaceAll(/\D/g, "")),
                    })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position={"start"}>
                          <Typography variant={"subtitle1"} fontWeight={700}>
                            #
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    helperText={Boolean(errors.price) && "Enter product price"}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    {...register("discountPercentage", { maxLength: 4 })}
                    label={"Discount"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position={"end"}>
                          <Typography variant={"subtitle1"} fontWeight={800}>
                            %
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    size={"small"}
                    autoComplete={"off"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label={"Stock"}
                    size={"small"}
                    fullWidth
                    {...register("stock", { required: true })}
                    type={"number"}
                    error={Boolean(errors.stock)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={"Brand"}
                    fullWidth
                    size={"small"}
                    {...register("brand", { required: true })}
                    error={Boolean(errors.brand)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={"Category"}
                    fullWidth
                    size={"small"}
                    {...register("category", { required: true })}
                    error={Boolean(errors.category)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={"Description"}
                    autoComplete={"off"}
                    autoCorrect={"true"}
                    {...register("description")}
                    multiline
                    rows={4}
                    helperText={
                      "Enter a brief description of the product you want to upload"
                    }
                  />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(description ?? ""),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className={"form-group sizes"}>
                <TextField
                  fullWidth
                  label={"Sizes"}
                  autoComplete={"off"}
                  autoCorrect={"true"}
                  {...register("sizes")}
                  helperText={"Example 2xl, 3xl"}
                />
              </Box>
              <Box className="colors form-group" mt={2}>
                <TextField
                  fullWidth
                  label={"Colors"}
                  autoComplete={"off"}
                  autoCorrect={"true"}
                  {...register("colors")}
                  helperText={"Example: red, green, voilet"}
                />
              </Box>
            </Grid>
          </Grid>
          <Box className={"action-group"} my={3}>
            <Button
              variant={"outlined"}
              type={"submit"}
              fullWidth
              size={"large"}
              color={"primary"}
              disabled={response.loading}
            >
              {response.loading && (
                <CircularProgress size={20} color={"inherit"} />
              )}
              <Typography
                component={"span"}
                ml={response.loading ? 2 : 0}
                fontWeight={500}
                variant={"subtitle1"}
                textTransform={"none"}
              >
                {response.loading ? response.message : "Submit for review"}
              </Typography>
            </Button>
          </Box>
        </Box>
        <Snackbar
          open={response.loading || response.success !== undefined}
          autoHideDuration={response.success ? 6000 : 60000}
          onClose={handleClose}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              &times;
            </IconButton>
          }
        >
          <Alert
            severity={
              response.success
                ? response.success
                  ? "success"
                  : "error"
                : "info"
            }
          >
            <AlertTitle>{response.message || "Uploading..."}</AlertTitle>
            {!!progress && (
              <Box sx={{ display: "flex", alignItems: "center", width: 250 }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >{`${Math.round(progress)}%`}</Typography>
                </Box>
              </Box>
            )}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req } = ctx;
  // @ts-ignore
  const user = req.session.user ?? null;

  // @ts-ignore
  if (!user || !user.admin) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: true,
      },
    };
  }

  return {
    props: {
      user,
    },
  };
};

export default Upload;

const dropStyle = {
  border: "1px dashed grey",
  borderRadius: "5px",
  width: "100%",
  height: "200px",
  mb: 2,
  display: "grid",
  placeItems: "center",
  placeContent: "center",
  cursor: "pointer",
};

const Colors = [
  "blue",
  "pink",
  "green",
  "yellow",
  "orange",
  "red",
  "white",
  "black",
  "brown",
];

const stringSize = ["xs", "sm", "md", "lg", "xl", "xxl"];
