<template>
    <div>
        <h5 v-line-clamp="1">{{$t('report.listLate')}}</h5>
        <b-table
            :items="items"
            :dark="true"
            :height="200"
            style="height: 271px;"
            :fields="fields"
            show-empty
            striped
            hover
            emptyText="Không có dữ liệu"
        ></b-table>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import moment from 'moment-timezone';

export default {
    name: 'list-late',
    props: {
        filterCondition: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            items: []
        };
    },
    computed: {
        fields() {
            return [
                {
                    key: 'name',
                    label: this.$t('common.name')
                },
                {
                    key: 'group',
                    label: this.$t('report.group')
                },
                {
                    key: 'totalLate',
                    label: this.$t('report.numberLate'),
                    thStyle: { width: '120px' },
                    tdClass: 'text-center'
                }
            ];
        }
    },
    methods: {
        ...mapActions({
            getTopLate: 'summaryReport/getTopLate'
        }),
        async getData() {
            this.items = await this.getTopLate({
                from: moment(this.filterCondition.startDate).format('YYYY-MM-DD'),
                to: moment(this.filterCondition.endDate).format('YYYY-MM-DD'),
                late: '08:00:00',
                count: 5
            });
        }
    },
    mounted() {
        this.getData();
    },
    watch: {
        'filterCondition.startDate'() {
            this.getData();
        },
        'filterCondition.endDate'() {
            this.getData();
        }
    }
};
</script>