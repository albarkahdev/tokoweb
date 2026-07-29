import type { Child } from "hono/jsx";

export function Form(props: {
  action: string;
  multipart?: boolean;
  webpUpload?: boolean;
  confirm?: string;
  children: Child;
}) {
  return (
    <>
      <form
        method="post"
        action={props.action}
        enctype={props.multipart ? "multipart/form-data" : undefined}
        data-webp-upload={props.webpUpload ? "" : undefined}
        data-confirm={props.confirm}
      >
        {props.children}
      </form>
      {props.webpUpload ? <script src="/assets/upload.js" defer /> : null}
    </>
  );
}

export function HiddenInput(props: { name: string; value: string }) {
  return <input type="hidden" name={props.name} value={props.value} />;
}

export function Field(props: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  inputmode?: "numeric" | "tel" | "email" | "decimal";
}) {
  return (
    <label class="field">
      <span>{props.label}</span>
      <input
        type={props.type ?? "text"}
        name={props.name}
        value={props.value}
        placeholder={props.placeholder}
        required={props.required}
        inputmode={props.inputmode}
      />
      {props.hint ? <div class="hint">{props.hint}</div> : null}
    </label>
  );
}

export function TextAreaField(props: {
  label: string;
  name: string;
  value?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label class="field">
      <span>{props.label}</span>
      <textarea name={props.name} rows={props.rows ?? 4} required={props.required}>
        {props.value ?? ""}
      </textarea>
      {props.hint ? <div class="hint">{props.hint}</div> : null}
    </label>
  );
}

export function SelectField(props: {
  label: string;
  name: string;
  options: { value: string; label: string; selected?: boolean }[];
}) {
  return (
    <label class="field">
      <span>{props.label}</span>
      <select name={props.name}>
        {props.options.map((option) => (
          <option value={option.value} selected={option.selected}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField(props: { label: string; name: string; checked?: boolean }) {
  return (
    <label class="field checkbox">
      <input type="checkbox" name={props.name} checked={props.checked} />
      <span>{props.label}</span>
    </label>
  );
}

export function FileField(props: {
  label: string;
  name: string;
  required?: boolean;
  multiple?: boolean;
  hint?: string;
}) {
  return (
    <label class="field">
      <span>{props.label}</span>
      <input
        type="file"
        name={props.name}
        accept="image/*"
        required={props.required}
        multiple={props.multiple}
      />
      {props.hint ? <div class="hint">{props.hint}</div> : null}
    </label>
  );
}

export function TimeRow(props: {
  label: string;
  openName: string;
  closeName: string;
  closedName: string;
  open: string;
  close: string;
  closed?: boolean;
}) {
  return (
    <div class="field time-row">
      <span class="day">{props.label}</span>
      <input type="time" name={props.openName} value={props.open} />
      <input type="time" name={props.closeName} value={props.close} />
      <label class="toggle">
        <input type="checkbox" name={props.closedName} checked={props.closed} /> Tutup
      </label>
    </div>
  );
}

export function InputPairRow(props: {
  first: { name: string; placeholder: string };
  second: { name: string; placeholder: string; numeric?: boolean };
}) {
  return (
    <div class="pair-row">
      <input type="text" name={props.first.name} placeholder={props.first.placeholder} />
      <input
        type="text"
        name={props.second.name}
        placeholder={props.second.placeholder}
        inputmode={props.second.numeric ? "numeric" : undefined}
      />
    </div>
  );
}

export function Button(props: {
  children: Child;
  variant?: "primary" | "secondary" | "danger";
  block?: boolean;
  name?: string;
  value?: string;
  formaction?: string;
}) {
  const classes = ["btn"];
  if (props.variant === "secondary") classes.push("secondary");
  if (props.variant === "danger") classes.push("danger");
  if (props.block) classes.push("block");
  return (
    <button
      class={classes.join(" ")}
      type="submit"
      name={props.name}
      value={props.value}
      formaction={props.formaction}
    >
      {props.children}
    </button>
  );
}

export function LinkButton(props: {
  href: string;
  children: Child;
  variant?: "primary" | "secondary";
  external?: boolean;
}) {
  const classes = ["btn"];
  if (props.variant === "secondary") classes.push("secondary");
  return (
    <a
      class={classes.join(" ")}
      href={props.href}
      target={props.external ? "_blank" : undefined}
      rel={props.external ? "noopener" : undefined}
    >
      {props.children}
    </a>
  );
}
