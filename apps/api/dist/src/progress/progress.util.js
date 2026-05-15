"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProgress = calculateProgress;
function calculateProgress(input) {
    const { completedMaterials, totalMaterials, passedTests, totalTests } = input;
    if (totalMaterials > 0 && totalTests > 0) {
        return Math.min(100, (completedMaterials / totalMaterials) * 70 + (passedTests / totalTests) * 30);
    }
    if (totalMaterials > 0) {
        return Math.min(100, (completedMaterials / totalMaterials) * 100);
    }
    if (totalTests > 0) {
        return Math.min(100, (passedTests / totalTests) * 100);
    }
    return 0;
}
//# sourceMappingURL=progress.util.js.map