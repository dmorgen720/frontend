export class ProcessResult {

    /**

     * Gets or sets the total number of records processed.

     */

    totalRecords: number = 0;

 

    /**

     * Gets or sets the list of messages produced during processing.

     */

    messages: string[] = [];

 

    /**

     * Gets or sets a value indicating whether any errors occurred during processing.

     */

    hasErrors: boolean = false;

 

    /**

     * Gets or sets a value indicating whether any warnings occurred during processing.

     */

    hasWarnings: boolean = false;

 

    // Constructor to initialize the object if needed

    constructor(init?: Partial<ProcessResult>) {

        Object.assign(this, init);

    }

}

