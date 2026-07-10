import {
  Component,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  forwardRef,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {Table, TableRow, TableHeader, TableCell} from '@tiptap/extension-table';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rich-text-editor-container">
      <!-- Toolbar at Top -->
      <div class="editor-toolbar">
          <!-- Text Formatting -->
          <button
            type="button"
            (click)="toggleBold()"
            [class.active]="editor?.isActive('bold')"
            title="Bold (Ctrl+B)"
            class="menu-button">
            <strong>B</strong>
          </button>
          <button
            type="button"
            (click)="toggleItalic()"
            [class.active]="editor?.isActive('italic')"
            title="Italic (Ctrl+I)"
            class="menu-button">
            <em>I</em>
          </button>
          <button
            type="button"
            (click)="toggleStrike()"
            [class.active]="editor?.isActive('strike')"
            title="Strikethrough"
            class="menu-button">
            <s>S</s>
          </button>
          <button
            type="button"
            (click)="toggleCode()"
            [class.active]="editor?.isActive('code')"
            title="Code"
            class="menu-button">
            &lt;/&gt;
          </button>

          <div class="menu-divider"></div>

          <!-- Headings -->
          <button
            type="button"
            (click)="setHeading(1)"
            [class.active]="editor?.isActive('heading', { level: 1 })"
            title="Heading 1"
            class="menu-button">
            H1
          </button>
          <button
            type="button"
            (click)="setHeading(2)"
            [class.active]="editor?.isActive('heading', { level: 2 })"
            title="Heading 2"
            class="menu-button">
            H2
          </button>
          <button
            type="button"
            (click)="setHeading(3)"
            [class.active]="editor?.isActive('heading', { level: 3 })"
            title="Heading 3"
            class="menu-button">
            H3
          </button>

          <div class="menu-divider"></div>

          <!-- Lists -->
          <button
            type="button"
            (click)="toggleBulletList()"
            [class.active]="editor?.isActive('bulletList')"
            title="Bullet List"
            class="menu-button">
            ●●●
          </button>
          <button
            type="button"
            (click)="toggleOrderedList()"
            [class.active]="editor?.isActive('orderedList')"
            title="Ordered List"
            class="menu-button">
            123
          </button>

          <div class="menu-divider"></div>

          <!-- Other Blocks -->
          <button
            type="button"
            (click)="toggleCodeBlock()"
            [class.active]="editor?.isActive('codeBlock')"
            title="Code Block"
            class="menu-button">
            Code
          </button>
          <button
            type="button"
            (click)="toggleBlockquote()"
            [class.active]="editor?.isActive('blockquote')"
            title="Blockquote"
            class="menu-button">
            ❝
          </button>
          <button
            type="button"
            (click)="setHorizontalRule()"
            title="Horizontal Rule"
            class="menu-button">
            —
          </button>

          <div class="menu-divider"></div>

          <!-- Sup/Sub -->
          <button
            type="button"
            (click)="toggleSubscript()"
            [class.active]="editor?.isActive('subscript')"
            title="Subscript"
            class="menu-button">
            x<sub>2</sub>
          </button>
          <button
            type="button"
            (click)="toggleSuperscript()"
            [class.active]="editor?.isActive('superscript')"
            title="Superscript"
            class="menu-button">
            x<sup>2</sup>
          </button>

          <div class="menu-divider"></div>

          <!-- Table -->
          <button
            type="button"
            (click)="insertTable()"
            title="Insert Table"
            class="menu-button">
            ⊞
          </button>

          <div class="menu-divider"></div>

          <!-- Undo/Redo -->
          <button
            type="button"
            (click)="undo()"
            [disabled]="!canUndo()"
            title="Undo"
            class="menu-button">
            ↶
          </button>
          <button
            type="button"
            (click)="redo()"
            [disabled]="!canRedo()"
            title="Redo"
            class="menu-button">
            ↷
          </button>
        </div>
        <!-- Editor -->
        <div #editorContainer class="editor-wrapper"></div>
      </div>

  `,
  styles: [`
    .rich-text-editor-container {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .editor-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      align-items: center;
    }

    .bubble-menu-content {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .editor-wrapper {
      min-height: 300px;
      padding: 1rem;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      flex: 1;
      overflow-y: auto;
    }

    :deep(.ProseMirror) {
      outline: none;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.5;
      color: #1f2937;
    }

    :deep(.ProseMirror:focus) {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    :deep(.ProseMirror p) {
      margin: 1rem 0;
    }

    :deep(.ProseMirror h1) {
      font-size: 2em;
      margin: 1rem 0 0.5rem 0;
      font-weight: 600;
      line-height: 1.2;
    }

    :deep(.ProseMirror h2) {
      font-size: 1.5em;
      margin: 1rem 0 0.5rem 0;
      font-weight: 600;
      line-height: 1.2;
    }

    :deep(.ProseMirror h3) {
      font-size: 1.17em;
      margin: 1rem 0 0.5rem 0;
      font-weight: 600;
      line-height: 1.2;
    }

    :deep(.ProseMirror ul),
    :deep(.ProseMirror ol) {
      padding-left: 2rem;
      margin: 1rem 0;
    }

    :deep(.ProseMirror li) {
      margin: 0.5rem 0;
    }

    :deep(.ProseMirror code) {
      background: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: monospace;
      font-size: 0.9em;
    }

    :deep(.ProseMirror pre) {
      background: #1f2937;
      color: #f3f4f6;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
      font-family: monospace;
      font-size: 0.9em;
    }

    :deep(.ProseMirror pre code) {
      background: none;
      color: inherit;
      padding: 0;
    }

    :deep(.ProseMirror blockquote) {
      border-left: 3px solid #3b82f6;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #6b7280;
      font-style: italic;
    }

    :deep(.ProseMirror hr) {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2rem 0;
    }

    :deep(.ProseMirror table) {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }

    :deep(.ProseMirror th),
    :deep(.ProseMirror td) {
      border: 1px solid #e5e7eb;
      padding: 0.5rem;
      text-align: left;
    }

    :deep(.ProseMirror th) {
      background: #f9fafb;
      font-weight: 600;
    }

    :deep(.ProseMirror tr:hover) {
      background: #f9fafb;
    }

    .bubble-menu {
      display: none;
    }

    .menu-button {
      padding: 0.4rem 0.6rem;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      transition: all 0.15s ease-in-out;
      min-width: 2.25rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .menu-button:hover:not(:disabled) {
      background: #f3f4f6;
      border-color: #3b82f6;
    }

    .menu-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-button.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .menu-divider {
      width: 1px;
      height: 1.5rem;
      background: #e5e7eb;
      margin: 0 0.25rem;
    }
  `]
})
export class RichTextEditorComponent implements AfterViewInit, ControlValueAccessor, OnDestroy {
  @Input() content: string = '';
  @Input() disabled: boolean = false;
  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;

  editor: Editor | null = null;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit() {
    this.initializeEditor();
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private initializeEditor() {
    if (!this.editorContainer) {
      console.error('Editor container not found');
      return;
    }

    this.editor = new Editor({
      element: this.editorContainer.nativeElement,
      extensions: [
        StarterKit,
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        Subscript,
        Superscript
      ],
      content: this.content || '<p></p>',
      editorProps: {
        attributes: {
          class: 'prose max-w-none focus:outline-none'
        }
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.contentChange.emit(html);
        this.onChange(html);
      },
      onBlur: () => {
        this.onTouched();
      }
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    if (value && this.editor) {
      this.editor?.chain().setContent(value).run();
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.editor) {
      this.editor.setEditable(!isDisabled);
    }
  }

  // Toolbar commands
  toggleBold() {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic() {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleStrike() {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleCode() {
    this.editor?.chain().focus().toggleCode().run();
  }

  setHeading(level: number) {
    this.editor?.chain().focus().setHeading({ level: level as any }).run();
  }

  toggleBulletList() {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList() {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  toggleCodeBlock() {
    this.editor?.chain().focus().toggleCodeBlock().run();
  }

  toggleBlockquote() {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  setHorizontalRule() {
    this.editor?.chain().focus().setHorizontalRule().run();
  }

  toggleSubscript() {
    this.editor?.chain().focus().toggleSubscript().run();
  }

  toggleSuperscript() {
    this.editor?.chain().focus().toggleSuperscript().run();
  }

  insertTable() {
    this.editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  undo() {
    this.editor?.chain().focus().undo().run();
  }

  redo() {
    this.editor?.chain().focus().redo().run();
  }

  canUndo(): boolean {
    return this.editor?.can().undo() ?? false;
  }

  canRedo(): boolean {
    return this.editor?.can().redo() ?? false;
  }
}
