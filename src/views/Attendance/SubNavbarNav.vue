<template>
    <b-navbar-nav class="d-flex flex-row">
        <b-nav-item
            active
            class="text-nowrap"
            to="/attendance/camera"
        >{{ $t('attendanceCommon.commonTitle') }}</b-nav-item>
        <b-nav-item
            class="text-nowrap"
            to="/attendance/detailtoday"
        >{{ $t('attendanceCommon.detailtoday') }}</b-nav-item>
    </b-navbar-nav>
</template>

<script>
export default {};
</script>

<style scoped>
</style>
