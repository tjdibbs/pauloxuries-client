import React from "react";

import { Image } from "antd";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import NextImage from "next/image";

export default function ProductView({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = React.useState<number>(0);
  const [visible, setVisible] = React.useState(false);
  const splideRef = React.useRef<Splide>(null);

  return (
    <>
      <Splide
        ref={splideRef}
        onMoved={(_, index: number) => setActive(index)}
        options={{ pagination: false }}
        className="[&_.thumbs]:justify-center [&_.thumbs]:flex [&_.thumb]:rounded-lg [&_.slide]:!pointer-events-auto"
      >
        {images.map((image, index) => {
          return (
            <SplideSlide key={image}>
              <div className="max-w-full w-[600px] grid place-items-center [&>img]:hidden">
                <div className="bg-white p-2 rounded-lg">
                  <Image
                    onClick={() => setVisible(true)}
                    preview={{ visible: false }}
                    alt="Pauloxuries banner"
                    loading="lazy"
                    rootClassName="max-h-[500px] "
                    className="w-max max-h-[500px] pointer-events-auto"
                    src={"https://pauloxuries.com/images/products/" + image}
                  />
                </div>
              </div>
            </SplideSlide>
          );
        })}
      </Splide>
      <div style={{ display: "none" }}>
        <Image.PreviewGroup
          preview={{
            visible,
            onVisibleChange: (vis) => setVisible(vis),
            animation: true,
            current: active,
          }}
        >
          {images.map((image) => (
            <Image
              key={image}
              alt="Pauloxuries banner"
              src={"https://pauloxuries.com/images/products/" + image}
            />
          ))}
        </Image.PreviewGroup>
      </div>
      <div className="thumbs flex justify-center mt-5">
        {images.map((image, i) => {
          return (
            <div
              key={image}
              className={
                "p-2 rounded-lg relative cursor-pointer transition-all" +
                (i !== active ? " brightness-100" : " brightness-50")
              }
              onClick={() => {
                splideRef.current?.go(i);
                setActive(i);
              }}
            >
              <NextImage
                alt="Pauloxuries banner"
                height={80}
                width={60}
                loading="lazy"
                className="rounded-lg shadow-lg ring-2 ring-gray-500"
                src={"https://pauloxuries.com/images/products/" + image}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
