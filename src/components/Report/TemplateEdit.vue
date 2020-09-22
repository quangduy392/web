<template>
    <b-row class="pb-5">
        <b-col
            v-for="(chart, index) in listChart"
            class="template-card cursor-pointer"
            :cols="chart.type == 'ReportInfo' ? 12 : 4"
        >
            <b-card
                :border-variant="chart.isSelected ? 'primary' : 'dark'"
                @click="selectChart(index)"
            >
                <ReportInfo v-if="chart.type == 'ReportInfo'" :input="chart" />
                <ColumnChart v-if="chart.type == 'ColumnChart'" :input="chart" />
                <LineChart v-if="chart.type == 'LineChart'" :input="chart" />
                <PieChart v-if="chart.type == 'PieChart'" :title="chart.title" />
                <ImageChart v-if="chart.type == 'ImageChart'" :title="chart.title" />
                <TableChart v-if="chart.type == 'TableChart'" :title="chart.title" />
            </b-card>
            <i
                class="fa fa-times-circle"
                style="position: absolute; top: 0; right:0;"
                @click="removeChart(index)"
            />
        </b-col>
    </b-row>
</template>
<script>
import ReportInfo from '@/components/Report/ReportInfo';
import ColumnChart from '@/components/Report/ColumnChart';
import LineChart from '@/components/Report/LineChart';
import PieChart from '@/components/Report/PieChart';
import ImageChart from '@/components/Report/ImageChart';
import TableChart from '@/components/Report/TableChart';

export default {
    props: {
        listChart: ''
    },
    data() {
        return {};
    },
    name: 'template-edit',
    components: {
        ReportInfo,
        ColumnChart,
        LineChart,
        PieChart,
        ImageChart,
        TableChart
    },
    methods: {
        selectChart(index) {
            this.$emit('selectChart', index);
        },
        removeChart(index) {
            this.$emit('removeChart', index);
        }
    }
};
</script>

<style scoped>
.card {
    background-color: #3d4247;
    margin: 5px 5px;
    padding: 0px;
}
.template-card {
    padding-right: 0px;
    padding-left: 0px;
    margin-right: 0px;
}
</style>
