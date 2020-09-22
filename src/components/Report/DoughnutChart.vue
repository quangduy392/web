<template>
    <div>
        <h5 v-line-clamp="1">{{ input.title }}</h5>
        <DoughnutChart
            :data="dataChart"
            :options="options"
            :height="200"
            style="height: 200px;"
        ></DoughnutChart>
    </div>
</template>
<script>
import DoughnutChart from '../DoughnutChart';
import _ from 'lodash';
export default {
    props: {
        input: ''
    },
    name: 'pie-chart',
    components: {
        DoughnutChart
    },
    data() {
        return {
            dataChart: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                cutoutPercentage: 70
            }
        };
    },
    mounted() {
        this.loadData();
    },
    watch: {
        input(newValue) {
            this.loadData();
        }
    },
    methods: {
        async loadData() {
            let rawDataSource = _.filter(this.input.videoObjects, it =>
                this.input.oy.includes(it.class)
            );

            if (this.input.oy === 'color') {
                const temp = [];
                _.each(rawDataSource, obj => {
                    _.each(obj.colors, color => {
                        obj.color = color;
                        temp.push(obj);
                    });
                });
                rawDataSource = temp;
            }

            const dataSource = [];
            const mapData = _.groupBy(
                rawDataSource,
                Array.isArray(this.input.oy) ? 'color' : this.input.oy
            );

            _.each(this.input.items, item => {
                dataSource.push(mapData[item.field] ? mapData[item.field].length : 0);
            });

            const datasets = [
                {
                    data: dataSource,
                    backgroundColor: _.map(this.input.items, it => it.color)
                }
            ];
            this.dataChart = Object.assign({}, this.dataChart, {
                labels: _.map(this.input.items, it => it.name),
                datasets: datasets
            });
        }
    }
};
</script>

<style lang="css">
</style>
