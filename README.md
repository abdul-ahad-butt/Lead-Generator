# USA Profile & Phone Number Generator

A Streamlit application that generates synthetic USA contact profiles linked to sequential phone numbers and exports them to a styled Excel (.xlsx) file. 
This tool features a premium dark UI and includes offline structural validation to ensure generated numbers match valid North American Numbering Plan (NANP) patterns.

**NOTE:** This tool DOES NOT perform live network/carrier lookups. It strictly verifies structural constraints (length, valid area code, valid exchange format) using Google's `phonenumbers` library offline. No real identity or subscriber data is queried.

## Setup & Execution

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   streamlit run main.py
   ```

## Inputs
- **Starting Phone Number**: Can be raw digits or formatted (e.g. `2125550100` or `(212) 555-0100`). The default is the fictional block `(212) 555-0100`.
- **Number of Profiles**: How many profiles to generate (1 to 10,000).
- **Output File Name**: Name of the generated Excel file.
- **Advanced Options**: Allow filtering by state and toggling output columns.

## Outputs
- An Excel file (`.xlsx`) containing synthetic profiles including Phone, Format Validity, Name, Address details.
- Real-time previews via interactive datatable with sorting and copy-to-clipboard functionality.
