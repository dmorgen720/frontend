def pad_or_truncate(value: str, length: int) -> str:
    """
    Ensure a string is exactly `length` characters by:
    - Right-padding with spaces if shorter.
    - Truncating if it's longer.
    """
    val = value or ""
    padded = val.ljust(length)    # pad on the right with spaces
    return padded[:length]        # truncate to exact length

def generate_single_record(index: int) -> str:
    """
    Create one 511-character record based on the specified field layout.
    """
    # Each field is generated or hard-coded for demonstration purposes.
    # Adjust content as needed for your use-case.
    
    # Positions (start..end) and lengths:
    # 0..2 (2)       eventCode
    # 2..16 (14)     filler_2_16
    # 16..23 (7)     iprUniqueRefNumber
    # 23..58 (35)    ownerName
    # 58..65 (7)     accountNumber
    # 65..80 (15)    caseCode
    # 80..95 (15)    fileNumber
    # 95..110 (15)   agentCaseCode
    # 110..145 (35)  clientRef
    # 145..160 (15)  clientCode
    # 160..162 (2)   countryCode
    # 162..164 (2)   renewalTypeCode
    # 164..180 (16)  renewalTypeName
    # 180..195 (15)  registrationNumber
    # 195..201 (6)   divisionCode
    # 201..202 (1)   linkedFlag
    # 202..204 (2)   annuityTerm
    # 204..212 (8)   filler_204_212
    # 212..220 (8)   nextRenewalDateString
    # 220..228 (8)   filler_220_228
    # 228..243 (15)  eventAmount
    # 243..246 (3)   currency
    # 246..253 (7)   invoiceNumber
    # 253..257 (4)   invoiceItemNumber
    # 257..265 (8)   filler_257_265
    # 265..465 (200) eventNarrative
    # 465..511 (46)  filler_465_511
    
    eventCode             = pad_or_truncate("EC", 2)
    filler_2_16           = pad_or_truncate("", 14)
    iprUniqueRefNumber    = pad_or_truncate(f"IPR{index}", 7)
    ownerName             = pad_or_truncate(f"OWNER_NAME_{index}", 35)
    accountNumber         = pad_or_truncate(f"ACC{index}", 7)
    caseCode              = pad_or_truncate(f"CASE{index}", 15)
    fileNumber            = pad_or_truncate(f"FILE{index}", 15)
    agentCaseCode         = pad_or_truncate(f"AGENT{index}", 15)
    clientRef             = pad_or_truncate(f"CLIENT_REF_{index}", 35)
    clientCode            = pad_or_truncate(f"CLI_CODE_{index}", 15)
    countryCode           = pad_or_truncate("US", 2)
    renewalTypeCode       = pad_or_truncate("RT", 2)
    renewalTypeName       = pad_or_truncate(f"RENEW_TYPE_{index}", 16)
    registrationNumber    = pad_or_truncate(f"REG{index}", 15)
    divisionCode          = pad_or_truncate(f"DIV{index}", 6)
    linkedFlag            = pad_or_truncate("Y" if index % 2 == 0 else "N", 1)
    annuityTerm           = pad_or_truncate(str((10 + index) % 99), 2)
    filler_204_212        = pad_or_truncate("", 8)
    # Just a simple date-like pattern: "202501" + day, ensuring an 8-digit string
    nextRenewalDateString = pad_or_truncate(f"2025{(index % 12 + 1):02d}{(index % 28 + 1):02d}", 8)
    filler_220_228        = pad_or_truncate("", 8)
    eventAmount           = pad_or_truncate(str(1000 + index * 10), 15)
    currency              = pad_or_truncate("USD", 3)
    invoiceNumber         = pad_or_truncate(f"INV{index}", 7)
    invoiceItemNumber     = pad_or_truncate(str(index), 4)
    filler_257_265        = pad_or_truncate("", 8)
    eventNarrative        = pad_or_truncate(f"EventNarrative for record {index}", 200)
    filler_465_511        = pad_or_truncate("", 46)

    # Concatenate all parts in the correct order
    record_line = (
        eventCode +
        filler_2_16 +
        iprUniqueRefNumber +
        ownerName +
        accountNumber +
        caseCode +
        fileNumber +
        agentCaseCode +
        clientRef +
        clientCode +
        countryCode +
        renewalTypeCode +
        renewalTypeName +
        registrationNumber +
        divisionCode +
        linkedFlag +
        annuityTerm +
        filler_204_212 +
        nextRenewalDateString +
        filler_220_228 +
        eventAmount +
        currency +
        invoiceNumber +
        invoiceItemNumber +
        filler_257_265 +
        eventNarrative +
        filler_465_511
    )

    # Confirm the line is exactly 511 characters
    if len(record_line) != 511:
        raise ValueError(f"Generated record for index {index} is {len(record_line)} chars, expected 511.")

    return record_line

def main():
    """
    Generate 50 records, each 511 characters, and save to 'sample_records.txt'.
    """
    lines = []
    for i in range(1, 51):
        line = generate_single_record(i)
        lines.append(line)

    output_filename = "sample_records.txt"
    with open(output_filename, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(line + "\n")

    print(f"Successfully generated {len(lines)} records in '{output_filename}'.")

if __name__ == "__main__":
    main()
