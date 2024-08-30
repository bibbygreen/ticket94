export function activateStep(stepNum) {
  const steps = document.querySelectorAll(".progress-step");
  const progressFill = document.querySelector(".progress-fill");

  steps.forEach((step, index) => {
    if (index < stepNum - 1) {
      // 完成的步驟
      step.classList.add("completed");
      step.classList.remove("active");
    } else if (index === stepNum - 1) {
      // 當前步驟
      step.classList.add("active");
      step.classList.add("completed");
    } else {
      // 未完成的步驟
      step.classList.remove("active");
      step.classList.remove("completed");
    }
  });

  // 更新進度條的寬度
  const stepCount = steps.length;
  const progressPercentage = ((stepNum - 1) / (stepCount - 1)) * 100;
  progressFill.style.width = `${progressPercentage}%`;
}
