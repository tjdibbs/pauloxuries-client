import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import useStyles from "@lib/styles";
import { Product } from "@lib/types";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import IconButton from "@mui/material/IconButton";
import DeleteForever from "@mui/icons-material/DeleteForever";
import Edit from "@mui/icons-material/Edit";
import useShop from "@hook/useShop";
import { useAppSelector } from "@lib/redux/store";

type Props = {
  item: Product;
};

export default function ProductCard({ item }: Props) {
  const user = useAppSelector((state) => state.shop.user);
  const { editProduct, deleteProduct } = useShop(item);

  const styles = useStyles();

  return (
    <Card elevation={0} className={styles.cardArrival}>
      <div className="max-xs:h-[200px] h-[250px] md:h-[330px] relative">
        {" "}
        {/* show if user is admin to call action on the product */}
        {user?.admin && (
          <div className="product-higher-actions absolute left-0 top-0 z-20 flex flex-col gap-y-2 bg-black/10 rounded-lg p-2">
            <IconButton size="small" onClickCapture={editProduct}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClickCapture={deleteProduct}>
              <DeleteForever fontSize="small" />
            </IconButton>
          </div>
        )}
        <Image
          src={
            "http://pauloxuries.com/images/products/" +
            item.image?.replaceAll('"', "")
          }
          loading="lazy"
          alt={item.title}
          fill
          sizes="(max-width: 528px) 250px, (max-width: 768px) 330px"
          className={`w-full object-fill  pointer-events-none`}
        />
      </div>
      <CardContent className="content">
        <div className="product-title text-sm font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
          {item.title}
        </div>
        {item.discountPercentage ? (
          <Stack alignItems={"center"} direction={"row"} gap={2}>
            <Typography
              variant="subtitle2"
              color="lightgrey"
              sx={{ textDecoration: "line-through" }}
            >
              ₦{item.price.toLocaleString("en")}
            </Typography>
            <b style={{ color: "#fff", fontWeight: 600 }}>-</b>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={pink["A100"]}
            >
              <b style={{ fontSize: "1.1em" }}>₦</b>
              {Math.floor(
                (item.price as number) -
                  ((item.price as number) * item.discountPercentage) / 100
              ).toLocaleString("en")}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="subtitle2" fontWeight={800} color={pink["A100"]}>
            <b style={{ fontSize: "1.17em" }}>₦</b>
            {item.price.toLocaleString("en")}
          </Typography>
        )}
        <Link href={"/products?p=" + item.title + "&id=" + item.id}>
          <Button
            size={"small"}
            sx={{ borderRadius: 0, mt: 2 }}
            variant="outlined"
            color="inherit"
          >
            View
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
