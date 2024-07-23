import { Container } from "@/components/ui/container";
import Color from "color";

export const Quantised = ({ colors, imageUrl }) => {
  return (
    <Container>
      <h3>Quantized colors from the primary image</h3>
      <p>
        Quantization helps with compressing a range of values to a single
        discrete value. We can generate a fixed number of colors using a
        quantization algorithm to create a palette based on the image.{" "}
        <a
          className="font-light"
          href="https://en.wikipedia.org/wiki/Color_quantization"
        >
          read more
        </a>
      </p>

      <div className="flex flex-row gap-3 items-center">
        <div className="w-1/2 relative border border-slate-100 rounded-md flex justify-center items-center">
          <div className="absolute bg-[url(/grid.svg)] inset-0 bg-repeat bg-left pointer-events-none" />
          <img src={imageUrl} className="w-full h-auto object-contain" />
        </div>
        <div className="grow grid grid-cols-4 gap-3 h-fit">
          {colors?.map((c) => {
            const isLight = Color(c).isLight();
            return (
              <div
                key={`original-${c}`}
                className="aspect-square rounded-md relative"
                style={{
                  backgroundColor: c,
                  color: isLight ? "black" : "white",
                }}
              >
                <span className="absolute bottom-1 left-2 text-[8px]">{c}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
};
