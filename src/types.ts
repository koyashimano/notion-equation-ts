import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export const TEXT_BLOCK_TYPE_NAMES = [
  "paragraph",
  "numbered_list_item",
  "bulleted_list_item",
  "callout",
  "heading_1",
  "heading_2",
  "heading_3",
  "quote",
  "to_do",
  "toggle",
] as const;

export type TextBlockType = (typeof TEXT_BLOCK_TYPE_NAMES)[number];

export type TextBlock = Extract<BlockObjectResponse, { type: TextBlockType }>;

export type RequestTextBlock =
  | Partial<TextBlock>
  | {
      type: "equation";
      equation: { expression: string };
      parent:
        | {
            type: "page_id";
            page_id: string;
          }
        | {
            type: "block_id";
            block_id: string;
          };
      object: "block";
    };

export function isTextBlock(block: BlockObjectResponse): block is TextBlock {
  return TEXT_BLOCK_TYPE_NAMES.includes(block.type as TextBlockType);
}

export type ParentType =
  | {
      type: "page_id";
      page_id: string;
    }
  | {
      type: "block_id";
      block_id: string;
    };
