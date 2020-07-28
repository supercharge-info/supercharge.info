import Highcharts from "highcharts";

const PieColors = {};

PieColors.STATUS_PERMIT = Array.from(Array(10), (_, i) => {
    return Highcharts.color('#5588cc').brighten((i - 3) / 12).get();
});

PieColors.STATUS_OPEN = Array.from(Array(10), (_, i) => {
    return Highcharts.color('#ff6666').brighten((i - 3) / 7).get();
});

PieColors.STATUS_CONSTRUCTION = Array.from(Array(10), (_, i) => {
    return Highcharts.color('#ff965c').brighten((i - 3) / 12).get();
});

export default PieColors;


