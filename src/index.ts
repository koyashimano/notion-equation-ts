#!/usr/bin/env node

import { Client, iteratePaginatedAPI } from "@notionhq/client";
import {
  AppendBlockChildrenParameters,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import path from "path";

import {
  ParentType,
  RequestTextBlock,
  TextBlock,
  TextBlockType,
  isTextBlock,
} from "./types";
import { getAuthToken, getPageId, getRichTexts } from "./utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function convertEquationsInRichTexts(
  richTexts: RichTextItemResponse[],
  blockType: TextBlockType,
  parent: ParentType
): [RichTextItemResponse[], RequestTextBlock[], boolean] {
  const newRichTexts: RichTextItemResponse[] = [];
  const newBlocks: RequestTextBlock[] = [];
  let changed = false;
  richTexts.forEach((richText) => {
    const addRichText = (richText: RichTextItemResponse) => {
      if (newBlocks.length === 0) {
        newRichTexts.push(richText);
        return;
      }
      const lastBlock = newBlocks.at(-1);
      if (lastBlock && lastBlock.type === blockType) {
        getRichTexts(lastBlock).push(richText);
        return;
      }
      newBlocks.push({
        type: blockType,
        [blockType]: { rich_text: [richText] },
        parent: parent,
        object: "block",
      });
    };

    if (richText.type !== "text" || !/\$[^$]+\$/.test(richText.text.content)) {
      addRichText(richText);
      return;
    }

    changed = true;
    richText.text.content
      .split(/(\$\$[^$]+\$\$)|(\$[^$]+\$)/)
      .forEach((text) => {
        if (!text) {
          return;
        }
        if (text.length > 4 && text.startsWith("$$") && text.endsWith("$$")) {
          newBlocks.push({
            type: "equation",
            equation: {
              expression: text.slice(2, -2),
            },
            parent: parent,
            object: "block",
          });
        } else if (
          text.length > 2 &&
          text.startsWith("$") &&
          text.endsWith("$")
        ) {
          addRichText({
            type: "equation",
            equation: {
              expression: text.slice(1, -1),
            },
            plain_text: text.slice(1, -1),
            annotations: richText.annotations,
            href: richText.href,
          });
        } else {
          addRichText({
            type: "text",
            text: {
              content: text,
              link: richText.text.link,
            },
            plain_text: text,
            annotations: richText.annotations,
            href: richText.href,
          });
        }
      });
  });
  return [newRichTexts, newBlocks, changed];
}

async function processBlock(
  block: TextBlock,
  parentId: string,
  notion: Client
) {
  const richTexts = getRichTexts(block);
  const [newRichTexts, newBlocks, changed] = convertEquationsInRichTexts(
    richTexts,
    block.type,
    { type: "block_id", block_id: parentId }
  );
  if (changed) {
    if (newRichTexts.length > 0) {
      await notion.blocks.update({
        block_id: block.id,
        [block.type]: { rich_text: newRichTexts },
      });
      console.info(`Updated block ${block.id}.`);
    }
    if (newBlocks.length > 0) {
      await notion.blocks.children.append({
        block_id: parentId,
        children: newBlocks as AppendBlockChildrenParameters["children"],
        after: block.id,
      });
      console.info(`Appended blocks to ${parentId}.`);
      if (newRichTexts.length === 0) {
        await notion.blocks.delete({ block_id: block.id });
        console.info(`Deleted block ${block.id}.`);
      }
    }
  }
}

async function handleBlocks(parentId: string, notion: Client) {
  for await (const block of iteratePaginatedAPI(notion.blocks.children.list, {
    block_id: parentId,
  })) {
    if (!("type" in block)) continue;
    if (isTextBlock(block)) {
      await processBlock(block, parentId, notion);
    }
    if (block.has_children) {
      await handleBlocks(block.id, notion);
    }
  }
}

function main() {
  const notion = new Client({ auth: getAuthToken() });
  const pageId = getPageId();
  void handleBlocks(pageId, notion);
}

main();
