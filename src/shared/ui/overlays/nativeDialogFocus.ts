/** Native desktop focus runs once. Touch opens the panel without summoning a keyboard. */
export function nativeDialogFocus(input: HTMLInputElement | null) {
  input?.toggleAttribute('autofocus', !window.matchMedia('(pointer: coarse)').matches);
}

/** Safari taps do not focus buttons; remember the opener before mounting a modal. */
export function focusDialogTrigger(trigger: HTMLElement) {
  trigger.focus({ preventScroll: true });
}
