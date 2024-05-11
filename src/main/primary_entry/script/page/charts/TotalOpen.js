/**
 * Shared logic for the TotalOpen charts.
 */
const TotalOpen = {};

TotalOpen.buildVerticalYearPlotLines = function () {
    const plotLinesArray = [];
    const currentYear = new Date().getFullYear();
    for (let year = 2013; year <= currentYear; year++) {
        plotLinesArray.push(
            {
                value: Date.UTC(year, 0, 1),
                color: 'black',
                width: 1,
                label: {
                    text: year,
                    align: 'left',
                    style: {
                        color: 'lightgray',
                        fontSize: '1.5em'

                    }
                }
            }
        );
    }
    return plotLinesArray;
};


export default TotalOpen;

