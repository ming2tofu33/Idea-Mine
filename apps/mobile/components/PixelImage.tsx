import { Image, ImageProps, Platform } from "react-native";

interface PixelImageProps extends Omit<ImageProps, "style"> {
  size: number;
  scale?: number;
  style?: ImageProps["style"];
}

export function PixelImage({
  size,
  scale = 1,
  style,
  ...rest
}: PixelImageProps) {
  const rendered = size * Math.round(scale);

  return (
    <Image
      style={[
        {
          width: rendered,
          height: rendered,
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
