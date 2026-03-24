import { Image, ImageProps, Platform } from "react-native";

interface PixelImageProps extends Omit<ImageProps, "style"> {
  size?: number;
  width?: number;
  height?: number;
  scale?: number;
  style?: ImageProps["style"];
}

export function PixelImage({
  size,
  width,
  height,
  scale = 1,
  style,
  ...rest
}: PixelImageProps) {
  const s = Math.round(scale);
  const w = (width ?? size ?? 32) * s;
  const h = (height ?? size ?? 32) * s;

  return (
    <Image
      style={[
        {
          width: w,
          height: h,
          ...Platform.select({
            web: { imageRendering: "pixelated" as any },
          }),
        },
        style,
      ]}
      resizeMode="stretch"
      {...rest}
    />
  );
}
