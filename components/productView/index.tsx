import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import required modules
import SwiperType, { FreeMode, Navigation, Thumbs } from "swiper";
import { CardActionArea, CardMedia } from "@mui/material";
import { Image } from "antd";

export default function ProductView({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperType | null>(
    null
  );

  React.useEffect(() => {
    if (thumbsSwiper) {
      thumbsSwiper.slideTo(1);
    }
  });

  return (
    <>
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{
          // @ts-ignore
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="swiper h-[400px]"
      >
        {images.map((image, index) => {
          return (
            <SwiperSlide
              key={index}
              style={{
                position: "relative",
              }}
            >
              <div className="max-w-full h-[450px] grid place-items-center overflow-hidden relative">
                <Image
                  alt="Pauloxuries banner"
                  className="max-h-[400px]"
                  src={"https://pauloxuries.com/images/products/" + image}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <Swiper
        onSwiper={(swiper) => setThumbsSwiper(swiper)}
        spaceBetween={0}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="product-view-swiper w-80 h-auto max-w-[80%] my-4"
      >
        {images.map((image, index) => {
          return (
            <SwiperSlide key={index}>
              {() => {
                return (
                  <CardActionArea className="w-max relative">
                    <CardMedia
                      component={"img"}
                      sx={{ height: 50, width: 50 }}
                      alt={alt}
                      className="thumbnail"
                      src={"http://pauloxuries.com/images/products/" + image}
                    />
                  </CardActionArea>
                );
              }}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
}
