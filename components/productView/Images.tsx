import React from "react";
// import required modules
// import SwiperType, { FreeMode, Navigation, Thumbs } from "swiper";
import { CardActionArea, CardMedia } from "@mui/material";
import { Image } from "antd";
import { Carousel } from "react-responsive-carousel";

export default function ProductView({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  // const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperType | null>(
  //   null
  // );

  // React.useEffect(() => {
  //   if (thumbsSwiper) {
  //     thumbsSwiper.slideTo(1);
  //   }
  // });

  return (
    <>
      <Carousel
        showArrows={false}
        showStatus={false}
        showThumbs
        swipeable
        emulateTouch
        className="[&_.thumbs]:justify-center [&_.thumbs]:flex [&_.thumb]:rounded-lg"
      >
        {images.map((image, index) => {
          return (
            <div
              key={image}
              className="max-w-full w-[600px] grid place-items-center [&>img]:hidden"
            >
              <div className="bg-white p-2 rounded-lg">
                <Image
                  alt="Pauloxuries banner"
                  rootClassName="max-h-[500px] "
                  className="w-max max-h-[500px]"
                  src={"https://pauloxuries.com/images/products/" + image}
                />
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={alt}
                className="dummy"
                src={"https://pauloxuries.com/images/products/" + image}
              />
            </div>
          );
        })}
      </Carousel>
    </>
  );
}
