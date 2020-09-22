<template>
    <div>
        <h5 v-line-clamp="1">{{title}}</h5>
        <BarChart
            :data="dataChart"
            :options="options"
            :height="reportBodyHeight"
            :style="{height: `${reportBodyHeight}px`}"
        ></BarChart>
    </div>
</template>
<script>
import BarChart from '../BarChart';
export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        reportBodyHeight: {
            type: Number,
            default: 0
        },
        dataChart: {
            type: Object,
            default: () => {}
        },
        options: {
            type: Object,
            default: () => {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [
                            {
                                maxBarThickness: '30',
                                minBarLength: 2
                            }
                        ]
                    }
                };
            }
        }
    },
    components: {
        BarChart
    }
};
</script>