/**
 * SpendWise Main Client Utilities
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Sidebar Toggle
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const sidebar = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // 2. Month picker auto-submit
  const monthInput = document.getElementById('globalMonthPicker');
  if (monthInput) {
    monthInput.addEventListener('change', () => {
      monthInput.form.submit();
    });
  }
});

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Quick fill for challenge progress
function openAddProgressModal(goalId, title, remaining) {
  const modal = document.getElementById('addProgressModal');
  if (modal) {
    document.getElementById('progressGoalId').value = goalId;
    document.getElementById('progressGoalTitle').innerText = title;
    document.getElementById('progressGoalRemaining').innerText = Number(remaining).toLocaleString() + '원 남음';
    const form = document.getElementById('addProgressForm');
    form.action = `/challenges/${goalId}/progress`;
    openModal('addProgressModal');
  }
}

// Quick fill for category budget edit
function openCategoryBudgetModal(categoryId, categoryName, currentBudget) {
  const modal = document.getElementById('categoryBudgetModal');
  if (modal) {
    document.getElementById('modalCategoryId').value = categoryId;
    document.getElementById('modalCategoryName').innerText = categoryName;
    document.getElementById('modalBudgetAmount').value = currentBudget || '';
    openModal('categoryBudgetModal');
  }
}
