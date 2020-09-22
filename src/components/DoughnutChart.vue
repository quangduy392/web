<script>
import { Doughnut } from 'vue-chartjs';

export default {
    extends: Doughnut,
    props: ['data', 'options'],
    mounted() {
        this.renderChart(this.data, this.options);
    },
    watch: {
        data: function() {
            this.$data._chart.destroy();
            this.renderChart(this.data, this.options);
        }
    }
};
</script>
