<template>
    <div>
        <h5 v-line-clamp="1">{{ input.title }}</h5>
        <PieChart
            :data="dataChart"
            :options="options"
            :height="200"
            style="height: 200px;"
        ></PieChart>
    </div>
</template>
<script>
import PieChart from '../PieChart';
import _ from 'lodash';
export default {
    props: {
        input: ''
    },
    name: 'pie-chart',
    components: {
        PieChart
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
                }
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
