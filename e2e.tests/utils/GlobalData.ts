import testData from '../testdata.json';

// Utility class to load and expose data from testdata.json using the Singleton pattern.
export class GlobalData {
    private static instance: GlobalData;
    public readonly app: { expectedTitle: string, expectedQuote: string, resumeLink: string };

    private constructor() {
        this.app = testData.app;
    }

    public static getInstance(): GlobalData {
        if (!GlobalData.instance) {
            GlobalData.instance = new GlobalData();
        }
        return GlobalData.instance;
    }
}
