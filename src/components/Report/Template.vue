<template>
    <b-row class="mr-0">
        <b-col v-for="(chart, index) in listChart" class="template-card" :cols="chart.cols">
            <b-card>
                <ReportInfo v-if="chart.type == 'ReportInfo'" :input="chart" />
                <ColumnChart v-if="chart.type == 'ColumnChart'" :input="chart" />
                <LineChart v-if="chart.type == 'LineChart'" :input="chart" />
                <PieChart v-if="chart.type == 'PieChart'" :input="chart" />
                <DoughnutChart v-if="chart.type == 'DoughnutChart'" :input="chart" />
                <ImageChart
                    v-if="chart.type == 'ImageChart'"
                    :input="chart"
                    :caseVideos="caseVideos"
                />
                <TableChart v-if="chart.type == 'TableChart'" :input="chart" />
            </b-card>
        </b-col>
    </b-row>
</template>
<script>
import ReportInfo from '@/components/Report/ReportInfo';
import ColumnChart from '@/components/Report/ColumnChart';
import LineChart from '@/components/Report/LineChart';
import PieChart from '@/components/Report/PieChart';
import DoughnutChart from '@/components/Report/DoughnutChart';
import ImageChart from '@/components/Report/ImageChart';
import TableChart from '@/components/Report/TableChart';
export default {
    props: {
        videoObjects: Array,
        filterClasses: Array,
        filterColors: Array,
        report: Object,
        caseVideos: Array
    },
    data() {
        return {
            listChart: []
        };
    },
    name: 'b-template',
    components: {
        ReportInfo,
        ColumnChart,
        LineChart,
        PieChart,
        DoughnutChart,
        ImageChart,
        TableChart
    },
    mounted() {
        this.initListChart();
    },
    methods: {
        initListChart() {
            this.listChart = [];
            const template = this.report.template;
            let maxImageChart = 0;
            if (this.caseVideos.length > 4) maxImageChart = 4;
            else maxImageChart = this.caseVideos.length;

            let countImageChart = 0;
            for (const item of template) {
                const chart = {
                    ...item,
                    videoObjects: this.videoObjects,
                    filterClasses: this.filterClasses,
                    filterColors: this.filterColors
                };
                if (chart.type === 'ImageChart') {
                    if (countImageChart < maxImageChart) {
                        chart.caseVideo = this.caseVideos[countImageChart];
                        countImageChart++;
                    } else continue;
                }
                this.listChart.push(chart);
            }
        }
    },
    watch: {
        videoObjects() {
            this.initListChart();
        },
        report() {
            this.initListChart();
        }
    }
};
</script>

<style scoped>
.card {
    background-color: #3d4247;
    margin-bottom: 5px;
    margin-left: 2.5px;
    margin-right: 2.5px;
    border: none;
    padding: 0px;
}
.card-body {
    padding: 5px 10px;
}
.template-card {
    padding-right: 0px;
    padding-left: 0px;
    margin-right: 0px;
}
</style>
