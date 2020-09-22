<template>
    <div>
        <div
            class="chart-item-image ratio-16-9 rounded"
            :class="{ 'border-info': hover, 'border-gray-500': !hover }"
            @mouseover="hover = true"
            @mouseleave="hover = false"
            style="background-image:url(https://demo531.briefcam.com/ProWebApiStorage_Distributed/Blobs/Backgrounds/649.jpg); border: 1px solid"
        ></div>
        <span>{{ chart.title }}</span>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['chart'],
    data() {
        return {
            hover: false
        };
    },
    methods: {}
};
</script>

<style scoped>
.chart-item-image {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}
</style>
