import { cn } from '@/lib/utils';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorToolbar from './toolbar/editor-toolbar';

interface EditorProps {
  className?: string;
  content: string;
  name?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
}

const Editor = ({ className, content, name, onBlur, onChange, placeholder }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, Highlight, Typography],
    content: content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onBlur({ editor }) {
      onBlur?.(editor.getHTML());
    },
  });

  if (!editor) return <></>;

  return (
    <div className="prose border-input bg-background dark:prose-invert mt-2 w-full max-w-none rounded-sm border">
      <EditorToolbar editor={editor} />
      <div className={cn('editor', className)}>
        <EditorContent name={name} editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
};

export default Editor;
