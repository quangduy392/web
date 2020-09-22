<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>
                        {{ $t('trafficMonitor.commonTitle') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <!-- Bản đồ GIS, hiển thị tình hình giao thông -->
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
