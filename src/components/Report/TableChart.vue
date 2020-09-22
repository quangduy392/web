<template>
    <div>
        <h5 v-line-clamp="1">{{ input.title }}</h5>
        <b-table :items="dataChart" :dark="true" style="height:185px;"></b-table>
    </div>
</template>
<script>
import _ from 'lodash';
import CONSTANTS from '@/constants';
export default {
    props: {
        input: ''
    },
    name: 'table-chart',
    components: {},
    data() {
        return {
            dataChart: []
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
            const listColor = _.map(
                this.input.filterColors,
                color => CONSTANTS.COLOR_FILTERS[color]
            );

            this.dataChart = [];
            _.each(this.input.items, item => {
                const rawData = _.filter(this.input.videoObjects, obj => obj.class === item.field);
                const dataSource = _.countBy(_.flattenDeep(_.map(rawData, it => it.colors)));
                const data = { type: item.field };
                _.each(listColor, (color, i) => {
                    data[color.text] = dataSource[i] ? dataSource[i] : 0;
                });
                this.dataChart.push(data);
            });
        }
    }
};
</script>

<style lang="css">
</style>
