/**
 * Format number utilities
 */

/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The number to format
 * @param options - Formatting options
 * @returns Formatted string (e.g., "Rp 1.000.000")
 */
export function formatCurrency(
    amount: number | string | null | undefined,
    options?: {
        showSymbol?: boolean;
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
    }
): string {
    const {
        showSymbol = true,
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
    } = options || {};

    if (amount === null || amount === undefined || amount === '') {
        return showSymbol ? 'Rp 0' : '0';
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return showSymbol ? 'Rp 0' : '0';
    }

    const formatted = numAmount.toLocaleString('id-ID', {
        minimumFractionDigits,
        maximumFractionDigits,
    });

    return showSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Format number with thousand separators (Indonesian format)
 * @param number - The number to format
 * @param options - Formatting options
 * @returns Formatted string (e.g., "1.000.000")
 */
export function formatNumber(
    number: number | string | null | undefined,
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
    }
): string {
    const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
    } = options || {};

    if (number === null || number === undefined || number === '') {
        return '0';
    }

    const numValue = typeof number === 'string' ? parseFloat(number) : number;

    if (isNaN(numValue)) {
        return '0';
    }

    return numValue.toLocaleString('id-ID', {
        minimumFractionDigits,
        maximumFractionDigits,
    });
}

/**
 * Format number to percentage
 * @param number - The number to format (0-100 or 0-1)
 * @param isDecimal - If true, number is treated as decimal (0-1), otherwise as percentage (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "50%" or "50,5%")
 */
export function formatPercentage(
    number: number | string | null | undefined,
    isDecimal: boolean = false,
    decimals: number = 0
): string {
    if (number === null || number === undefined || number === '') {
        return '0%';
    }

    const numValue = typeof number === 'string' ? parseFloat(number) : number;

    if (isNaN(numValue)) {
        return '0%';
    }

    const percentage = isDecimal ? numValue * 100 : numValue;
    const formatted = percentage.toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return `${formatted}%`;
}

/**
 * Format file size to human readable format
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1,5 MB")
 */
export function formatFileSize(
    bytes: number | string | null | undefined,
    decimals: number = 2
): string {
    if (bytes === null || bytes === undefined || bytes === '') {
        return '0 Bytes';
    }

    const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes;

    if (isNaN(numBytes) || numBytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(numBytes) / Math.log(k));

    return (
        parseFloat((numBytes / Math.pow(k, i)).toFixed(dm)).toLocaleString(
            'id-ID'
        ) +
        ' ' +
        sizes[i]
    );
}

/**
 * Parse formatted currency string back to number
 * @param formattedString - Formatted currency string (e.g., "Rp 1.000.000" or "1.000.000")
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(formattedString: string): number {
    if (!formattedString) {
        return 0;
    }

    // Remove currency symbol and spaces
    const cleaned = formattedString
        .replace(/Rp/gi, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.');

    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format phone number (Indonesian format)
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
    if (!phone) {
        return '';
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format Indonesian phone number
    if (cleaned.length === 10) {
        // Format: 0812-3456-7890
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    } else if (cleaned.length === 11) {
        // Format: 08123-4567-890
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 12) {
        // Format: 081234-5678-90
        return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 10)}-${cleaned.slice(10)}`;
    }

    // Return as is if doesn't match common formats
    return phone;
}

