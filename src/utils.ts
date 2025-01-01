import { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import * as util from "node:util";

import { RequestTextBlock, TextBlock } from "./types";

export function getPageId() {
  const { values } = util.parseArgs({ options: { url: { type: "string" } } });
  const url = values.url;
  if (!url) {
    console.error("url is required");
    process.exit(1);
  }

  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split("/");
  const lastPart = pathParts[pathParts.length - 1] || "";
  return lastPart.slice(-32);
}

export function getAuthToken() {
  const token = process.env.NOTION_AUTH_TOKEN;
  if (!token) {
    console.error("NOTION_AUTH_TOKEN is required");
    process.exit(1);
  }
  return token;
}

export function getRichTexts(block: RequestTextBlock): RichTextItemResponse[] {
  switch (block.type) {
    case "paragraph":
      return block.paragraph?.rich_text ?? [];
    case "numbered_list_item":
      return block.numbered_list_item?.rich_text ?? [];
    case "bulleted_list_item":
      return block.bulleted_list_item?.rich_text ?? [];
    case "callout":
      return block.callout?.rich_text ?? [];
    case "heading_1":
      return block.heading_1?.rich_text ?? [];
    case "heading_2":
      return block.heading_2?.rich_text ?? [];
    case "heading_3":
      return block.heading_3?.rich_text ?? [];
    case "quote":
      return block.quote?.rich_text ?? [];
    case "to_do":
      return block.to_do?.rich_text ?? [];
    case "toggle":
      return block.toggle?.rich_text ?? [];
    default:
      return [];
  }
}
