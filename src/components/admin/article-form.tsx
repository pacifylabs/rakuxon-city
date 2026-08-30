"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormError } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/actions/articles";
import { slugify } from "@/lib/admin/slugify";
import {
  articleCategoryLabels,
  articleStatusLabels,
  options,
} from "@/lib/admin/labels";

export type ArticleFormValues = {
  id: string | null;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  coverImageId: string;
  status: string;
};

/**
 * The article editor.
 *
 * DEVIATION from docs/PHASE_7_ADMIN_DASHBOARD.md §8, which names Tiptap.
 *
 * The public article page renders `article.body.split("\n\n")` as paragraphs
 * and parses `**bold**` runs itself — it has never accepted HTML. Storing
 * Tiptap's HTML output would render as visible escaped tags on every
 * published guide, so adopting it means also rewriting the public renderer
 * to output `dangerouslySetInnerHTML`, which turns an admin account into a
 * stored-XSS vector and touches a public page outside this phase's scope.
 *
 * So the editor matches the format that already exists: blank line between
 * paragraphs, `**bold**` for emphasis, with a live preview showing exactly
 * how the public page will split it. Same expressiveness the guides actually
 * use today, no new dependency, no sanitisation surface.
 */
export function ArticleForm({
  values,
  mediaOptions,
  action,
}: {
  values: ArticleFormValues;
  mediaOptions: { id: string; alt: string }[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [body, setBody] = useState(values.body);
  const [slugTouched, setSlugTouched] = useState(values.slug !== "");

  // The slug follows the title until someone edits it by hand, then it stops
  // — retitling a published article should not silently break its live URL.
  function onTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  const paragraphs = body.split("\n\n").filter((p) => p.trim() !== "");

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      <FormError message={state?.error} />

      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          required
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint={
          values.id
            ? "Changing this breaks any existing link to the article."
            : "Filled from the title until you edit it."
        }
      >
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugTouched(true);
          }}
          required
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="category">
          <Select
            id="category"
            name="category"
            defaultValue={values.category}
            required
          >
            <option value="">Choose one</option>
            {options(articleCategoryLabels).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={values.status}>
            {options(articleStatusLabels).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Cover image" htmlFor="coverImageId">
        <Select
          id="coverImageId"
          name="coverImageId"
          defaultValue={values.coverImageId}
        >
          <option value="">No cover image</option>
          {mediaOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.alt.slice(0, 70)}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Excerpt"
        htmlFor="excerpt"
        hint="Shown on the guides hub and in search results."
      >
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={values.excerpt}
          required
        />
      </Field>

      <Field
        label="Body"
        htmlFor="body"
        hint="Leave a blank line between paragraphs. Wrap emphasis in **double asterisks**."
      >
        <Textarea
          id="body"
          name="body"
          rows={16}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          className="font-mono"
        />
      </Field>

      {paragraphs.length > 0 ? (
        <section className="rounded-card border border-line bg-surface p-5">
          <p className="text-caption text-muted">
            Preview — {paragraphs.length}{" "}
            {paragraphs.length === 1 ? "paragraph" : "paragraphs"}, exactly as
            the public page will split them
          </p>
          <div className="mt-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 text-body-l text-muted">
                {paragraph.split(/(\*\*[^*]+\*\*)/g).map((run, runIndex) =>
                  run.startsWith("**") && run.endsWith("**") ? (
                    <span key={runIndex} className="text-foreground">
                      {run.slice(2, -2)}
                    </span>
                  ) : (
                    <span key={runIndex}>{run}</span>
                  ),
                )}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : values.id ? "Save changes" : "Create article"}
        </button>
        <Link
          href="/admin/articles"
          className="text-body text-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
