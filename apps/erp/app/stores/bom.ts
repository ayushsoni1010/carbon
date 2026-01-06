import { useUrlParams } from "~/hooks";

const PARAM_KEY = "material_id";

export const useBom = () => {
  const [params, setParams] = useUrlParams();

  const id = params.get(PARAM_KEY);

  const setId = (id: string | null) => {
    setParams({
      [PARAM_KEY]: id || undefined
    });
  };

  return [id, setId] as const;
};
