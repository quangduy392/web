<template>
    <div
        class="justify-content-center align-items-center border"
        :class="{ 'border-info': mouseHoving && !hideTools, 'border-gray-500': !mouseHoving }"
        @mouseover="mouseHoving = true"
        @mouseleave="mouseHoving = false"
    >
        <div
            class="case-video-thumbnail ratio-3-4 text-center position-relative"
            :style="{'background-image': `url(${getUrl()})`}"
        >
            <span class="event-text-color">{{ display(data.date) }}</span>
            <span
                v-if="mouseHoving && !hideTools"
                class="icon-del stranger cursor-pointer"
                v-b-tooltip.hover
                :title="$t('common.delete')"
                @click="$emit('delete')"
            >
                <img
                    src="static/icon/stranger/trash-alt-icon.png"
                    width="15"
                    height="19"
                    alt="delete"
                />
            </span>
            <span
                v-if="mouseHoving && !hideTools"
                class="icon-create-profile cursor-pointer"
                v-b-tooltip.hover
                :title="$t('profile.createProfile')"
                @click="$emit('addNew')"
            >
                <img
                    src="static/icon/stranger/plus-square-icon.png"
                    width="16"
                    height="16"
                    alt="addNew"
                />
            </span>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import API_CONFIG from '@/api-config';

export default {
    props: {
        hideTools: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object
        }
    },
    components: {},
    mounted: function() {
        this.$nextTick(function() {});
    },
    data: function() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            mouseHoving: false
        };
    },
    computed: {
        ...mapState({})
    },
    methods: {
        ...mapActions({}),
        getUrl() {
            return `${API_CONFIG.BASE_URL}${this.data.image}`;
        },
        display(date) {
            if (this.$moment(date).isSame(this.$moment(), 'day')) {
                return this.data.time;
            }
            if (this.$moment(date).isSame(this.$moment(), 'year')) {
                return this.$moment(date).format('DD/MM') + ' ' + this.data.time;
            }
            return this.$moment(date).format('DD/MM/YYYY');
        }
    }
};
</script>
<style lang="scss" scoped>
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
</style>
