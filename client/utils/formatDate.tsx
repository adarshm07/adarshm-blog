export function formatDate(dateString: any) {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    })
}
export function formatMonthYear(dateString: any) {
    const dt = new Date(dateString);
    var month = dt.toLocaleString('default', { month: 'long' });
    var year = dt.toLocaleString('default', { year: 'numeric' });

    return month + ' ' + year
}