export function setButtonText(
  btn,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving..."
) {
  if (isLoading) {
    btn.textContent = "Saving...";
  } else {
    btn.textContent = "Save";
  }
}

export function setDeleteText(
  btn,
  isLoading,
  defaultText = "Delete",
  loadingText = "Deleting..."
) {
  if (isLoading) {
    btn.textContent = "Deleting...";
  } else {
    btn.textContent = "Delete";
  }
}
