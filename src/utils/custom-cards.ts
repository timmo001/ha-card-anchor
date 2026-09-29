import { repository } from "../../package.json";

interface RegisterCardParams {
  type: string;
  name: string;
  description: string;
}

declare global {
  interface Window {
    customCards?: unknown[];
  }
}

export function registerCustomCard(params: RegisterCardParams) {
  window.customCards = window.customCards || [];

  const cardPage = params.type.replace("-card", "");
  window.customCards.push({
    ...params,
    preview: true,
    documentationURL: `${repository.url}/blob/main/docs/cards/${cardPage}.md`,
  });
}
