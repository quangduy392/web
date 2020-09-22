<template>
    <div
        class="justify-content-center align-items-center border"
        :class="{ 'border-info': mouseHoving && !hideTools, 'border-gray-500': !mouseHoving }"
        @mouseover="mouseHoving = true"
        @mouseleave="mouseHoving = false"
    >
        <div
            class="case-video-thumbnail text-center position-relative"
            :style="{'background-image': `url(${getUrl()})`, 'padding-top': '87%'}"
        >
            <span class="event-text-color">{{ data.name }}</span>
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
    data: function() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            mouseHoving: false
        };
    },
    methods: {
        getUrl() {
            return `${this.BASE_URL}profile-files/${this.data.id}/portrait`;
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
