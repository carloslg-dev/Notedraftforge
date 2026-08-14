import { Extension } from '@tiptap/core';
import { randomUUID } from '../../../domain/uuid';

export const BlockIdExtension = Extension.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote'],
        attributes: {
          id: {
            default: () => randomUUID(),
            keepOnSplit: false,
            parseHTML: element => element.dataset.id,
            renderHTML: attributes => {
              if (!attributes.id) {
                return {};
              }
              return {
                'data-id': attributes.id,
              };
            },
          },
        },
      },
    ];
  },
});
