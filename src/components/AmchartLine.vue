<template>
    <div ref="chartdiv" style="width: 100%; height: 500px;"></div>
</template>

<script>
    import * as am4core from '@amcharts/amcharts4/core';
    import * as am4charts from '@amcharts/amcharts4/charts';
    export default {
        props: ['data'],
        watch: {
            data (value) {
                if (value.length > 0) {
                    const data = [];
                    value.forEach((serie, index) => {
                        serie.data.forEach(dataItem => {
                            data.push({
                                [`date_${index}`]: dataItem.date,
                                [`value_${index}`]: dataItem.value
                            });
                        });
                    });
                    const chart = am4core.create(this.$refs.chartdiv, am4charts.XYChart);
                    chart.data = data;

                    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
                    dateAxis.renderer.grid.template.location = 0;

                    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
                    valueAxis.tooltip.disabled = true;
                    valueAxis.renderer.minWidth = 60;

                    let firstSeries;
                    value.forEach((seriesData, index) => {
                        const series = chart.series.push(new am4charts.LineSeries());
                        series.name = seriesData.label;
                        series.dataFields.dateX = `date_${index}`;
                        series.dataFields.valueY = `value_${index}`;
                        series.tooltipText = '{valueY.value}';
                        series.fill = am4core.color(seriesData.backgroundColor);
                        series.stroke = am4core.color(seriesData.backgroundColor);
                        series.strokeWidth = 2;

                        if (index === 0) {
                            firstSeries = series;
                        }
                    });

                    chart.cursor = new am4charts.XYCursor();
                    chart.cursor.xAxis = dateAxis;

                    const scrollbarX = new am4charts.XYChartScrollbar();
                    scrollbarX.series.push(firstSeries);
                    chart.scrollbarX = scrollbarX;
                    chart.scrollbarX.parent = chart.bottomAxesContainer;

                    chart.legend = new am4charts.Legend();
                    chart.legend.parent = chart.plotContainer;
                    chart.legend.zIndex = 100;

                    this.chart = chart;
                }
            }
        },
        beforeDestroy () {
            if (this.chart) {
                this.chart.dispose();
            }
        }
    };
</script>
