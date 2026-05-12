// Map centralized escrow / contract enums to strings the Module 8 UI expects.
const ESCROW_STATUS_DISPLAY = {
  pending: "escrow_pending",
  active: "escrow_locked",
  partial: "partial_escrow",
  completed: "released",
  frozen: "escrow_locked",
  refunded: "released",
  cancelled: "cancelled",
};

const CONTRACT_STATUS_DISPLAY = {
  open: "Open",
  in_progress: "Active",
  under_review: "On Hold",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Closed",
};

function escrowStatusToPaymentStatus(raw) {
  if (!raw) return "unknown";
  const k = String(raw).toLowerCase();
  return ESCROW_STATUS_DISPLAY[k] || k;
}

function contractStatusToDisplay(raw) {
  if (!raw) return "Unknown";
  const k = String(raw).toLowerCase();
  return CONTRACT_STATUS_DISPLAY[k] || k;
}

module.exports = {
  escrowStatusToPaymentStatus,
  contractStatusToDisplay,
};
