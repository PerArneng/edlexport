type TimeData = {
    date: string;
    fromTime: string;
    toTime: string;
};

// Function to parse and format the date
function parseDate(dateString: string): string {
    const months: { [key: string]: string } = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'maj': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
    };

    const dateRegex = /(\d{1,2}) (\w+)/;
    const [, day, monthAbbr] = dateString.match(dateRegex) || [];
    const month = months[monthAbbr.toLowerCase()];
    return `2023-${month}-${day.padStart(2, '0')}`;
}

// Function to find and extract time data from the document
function findTimeData(documentBody: Document): TimeData[] {
    const timeData: { [key: string]: TimeData } = {};
    const overviewDayContainers = documentBody.querySelectorAll('.overview-day-container');

    overviewDayContainers.forEach(container => {
        const dayDateElement = container.querySelector('.day-date');
        if (dayDateElement) {
            const date = parseDate(dayDateElement.textContent || '');
            const timePairElement = container.querySelector('.counter-timepair');
            if (timePairElement) {
                const [fromTime, toTime] = timePairElement.textContent?.split(' - ') || [];
                if (fromTime && toTime && !timeData[date]) {
                    timeData[date] = { date, fromTime, toTime };
                }
            }
        }
    });

    return Object.values(timeData);
}

// Function to format the time data into CSV
function formatToCSV(timeData: TimeData[]): string {
    const csvRows = timeData.map(({ date, fromTime, toTime }) => `${date},${fromTime},${toTime}`);
    return `Date,From Time,To Time\n${csvRows.join('\n')}`;
}

// Function to trigger the download of the CSV file
function downloadCSV(csvString: string, fileName: string): void {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractTimeData") {
        // Call the function to extract data and download CSV
        const timeData = findTimeData(document);
        const csvString = formatToCSV(timeData);
        downloadCSV(csvString, 'time_data.csv');
    }
});


