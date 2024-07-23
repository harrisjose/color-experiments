import { DeltaEDemo } from "@/components/pages/delta-e";
import { Quantised } from "@/components/pages/quantised";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import mql from "@microlink/mql";
import { isEmpty, uniq } from "lodash-es";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useUrlSearchParams } from "use-url-search-params";

const fetchMetadata = async (url) => {
  try {
    const { data } = await mql(url, { palette: true });
    return {
      imageUrl: data?.image?.url,
      colors: uniq(data?.image?.palette ?? []),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

function App() {
  const [{ q: fetchUrl }, setFetchUrl] = useUrlSearchParams({
    q: "https://daylightcomputer.com/",
  });

  const [input, setInput] = useState("");
  useEffect(() => {
    setInput(fetchUrl);
  }, [fetchUrl]);

  const {
    data: { imageUrl, colors } = {},
    error,
    isLoading,
  } = useQuery(["metadata", fetchUrl], () => fetchMetadata(fetchUrl), {
    enabled: !isEmpty(fetchUrl),
  });

  const handleFetch = () => {
    setFetchUrl({ q: input });
  };

  if (error) return "An error has occurred: " + error.message;

  return (
    <>
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-top [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
      <Container>
        <div className="flex gap-4">
          <Input
            type="url"
            placeholder="Enter URL"
            className="form-input w-300 bg-white grow"
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button onClick={handleFetch} disabled={isLoading}>
            {isLoading ? "Loading" : "Get palette"}
          </Button>
        </div>
      </Container>
      {isEmpty(colors) ? (
        <></>
      ) : (
        <>
          <Quantised colors={colors} imageUrl={imageUrl} />
          <DeltaEDemo colors={colors} imageUrl={imageUrl} />
        </>
      )}
    </>
  );
}

export default App;
