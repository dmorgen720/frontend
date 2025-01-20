import { ProcessResult } from '../models/processResult';

import { AnnuityRecord } from '../models/annuityRecord';

import ExcelJS from 'exceljs';

 

export class AnnuityProcessor {

    private static readonly EXPECTED_RECORD_LENGTH = 512;

 

    /**

     * Main process method to handle the annuity records from the provided file content.

     * @param fileContent A string representing the content of the file to be processed.

     */

    public process(fileContent: string): ProcessResult {

        var processResult = new ProcessResult();

 

        try {

            const records = this.parseRecords(fileContent, processResult);
            processResult.messages.push(` [INF] Found ${records.allRecords.length} records to process`);

 

            const agEventsCount = records.allRecords.filter(r => r.eventCode === 'AG').length;

            if (agEventsCount !== records.allRecords.length) {

                const warningMessage = ` [WRN] Found ${agEventsCount} records with EventCode different from 'AG'`;

                console.error(warningMessage);

                processResult.messages.push(warningMessage);

                processResult.totalRecords = 0;

                processResult.hasErrors = true;

                return processResult;

            }

            const uniqueRecords = this.deduplicateRecords(records.allRecords, processResult);

            processResult.messages.push(` [INF] Found ${uniqueRecords.length} unique CaseCodes`);
            this.writeNoRenewalsFile(uniqueRecords, `./output/${new Date().toISOString().split('T')[0]}_Next_Annuity_Date_NULLER.xlsx`, processResult)
                .then(value => 
                {
                    processResult = value;
                })
                .catch(error =>
                {
                    const errorMessage = " [ERR] An error occurred while writing the file:" + error;
                    processResult.messages.push(`${errorMessage}`);
                    processResult.hasErrors = true;
                });

        } catch (error) {
            const errorMessage = " [ERR] An error occurred while processing the file content: " + error;
            processResult.messages.push(`${errorMessage}`);
            processResult.hasErrors = true;
        }
 
        return processResult;
    }

 

    private parseRecords(content: string, processResult: ProcessResult): { firstLine: string | null, allRecords: AnnuityRecord[] } {

        const records: AnnuityRecord[] = [];

       

        const lines = content.split("\n");

        if (lines.length < 2) {

            processResult.messages.push(" [WRN] No data lines found in the provided content.");

            return { firstLine: null, allRecords: [] };

        }

 

        for (let i = 1; i < lines.length - 1; i++) {

            try {

                const record = lines[i];

                if (record.length === AnnuityProcessor.EXPECTED_RECORD_LENGTH) {

                    const annuityRecord = this.createAnnuityRecord(record);

                    records.push(annuityRecord);

                } else {

                    const warningMessage = ` [WRN] Record length requirement not met: ${record}`;

                    console.warn(warningMessage);

                    processResult.messages.push(warningMessage);

                }

            } catch (error) {

                const errorMessage = ` [WRN] Failed to parse record at line ${i + 1}: ${lines[i]}`;

                console.error(errorMessage, error);

                processResult.messages.push(`${errorMessage}`);

            }

        }

        processResult.messages.push(` [INF] Processing complete. Please open download folder for output`);

        return { firstLine: lines[0], allRecords: records };

    }

 

    private createAnnuityRecord(record: string): AnnuityRecord {

        const annuityRecord: AnnuityRecord = {
            originalRecord: record,

            eventCode: record.substring(0, 2).trim(),

            iprUniqueRefNumber: record.substring(16, 22).trim(),

            ownerName: record.substring(23, 57).trim(),

            accountNumber: record.substring(58, 64).trim(),

            caseCode: record.substring(65, 79).trim(),

            fileNumber: record.substring(80, 94).trim(),

            agentCaseCode: record.substring(95, 109).trim(),

            clientRef: record.substring(110, 144).trim(),

            clientCode: record.substring(145, 179).trim(),

            countryCode: record.substring(160, 162).trim(),

            renewalTypeCode: record.substring(162, 163).trim(),

            renewalTypeName: record.substring(164, 179).trim(),

            registrationNumber: record.substring(180, 194).trim(),

            divisionCode: record.substring(195, 200).trim(),

            linkedFlag: record.substring(201, 201).trim(),

            annuityTerm: parseInt(record.substring(202, 204).trim()),

            nextRenewalDateString: record.substring(212, 220).trim(),

            eventAmount: parseFloat(record.substring(228, 242).trim()),

            currency: record.substring(243, 245).trim(),

            invoiceNumber: record.substring(246, 252).trim(),

            invoiceItemNumber: record.substring(253, 256).trim(),

            eventNarrative: record.substring(265, 464).trim(),

            eventDate: undefined,

            eventTime: undefined,

            renewalDate: undefined,

            expiryDate: undefined,

            nextRenewalDate: undefined,

            futureLapseDate: undefined,

            hasNextRenewalDate: function (): boolean {
                throw new Error('Function not implemented.');
            },
            toDataFileString: function (): string {
                throw new Error('Function not implemented.');
            }
        };

 

        this.setDateProperties(annuityRecord, record);

 

        return annuityRecord;

    }

 

