"use client";

import React, { useCallback } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Indent, Outdent } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const execCommand = (command: string) => {
    document.execCommand(command, false);
};

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  }, [onChange]);

  return (
    <div className={cn("rounded-md border border-input ring-offset-background", className)}>
      <div className="p-2 border-b flex items-center gap-2 flex-wrap">
        <ToggleGroup type="multiple" size="sm">
          <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => execCommand('bold')}>
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => execCommand('italic')}>
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => execCommand('underline')}>
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Separator orientation="vertical" className="h-6" />
        <ToggleGroup type="multiple" size="sm">
           <ToggleGroupItem value="ul" aria-label="Bulleted List" onClick={() => execCommand('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </ToggleGroupItem>
           <ToggleGroupItem value="ol" aria-label="Numbered List" onClick={() => execCommand('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </ToggleGroupItem>
           <ToggleGroupItem value="indent" aria-label="Indent" onClick={() => execCommand('indent')}>
            <Indent className="h-4 w-4" />
          </ToggleGroupItem>
           <ToggleGroupItem value="outdent" aria-label="Outdent" onClick={() => execCommand('outdent')}>
            <Outdent className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[200px] w-full rounded-b-md bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        data-placeholder={placeholder}
        style={{
          ...(!value && {
            '--placeholder-text': `"${placeholder}"`
          }) as React.CSSProperties
        }}
        // Basic placeholder support for contentEditable
        suppressContentEditableWarning={true}
      />
      <style jsx>{`
        [contentEditable][data-placeholder]:empty:before {
          content: var(--placeholder-text);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export { RichTextEditor };
