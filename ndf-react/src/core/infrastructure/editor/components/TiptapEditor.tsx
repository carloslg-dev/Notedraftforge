import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { BlockIdExtension } from '../extensions/block-id';
import { domainToTiptap, tiptapToDomain } from '../mappers/tiptap-mapper';
import { PieceContent } from '../../../domain/types/';
import { Button } from '@/ui/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';

interface TiptapEditorProps {
  initialContent: PieceContent;
  onUpdate: (content: PieceContent) => void;
}

export function TiptapEditor({ initialContent, onUpdate }: Readonly<TiptapEditorProps>) {
  const originalKind = initialContent.kind === 'song' ? 'text' : initialContent.kind;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false }),
      Underline,
      BlockIdExtension,
    ],
    content: domainToTiptap(initialContent),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const newDomainContent = tiptapToDomain(json, originalKind);
      onUpdate(newDomainContent);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none min-h-[200px]',
      },
    },
  });

  const [selectionEpoch, setSelectionEpoch] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const forceUpdate = () => {
      setSelectionEpoch((prev) => prev + 1);
    };
    editor.on('selectionUpdate', forceUpdate);
    editor.on('transaction', forceUpdate);
    return () => {
      editor.off('selectionUpdate', forceUpdate);
      editor.off('transaction', forceUpdate);
    };
  }, [editor]);

  const getMenuButtonProps = (action: () => void) => {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
      },
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        action();
      }
    };
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 w-full items-start" data-selection-epoch={selectionEpoch}>
      {/* Editor Content Area */}
      <div className="flex-grow min-h-[250px] max-w-[calc(100%-44px)] overflow-x-hidden p-0">
        <EditorContent editor={editor} />
      </div>

      {/* Mini Static Side Toolbar on the right */}
      <div className="flex flex-col gap-1 p-1 bg-white border border-[#e8eaed] rounded-lg shadow-sm shrink-0 w-9 items-center sticky top-2">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          {...getMenuButtonProps(() => editor.chain().focus().toggleBold().run())}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          {...getMenuButtonProps(() => editor.chain().focus().toggleItalic().run())}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          {...getMenuButtonProps(() => editor.chain().focus().toggleUnderline().run())}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('underline') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
