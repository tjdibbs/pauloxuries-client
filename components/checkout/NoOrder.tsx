import { Button, Typography } from "@mui/material";
import Link from "next/link";
const NoOrder = (props: { message?: string }) => (
  <div className="card w-full p-4">
    <Typography variant={"subtitle2"} my={2}>
      {props.message ?? "Your request is not valid"}
    </Typography>
    <Link href={"/collections"}>
      <Button
        variant={"contained"}
        className="bg-primary-low"
        sx={{ textTransform: "none" }}
      >
        Go to shop
      </Button>
    </Link>
  </div>
);

export default NoOrder;
