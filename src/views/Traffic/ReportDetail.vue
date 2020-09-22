<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/traffic/report/summary" class="text-nowrap">{{
                        $t('alert.report.summary')
                    }}</b-nav-item>
                    <b-nav-item to="/traffic/report/detail" class="text-nowrap">{{
                        $t('alert.report.detail')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <!-- Báo cáo chi tiết dạng danh sách, cho phép lọc, có thể xuất ra dạng excel -->
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    mounted: function() {
        this.$nextTick(function() {});
    },
    computed: {},
    data() {
        return {};
    },
    methods: {},
    beforeDestroy() {}
};
</script>
