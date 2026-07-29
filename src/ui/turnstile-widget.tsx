export function TurnstileWidget(props: { siteKey?: string }) {
  if (!props.siteKey) return null;
  return (
    <>
      <div class="cf-turnstile" data-sitekey={props.siteKey} data-theme="light" />
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
    </>
  );
}
