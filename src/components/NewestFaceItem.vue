<template>
    <div class="border">
        <div
            class="case-video-thumbnail ratio-3-4 text-center position-relative border border-gray-500"
            :style="{'background-image': `url(${BASE_URL + event.image.replace(/\/api/g, '')})`}"
        >
            <div style="position:absolute; top:0px; left:0;width: 100%;" class="text-ellipsis">
                <span class="event-text-color font-18">{{ event.text }}</span>
            </div>
            <div style="position:absolute; bottom:0px; left:0;width: 100%;" class="text-ellipsis">
                <span class="event-text-color font-18">{{ display(event.createdAt) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import API_CONFIG from '../api-config';

export default {
    props: {
        event: {
            type: Object
        }
    },
    data() {
        return {
            BASE_URL: API_CONFIG.BASE_URL
        };
    },
    methods: {
        display(date) {
            if (this.$moment(date).isSame(this.$moment(), 'day')) {
                return this.$moment(date).format('HH:mm:ss');
            }
            if (this.$moment(date).isSame(this.$moment(), 'year')) {
                return this.$moment(date).format('DD/MM - HH:mm:ss');
            }
            return this.$moment(date).format('DD/MM/YY');
        }
    }
};
</script>
<style scoped>
.manager-color {
    color: #ffed37;
    background-color: rgba(0, 0, 0, 0.6);
}
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
.text-ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>