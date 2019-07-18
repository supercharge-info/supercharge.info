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
                        color: 'gray',
                        fontSize: '1.7em'

                    }
                }
            }
        );
    }
    return plotLinesArray;
};

TotalOpen.buildVerticalYearEndPlotLines = function () {
    const plotLinesArray = [];
    const currentYear = new Date().getFullYear();
    for (let year = 2013; year <= currentYear; year++) {
        plotLinesArray.push(
            {
                value: Date.UTC(year - 1, 11, 15),
                color: 'black',
                width: 1,
                label: {
                    text: year,
                    align: 'left',
                    style: {
                        color: 'gray',
                        fontSize: '1.7em'

                    }
                }
            }
        );
    }
    return plotLinesArray;
};


export default TotalOpen;

