export interface FinancialInput {
    // Current Environment (Traditional)
    currentHardwareCost: number; // Maintenance/Refresh
    currentPowerCost: number;    // Monthly
    currentDatacenterCost: number; // Rack/Space Monthly
    currentAdminCost: number;    // Staff Monthly

    // Cloud Alternative (AWS/Azure)
    cloudMonthlyCost: number;    // Compute + Storage
    cloudMigrationCost: number;  // One-time
    cloudEgressCost: number;     // Monthly estimated

    // HPE GreenLake Solution
    greenlakeMonthlyCommit: number; // Committed capacity
    greenlakeBufferUsage: number;   // Variable usage estimated
    greenlakeServicesCost: number;  // Managed services (optional)

    // General
    durationYears: number;
    discountRate: number; // For NPV (e.g., 0.08 for 8%)

    // Additional Solutions (OpEx/Software)
    morpheusMonthlyCost: number;
    vmEssentialsMonthlyCost: number;
    zertoMonthlyCost: number;
    opsRampMonthlyCost: number;
    pcbeBusinessMonthlyCost: number;
    pcbeEnterpriseMonthlyCost: number;
    storeOnceMonthlyCost: number;
    morpheusVMEMonthlyCost: number;
    vmEssentialsLicenseMonthlyCost: number;

    // View Control
    selectedSolutions: string[]; // 'morpheus', 'vmEssentials', 'zerto', 'opsRamp'
}

export interface FinancialResult {
    year: number;
    traditionalCumulative: number;
    cloudCumulative: number;
    greenlakeCumulative: number;

    // New Comparisons
    morpheusCumulative: number;           // Morpheus Standalone
    morpheusIntegratedCumulative: number; // Morpheus + VM Essentials
    vmEssentialsCumulative: number;       // VM Essentials Standalone
    zertoCumulative: number;
    opsRampCumulative: number;
    pcbeBusinessCumulative: number;
    pcbeEnterpriseCumulative: number;
    storeOnceCumulative: number;
    morpheusVMECumulative: number;
    vmEssentialsLicenseCumulative: number;

    savingsVsTraditional: number;
    savingsVsCloud: number;

    // Pass through for Dashboard visibility
    selectedSolutions: string[];
}

export interface ROIMetrics {
    totalSavings: number;
    roi: number; // Percentage return on investment
    paybackPeriodMonths: number;
    npv: number;
    selectedSolutions: string[];
}

export function calculateTCO(inputs: FinancialInput): {
    yearlyData: FinancialResult[];
    metrics: ROIMetrics
} {
    const years = inputs.durationYears;
    const yearlyData: FinancialResult[] = [];

    let tradCum = 0;
    let cloudCum = inputs.cloudMigrationCost;
    let glCum = 0;

    // New Solutions Cumulative Init
    let morphCum = 0;
    let morphIntCum = 0;
    let vmEssCum = 0;
    let zertoCum = 0;
    let opsRampCum = 0;
    let pcbeBusinessCum = 0;
    let pcbeEnterpriseCum = 0;
    let storeOnceCum = 0;
    let morphVMECum = 0;
    let vmEssLicenseCum = 0;

    for (let i = 1; i <= years; i++) {
        // Traditional: Heavy CapEx refresh in year 1 and 4 (simplified)
        const tradHardware = (i === 1 || i === 4) ? inputs.currentHardwareCost : 0;
        const tradOpex = (inputs.currentPowerCost + inputs.currentDatacenterCost + inputs.currentAdminCost) * 12;

        // Cloud: Pure OpEx, grows slightly with data gravity (simulated 5% growth)
        const cloudOpex = (inputs.cloudMonthlyCost + inputs.cloudEgressCost) * 12 * Math.pow(1.05, i - 1);

        // GreenLake: OpEx model, typically 10-20% lower than Cloud due to no egress/latency
        const glOpex = (inputs.greenlakeMonthlyCommit + inputs.greenlakeBufferUsage + inputs.greenlakeServicesCost) * 12;

        // New Solutions (Pure OpEx calculated annually)
        const morphOpex = inputs.morpheusMonthlyCost * 12;
        const vmEssOpex = inputs.vmEssentialsMonthlyCost * 12;
        const zertoOpex = inputs.zertoMonthlyCost * 12;
        const opsRampOpex = inputs.opsRampMonthlyCost * 12;
        const pcbeBusinessOpex = (inputs.pcbeBusinessMonthlyCost || 0) * 12;
        const pcbeEnterpriseOpex = (inputs.pcbeEnterpriseMonthlyCost || 0) * 12;
        const storeOnceOpex = (inputs.storeOnceMonthlyCost || 0) * 12;
        const morphVMEOpex = (inputs.morpheusVMEMonthlyCost || 0) * 12;
        const vmEssLicenseOpex = (inputs.vmEssentialsLicenseMonthlyCost || 0) * 12;

        tradCum += tradHardware + tradOpex;
        cloudCum += cloudOpex;
        glCum += glOpex;

        morphCum += morphOpex;
        morphIntCum += (morphOpex + vmEssOpex); // Integrated = Morpheus + VM Essentials
        vmEssCum += vmEssOpex;
        zertoCum += zertoOpex;
        opsRampCum += opsRampOpex;
        pcbeBusinessCum += pcbeBusinessOpex;
        pcbeEnterpriseCum += pcbeEnterpriseOpex;
        storeOnceCum += storeOnceOpex;
        morphVMECum += morphVMEOpex;
        vmEssLicenseCum += vmEssLicenseOpex;

        yearlyData.push({
            year: i,
            traditionalCumulative: tradCum,
            cloudCumulative: cloudCum,
            greenlakeCumulative: glCum,

            morpheusCumulative: morphCum,
            morpheusIntegratedCumulative: morphIntCum,
            vmEssentialsCumulative: vmEssCum,
            zertoCumulative: zertoCum, // Still present in interface, but not accumulated
            opsRampCumulative: opsRampCum,
            pcbeBusinessCumulative: pcbeBusinessCum,
            pcbeEnterpriseCumulative: pcbeEnterpriseCum,
            storeOnceCumulative: storeOnceCum,
            morpheusVMECumulative: morphVMECum,
            vmEssentialsLicenseCumulative: vmEssLicenseCum,

            savingsVsTraditional: tradCum - glCum,
            savingsVsCloud: cloudCum - glCum,

            selectedSolutions: inputs.selectedSolutions || []
        });
    }

    // Calculate Metrics (GreenLake vs Traditional as base)
    const totalSavings = yearlyData[years - 1].savingsVsTraditional;
    const initialInv = 0; // GreenLake has 0 upfront usually, but let's assume implementation cost if any.

    // Simple NPV Calculation
    let npv = 0;
    for (let i = 0; i < years; i++) {
        const cashFlow = yearlyData[i].savingsVsTraditional - (i === 0 ? 0 : yearlyData[i - 1].savingsVsTraditional);
        npv += cashFlow / Math.pow(1 + inputs.discountRate, i + 1);
    }

    return {
        yearlyData,
        metrics: {
            totalSavings,
            roi: (totalSavings / (tradCum)) * 100, // ROI relative to avoiding TCO
            paybackPeriodMonths: 0, // GreenLake is OpEx, payback is immediate vs CapEx
            npv,
            selectedSolutions: inputs.selectedSolutions || []
        }
    };
}
