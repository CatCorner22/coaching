export type StepConfirm = {
  didDo: boolean;
  didCheck: boolean;
};

export function emptyStepConfirm(): StepConfirm {
  return { didDo: false, didCheck: false };
}
