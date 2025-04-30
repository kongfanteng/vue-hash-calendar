/**
 * Calculate the calendar for each month
 * @param {number} year - Year
 * @param {number} month - Month
 * @param {number} weekStartIndex - The index of the start of the week, default 0 to [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ]
 * @param {boolean} isShowNotCurrentMonthDay - Whether to display days not in the current month
 * @returns {{day: number; month: number; year: number;}[]} - Returns the calendar array for the month example [{day: 30,month: 2,year: 2025}]
 */
export function calculateCalendarOfMonth(
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
    weekStartIndex = 0,
    isShowNotCurrentMonthDay = true
) {
    let calendarOfCurrentMonth = [];

    let lastMonthYear = month === 0 ? year - 1 : year; // Year of the last month
    let lastMonth = month === 0 ? 11 : month - 1; // Month of the last month
    let nextMonthYear = month === 11 ? year + 1 : year; // Year of the next month
    let nextMonth = month === 11 ? 0 : month + 1; // Month of the next month

    // If the first day of the month is not the specified start of the week, fill in the days of the last month
    let dayOfWeek = getDayOfWeek(year, month);
    let lastMonthDays = daysOfMonth(year)[lastMonth]; // Total days of the last month
    if (dayOfWeek < weekStartIndex) {
        dayOfWeek = 7 - weekStartIndex + dayOfWeek;
    } else {
        dayOfWeek -= weekStartIndex;
    }
    for (let i = 0; i < dayOfWeek; i++) {
        calendarOfCurrentMonth.push({
            year: lastMonthYear,
            month: lastMonth,
            day: isShowNotCurrentMonthDay ? lastMonthDays - (dayOfWeek - 1 - i) : ''
        });
    }

    // Current month's days
    for (let i = 0; i < daysOfMonth(year)[month]; i++) {
        calendarOfCurrentMonth.push({
            year: year,
            month: month,
            day: i + 1
        });
    }

    // Fill in the days of the next month at the end of the calendar to complete 6 rows and 7 columns
    let fillDays = 42 - calendarOfCurrentMonth.length; // Total days displayed in the calendar table (6 rows and 7 columns)
    for (let i = 0; i < fillDays; i++) {
        calendarOfCurrentMonth.push({
            year: nextMonthYear,
            month: nextMonth,
            day: isShowNotCurrentMonthDay ? i + 1 : ''
        });
    }

    return calendarOfCurrentMonth;
}

/**
 * Get the day of the week for a specific day in a month
 * @param {number} year - Year
 * @param {number} month - Month
 * @param {number} day - Day
 * @returns {number} - Returns the index of the day of the week
 */
export function getDayOfWeek(year = new Date().getFullYear(), month = new Date().getMonth(), day = 1) {
    let dayOfMonth = new Date(year, month, day); // Get the day of the month
    let dayOfWeek = dayOfMonth.getDay(); // Determine the day of the week (returns [0-6], 0 for Sunday, 1 for Monday)
    return dayOfWeek;
}

/**
 * Get the number of days in each month
 * @param {number} year - Year
 * @returns {Array} - Returns an array of the number of days in each month
 */
export function daysOfMonth(year) {
    return [31, 28 + isLeap(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

/**
 * Determine if it is a leap year
 * @param {number} year - Year
 * @returns {number} - Returns 1 for leap year, 0 for non-leap year
 */
export function isLeap(year) {
    return year % 4 === 0 ? (year % 100 !== 0 ? 1 : year % 400 === 0 ? 1 : 0) : 0;
}
