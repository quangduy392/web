<template>
    <div>
        <h5 v-line-clamp="1">{{title}}</h5>
        <b-table
            :items="items"
            :dark="true"
            :height="200"
            :style="{height: reportBodyHeight+'px'}"
            :fields="fields"
            show-empty
            striped
            hover
            :emptyText="$t('attendanceCamera.noData')"
        >
            <template slot="hour" slot-scope="data">{{data.item.hour+'h'}}</template>
            <template slot="date" slot-scope="data">{{data.item.date| formatDate}}</template>
        </b-table>
    </div>
</template>
<script>
export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        items: {
            type: Array,
            default: () => []
        },
        fields: {
            type: Array,
            default: () => []
        },
        reportBodyHeight: {
            type: Number,
            default: 0
        }
    }
};
</script>