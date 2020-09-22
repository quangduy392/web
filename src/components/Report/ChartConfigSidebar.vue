<template>
    <div class="border-left border-gray-500 h-100
            d-flex flex-column justify-content-between
            text-gray-300">
        <div class="objects-filter-sidebar_filter-container h-100 overflow-y-auto">
            <b-form-group label="Tên biểu đồ">
                <b-input placeholder="Tên biểu đồ"></b-input>
            </b-form-group>
            <b-form-group label="Độ rộng">
                <b-input placeholder="Độ rộng (1-12)"></b-input>
            </b-form-group>
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-top border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 p-2 text-gray-300"
                text="Danh sách phần tử"
            >
                <b-button variant="primary"><i class="fa fa-plus mr-1"/>Thêm</b-button>
                <ChartElement/>
            </b-dropdown>
        </div>

        <div class="d-flex border-top border-gray-500">
            <div class="flex-1 text-center p-2 border-left border-right border-gray-500 filter-preset-btn active">
                <i class="fa fa-floppy-o" aria-hidden="true"></i><br />
                <span class="font-10">Lưu</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ChartElement from '@/components/Report/ChartElement';

export default {
    name: 'chart-config-sidebar',
    components: { ChartElement },
    mounted: function() {
        this.$nextTick(async function() {});
    },
    props: {},
    data() {
        return {};
    },
    computed: {
        ...mapState({})
    },
    watch: {},
    methods: {
        ...mapActions({})
    }
};
</script>