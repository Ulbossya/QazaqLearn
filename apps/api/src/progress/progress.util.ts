export function calculateProgress(input: {
  completedMaterials: number;
  totalMaterials: number;
  passedTests: number;
  totalTests: number;
}) {
  const { completedMaterials, totalMaterials, passedTests, totalTests } = input;
  let raw = 0;
  if (totalMaterials > 0 && totalTests > 0) {
    raw = (completedMaterials / totalMaterials) * 70 + (passedTests / totalTests) * 30;
  } else if (totalMaterials > 0) {
    raw = (completedMaterials / totalMaterials) * 100;
  } else if (totalTests > 0) {
    raw = (passedTests / totalTests) * 100;
  }
  return Math.round(Math.min(100, raw) * 100) / 100;
}
