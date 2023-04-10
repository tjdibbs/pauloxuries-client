import React from "react";
import { Box, Breadcrumbs, Chip, Typography } from "@mui/material";
import ArrowForwardIosRounded from "@mui/icons-material/ArrowForwardIosRounded";
import Link from "next/link";
import { useRouter } from "next/router";

function BreadcrumbComp(props: {
  links: { path?: string; label: string; disabled?: boolean }[];
}) {
  const router = useRouter();

  return (
    <Box className={"breadcrumbs-wrapper"} my={3}>
      <Breadcrumbs
        maxItems={3}
        classes={{
          ol: "flex-nowrap min-w-max max-sm:py-1",
        }}
        separator={<ArrowForwardIosRounded sx={{ fontSize: 11 }} />}
      >
        {props.links.map((link, index, links) => {
          if (index === links.length - 1)
            return (
              <span
                className="capitalize max-w-[120px] block whitespace-nowrap overflow-hidden text-ellipsis font-semibold bg-primary-low text-white rounded-full text-xs py-1.5 px-3"
                key={link.label}
              >
                {link.label}
              </span>
            );

          return (
            <Chip
              key={link.label}
              className="capitalize text-xs font-semibold bg-primary-low/10"
              size="small"
              disabled={link.disabled}
              onClick={() => router.push(link.path ?? "")}
              label={link.label}
            />
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}

export default BreadcrumbComp;
