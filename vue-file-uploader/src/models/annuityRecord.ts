export class AnnuityRecord {

    originalRecord?: string;

    eventCode?: string;

    eventDate?: Date;

    eventTime?: Date;

    iprUniqueRefNumber?: string;

    ownerName?: string;

    accountNumber?: string;

    caseCode?: string;

    fileNumber?: string;

    agentCaseCode?: string;

    clientRef?: string;

    clientCode?: string;

    countryCode?: string;

    renewalTypeCode?: string;

    renewalTypeName?: string;

    registrationNumber?: string;

    divisionCode?: string;

    linkedFlag?: string;

    annuityTerm?: number;

    renewalDate?: Date;

    nextRenewalDateString?: string;

    nextRenewalDate?: Date;

    expiryDate?: Date;

    eventAmount?: number;

    currency?: string;

    invoiceNumber?: string;

    invoiceItemNumber?: string;

    futureLapseDate?: Date;

    eventNarrative?: string;

 

    // Constructor to initialize the object if needed

    constructor(init?: Partial<AnnuityRecord>) {

        Object.assign(this, init);

    }

 

    // Method equivalent to C# HasNextRenewalDate

    hasNextRenewalDate(): boolean {

        return this.nextRenewalDateString !== "00000000";

    }

 

    // Method stub for ToDataFileString

    // Implement necessary logic as per requirement

    toDataFileString(): string {

        return '';

    }

}

