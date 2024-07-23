import { Container } from "@/components/ui/container";
import { Slider } from "@/components/ui/slider";
import * as RadioGroup from "@radix-ui/react-radio-group";
import Color from "color";
import DeltaE from "delta-e";
import { round, sortBy } from "lodash-es";
import * as hclust from "ml-hclust";
import { useEffect, useState } from "react";
import { useUrlSearchParams } from "use-url-search-params";

const getLab = (color) => {
  const c = Color(color);
  return {
    L: c.l(),
    A: c.a(),
    B: c.b(),
  };
};

const computeDeltaE = (color1, color2) => {
  const c1 = getLab(color1);
  const c2 = getLab(color2);
  return DeltaE.getDeltaE00(c1, c2);
};

const computeDeltaEMatrix = (colors) => {
  const results = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const deltaE = computeDeltaE(colors[i], colors[j]);
      results.push([colors[i], colors[j], deltaE]);
    }
  }
  return results;
};

const getClusters = (colors, threshold) => {
  // Create a distance matrix using deltaE
  const distanceMatrix = colors.map((color1, index1) =>
    colors.map((color2, index2) =>
      index1 === index2 ? 0 : computeDeltaE(color1, color2)
    )
  );

  // Apply hierarchical clustering
  const tree = hclust.agnes(distanceMatrix, {
    method: "complete",
    isDistanceMatrix: true,
  });

  // Cut the tree to obtain clusters (adjust threshold or number of clusters as needed)
  const clusters = tree.cut(threshold); // Adjust height as needed

  // Get colors from clusters
  const getColorsFromCluster = (cluster) => {
    return cluster.isLeaf
      ? [colors[cluster.index]]
      : cluster.children.map(getColorsFromCluster).flat();
  };
  const clusteredColors = clusters.map(getColorsFromCluster);

  return clusteredColors;
};

export const DeltaEDemo = ({ colors, imageUrl }) => {
  const [{ t: threshold }, setThreshold] = useUrlSearchParams(
    { t: 10 },
    { t: Number }
  );

  const clusters = getClusters(colors, threshold);

  const uniqueColors = clusters.map((cluster) => {
    if (cluster.length === 1) return cluster[0];
    else return sortBy(cluster, (c) => Color(c).hue())[0];
  });

  const [bg, setBg] = useState();
  useEffect(() => {
    if (uniqueColors.includes(bg)) return;
    setBg(uniqueColors[0]);
  }, [uniqueColors, bg]);

  return (
    <Container>
      <h3>Approach #1: Eliminating similar colors using DeltaE</h3>
      <p>
        ΔE - (Delta E, dE) The measure of change in visual perception of two
        given colors.
      </p>
      <div className="flex flex-wrap text-sm">
        {sortBy(computeDeltaEMatrix(colors), [2]).map(([c1, c2, deltaE]) => {
          return (
            <div
              key={`${c1}minus${c2}`}
              className="flex flex-row gap-2 my-1 basis-1/3 items-center"
            >
              <div
                className="w-10 h-10 text-[6px] rounded-md flex justify-center items-center"
                style={{
                  backgroundColor: c1,
                  color: Color(c1).isLight() ? "black" : "white",
                }}
              >
                {c1}
              </div>
              <div
                className="w-10 h-10 text-[6px] rounded-md flex justify-center items-center"
                style={{
                  backgroundColor: c2,
                  color: Color(c2).isLight() ? "black" : "white",
                }}
              >
                {c2}
              </div>
              <div className="font-medium text-xs font-mono">
                ΔE = {round(deltaE, 2)}
              </div>
            </div>
          );
        })}
      </div>
      <p>
        A clustering algorithm can be usedto group similar colors based on their
        DeltaE values. Heirarchial clustering is used here, but there are other
        clustering algorithms that work too.
      </p>
      <div className="flex flex-col gap-2">
        {clusters.map((cluster, index) => (
          <div key={index} className="flex flex-row items-center gap-2">
            {cluster.map((color) => (
              <div
                key={`cluster-${index}-${color}`}
                className="w-[50px] h-[50px] rounded-md text-[8px] flex justify-center items-center"
                style={{
                  backgroundColor: color,
                  color: Color(color).isLight() ? "black" : "white",
                }}
              >
                {color}
              </div>
            ))}
            <div className="text-xs font-medium font-mono">
              Group {index + 1}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 mb-4 flex flex-col">
        <p className="text-sm">
          Threshold: <span className="font-medium">{threshold}</span>
        </p>
        <Slider
          className="w-1/2"
          value={[threshold]}
          onValueChange={([value]) => setThreshold({ t: value })}
          min={5}
          max={50}
          step={1}
        />
      </div>
      <p>
        From each of these clusters, a single color can be selected that works
        well as a background.
      </p>
      <div className="flex flex-row gap-3">
        <div
          style={{
            backgroundColor: bg,
          }}
          className="w-1/2 relative border border-slate-100 rounded-md flex justify-center items-center px-4"
        >
          <img
            src={imageUrl}
            className="w-full h-auto object-contain rounded-sm"
          />
        </div>

        <div className="flex grow flex-col gap-2">
          <div className="font-light text-sm">
            Click to apply background color 🎨
          </div>
          <RadioGroup.Root
            value={bg}
            onValueChange={setBg}
            className="grid grid-cols-4 gap-3 h-fit"
          >
            {uniqueColors?.map((c) => {
              const isLight = Color(c).isLight();
              return (
                <RadioGroup.Item
                  key={`unique-bg-${c}`}
                  value={c}
                  id={c}
                  asChild
                >
                  <div
                    className="aspect-square rounded-md relative cursor-pointer"
                    style={{
                      backgroundColor: c,
                      color: isLight ? "black" : "white",
                    }}
                  >
                    <span className="absolute bottom-1 left-2 text-[8px]">
                      {c}
                    </span>
                  </div>
                </RadioGroup.Item>
              );
            })}
          </RadioGroup.Root>
        </div>
      </div>
    </Container>
  );
};