    private setDateProperties(annuityRecord: AnnuityRecord, record: string): void {

        if (annuityRecord.eventCode === 'AG') {

            annuityRecord.eventDate = this.parseDate(record.substring(2, 10).trim(), "yyyyMMdd");

            //annuityRecord.eventTime = this.parseDate(record.substring(11, 17).trim(), "HHmmss", true);

            annuityRecord.renewalDate = this.parseDate(record.substring(204, 212).trim(), "yyyyMMdd");

            annuityRecord.expiryDate = this.parseDate(record.substring(220,228).trim(), "yyyyMMdd");

            annuityRecord.futureLapseDate = this.parseDate(record.substring(257, 265).trim(), "yyyyMMdd");

 

            if (annuityRecord.nextRenewalDateString !== "00000000") {

                const nextRenewalDateString = "" + annuityRecord.nextRenewalDateString;

                annuityRecord.nextRenewalDate = this.parseDate(nextRenewalDateString, "yyyyMMdd");

            }

        }

    }

 

    private parseDate(dateString: string, format: string, isTime: boolean = false): Date | undefined {

        const year = parseInt(dateString.slice(0, 4));

        const month = parseInt(dateString.slice(4, 6)) - 1; // Month is zero-based in JavaScript Date

        const day = parseInt(dateString.slice(6, 8));

 

        if (isTime) {

            const hours = parseInt(dateString.slice(0, 2));

            const minutes = parseInt(dateString.slice(2, 4));

            const seconds = parseInt(dateString.slice(4, 6));

            return new Date(0, 0, 0, hours, minutes, seconds);

        }

 

        return new Date(year, month, day);

    }

 

    private deduplicateRecords(records: AnnuityRecord[], processResult: ProcessResult): AnnuityRecord[] {

        const deduplicatedRecords: AnnuityRecord[] = [];

        const caseCodes = [...new Set(records.map(x => x.caseCode))];

 

        for (const caseCode of caseCodes) {

            const allRecs = records.filter(a => a.caseCode === caseCode);

            const emptyRecs = allRecs.filter(a => a.nextRenewalDateString === "00000000");

            const rec = emptyRecs[0];

 

            if (rec) {

                deduplicatedRecords.push(rec);

                this.logAnnuityProcessing(rec, allRecs, emptyRecs.length, processResult);

            } else {

                const latestRecord = allRecs.sort((a, b) => b.nextRenewalDateString!.localeCompare(a.nextRenewalDateString!))[0];

                deduplicatedRecords.push(latestRecord);

                const infoMessage = `${latestRecord.caseCode}: Annuity record added. Latest Annuity Date = ${latestRecord.nextRenewalDateString}, Annuity dates count: ${allRecs.length}, Country: ${latestRecord.countryCode}`;

                console.info(infoMessage);

                processResult.messages.push(infoMessage);

            }

        }

 

        return deduplicatedRecords;

    }

 

    private logAnnuityProcessing(rec: AnnuityRecord, allRecs: AnnuityRecord[], emptyRecsCount: number, processResult: ProcessResult): void {

        let logMessage = `${rec.caseCode}: Annuity record added. Latest Annuity Date = ${rec.nextRenewalDateString}, Annuity dates count: ${allRecs.length}, Country: ${rec.countryCode}`;

 

        if (emptyRecsCount > 1) {

            if (rec.countryCode === "MX" || rec.countryCode === "RU") {

                console.info(logMessage);

            } else {

                logMessage += " *** Country code different from MX and RU ***";

                console.warn(logMessage);

                processResult.hasWarnings = true;

            }

        } else if (emptyRecsCount === 1) {

            console.info(logMessage);

        }

 

        processResult.messages.push(logMessage);

    }

 

    private async writeNoRenewalsFile(records: AnnuityRecord[], outputFile: string, processResult: ProcessResult): Promise<ProcessResult> {

        try {

            const workbook = new ExcelJS.Workbook();

            const worksheet = workbook.addWorksheet('Sheet1');

           

            worksheet.columns = [

                { header: 'Case Code', key: 'caseCode', width: 30 },

                { header: 'Action', key: 'action', width: 15 },

                { header: 'Next Renewal Date', key: 'nextRenewalDate', width: 15 },

                { header: 'Annuity Term', key: 'annuityTerm', width: 15 },

            ];

 

            for (const record of records) {

                worksheet.addRow({

                    caseCode: record.caseCode?.trim(),

                    action: "Update",

                    nextRenewalDate: record.nextRenewalDateString === "00000000" ? "NULL" : record.nextRenewalDate,

                    annuityTerm: record.nextRenewalDateString === "00000000" ? undefined : record.annuityTerm! + 1

                });

            }

 

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'result.xlsx';
            link.click();

            const successMessage = `File saved successfully: ${outputFile}`;

            processResult.messages.push(successMessage);

        } catch (error) {

            const errorMessage = "An error occurred while writing the no renewals file.";

            console.error(errorMessage);

            processResult.messages.push(`[ERR] ${errorMessage}`);

            processResult.hasErrors = true;

        }

        return processResult;

    }

}