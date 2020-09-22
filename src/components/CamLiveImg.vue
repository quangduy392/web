<template>
    <b-img :src="url"></b-img>
</template>

<script>
import CONSTANTS from '@/constants';
export default {
    props: ['liveUrl'],
    name: 'cam-live-img',
    mounted: function() {
        this.$nextTick(function() {
            this.reloadCamInterval = setInterval(() => {
                this.url = this.liveUrl + '&t=' + new Date().getTime();
            }, CONSTANTS.CAM_LIVE_RELOAD_URL);
        });
    },
    data() {
        return {
            url: this.liveUrl + '&t=' + new Date().getTime(),
            reloadCamInterval: null
        };
    },
    beforeDestroy() {
        if (this.reloadCamInterval) {
            clearInterval(this.reloadCamInterval);
        }
    }
};
</script>
