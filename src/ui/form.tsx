import type { Child } from "hono/jsx";

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
}) {
  const classes = ["btn"];
  if (props.variant === "secondary") classes.push("secondary");
  return (
    <a class={classes.join(" ")} href={props.href}>
      {props.children}
    </a>
  );
}
