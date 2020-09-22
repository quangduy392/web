<template>
    <div class="animated fadeIn h-100">
        <sub-header>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/report">{{ $t('report.list') }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>
        <div class="page-content sub-header-page-content py-1 px-3">
            <b-row class="h-100">
                <b-col cols="2" class="h-100 overflow-y-auto">
                    <div
                        v-for="chart in listChart"
                        style="cursor: pointer;"
                        class="text-center p-2"
                        @click="addChart(chart)"
                    >
                        <ChartItem :chart="chart" />
                    </div>
                </b-col>
                <b-col cols="10" class="d-flex h-100 p-0">
                    <div class="pr-3 pl-3 mr-1 h-100 overflow-auto pb-2 flex-1 d-flex flex-column">
                        <template-edit
                            :listChart="listReportChart"
                            @selectChart="onSelectChart"
                            @removeChart="onRemoveChart"
                        />
                    </div>
                    <div class="case-detail_sidebar h-100">
                        <ChartConfigSidebar />
                    </div>
                </b-col>
            </b-row>
        </div>
    </div>
</template>

<script>
import TemplateEdit from '@/components/Report/TemplateEdit';
import ChartItem from '@/components/Report/ChartItem';
import ChartConfigSidebar from '@/components/Report/ChartConfigSidebar';
import Vue from 'vue';
const listChart = [
    {
        title: 'Report Info',
        img: '',
        isSelected: false,
        type: 'ReportInfo',
        source: '',
        time: '',
        description: '',
        items: []
    },
    {
        title: 'Column Chart',
        img: '',
        isSelected: false,
        type: 'ColumnChart',
        source: '',
        time: '',
        description: '',
        items: []
    },
    { title: 'Image Chart', img: '', isSelected: false, type: 'ImageChart' },
    { title: 'Line Chart', img: '', isSelected: false, type: 'LineChart' },
    { title: 'Pie Chart', img: '', isSelected: false, type: 'PieChart' },
    { title: 'Table Chart', img: '', isSelected: false, type: 'TableChart' }
];
const operatorOptions = [
    { value: 'count', text: 'Đếm' },
    { value: 'sum', text: 'Tổng' },
    { value: 'average', text: 'Trung bình' },
    { value: 'min', text: 'Min' },
    { value: 'max', text: 'Max' }
];
export default {
    components: { TemplateEdit, ChartItem, ChartConfigSidebar },
    mounted: function() {
        this.$nextTick(function() {});
    },
    data: function() {
        return {
            listChart,
            sourceOptions: [],
            operatorOptions,
            sourceSelected: '',
            operatorSelected: '',
            curChart: { title: '', items: [] },
            listReportChart: [],
            curIndex: ''
        };
    },
    methods: {
        addChart(chart) {
            this.listReportChart.push(JSON.parse(JSON.stringify(chart)));
        },
        onSelectChart(index) {
            for (const chart of this.listReportChart) {
                chart.isSelected = false;
            }
            this.listReportChart[index].isSelected = true;
            this.curChart = this.listReportChart[index];
            this.curIndex = index;
        },
        onRemoveChart(index) {
            this.listReportChart.splice(index, 1);
        },
        addItem() {
            this.curChart.items.push({ name: 'People', field: 'person', operator: 'count' });
            Vue.set(this.listReportChart, this.curIndex, JSON.parse(JSON.stringify(this.curChart)));
        },
        onChangeItem() {
            Vue.set(this.listReportChart, this.curIndex, JSON.parse(JSON.stringify(this.curChart)));
        },
        async onDataSourceChange(e) {
            this.sourceOptions = [];
        },
        onChangeField(e) {
            this.curChart.items = [{ name: e, field: e }];
            Vue.set(this.listReportChart, this.curIndex, JSON.parse(JSON.stringify(this.curChart)));
        }
    }
};
</script>
<style scoped>
.col-2 {
    padding-left: 0px;
    padding-right: 0px;
}
</style>
